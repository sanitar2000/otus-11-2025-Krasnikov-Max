const { test, expect } = require('@playwright/test');
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs').promises;

const USERNAME = 'Kovpak';
const PASSWORD = 'Kovpak11';
const BROWSER_PATH = 'D:/chromium-gost/chrome.exe';  
const DOWNLOAD_PATH = path.join(process.cwd(), 'downloads');

let context;
let page;

test.beforeAll(async () => {
    await fs.mkdir(DOWNLOAD_PATH, { recursive: true });
    console.log(`📁 Папка загрузок: ${DOWNLOAD_PATH}`);
    context = await chromium.launchPersistentContext('', {
        executablePath: BROWSER_PATH,
        headless: false,
        viewport: { width: 1280, height: 720 },
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-first-run',
        ],
        acceptDownloads: true,
    });
    page = context.pages()[0] || await context.newPage();
    console.log('✅ Браузер запущен');
});

test.afterAll(async () => {
    await context?.close();
});

test.describe('E2E: Создание партии продуктов переработки и подписание (мок API)', () => {
    let loginPage, dashboardPage, gpbLotsRegistryPage, createGpbLotPage;

    test.beforeEach(async () => {
        
        const { LoginPage } = require('./pages/LoginPage');
        const { DashboardPage } = require('./pages/DashboardPage');
        const { GpbLotsRegistryPage } = require('./pages/GpbLotsRegistryPage');
        const { CreateGpbLotFromLotPage } = require('./pages/CreateGpbLotFromLotPage');

        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
        gpbLotsRegistryPage = new GpbLotsRegistryPage(page);
        createGpbLotPage = new CreateGpbLotFromLotPage(page);

        await loginPage.goto();
        await loginPage.login(USERNAME, PASSWORD);
        await dashboardPage.expectDashboardUrl();
        await dashboardPage.closeModalsIfPresent();
    });

    test('Создать партию продуктов переработки, подписать (мок)', async () => {
        // 1. Открыть реестр партий продуктов переработки
        await gpbLotsRegistryPage.openGpbRegistry();

        // 2. Выбрать статус "Подписано"
        await gpbLotsRegistryPage.filterByStatus();  

        // 3. Нажать "Поиск" и дождаться загрузки таблицы
        await gpbLotsRegistryPage.clickSearch();

        // 4. Выбрать случайную партию с текущей массой > 10 кг
        const selectedLotId = await gpbLotsRegistryPage.selectRandomLotWithCurrentMassGreaterThan(10);
        console.log(`Исходная партия продуктов переработки ID: ${selectedLotId}`);

        // 5. Нажать "Еще" → "Сформировать партию переработки из партии"
        await createGpbLotPage.openCreateFromLotForm();

        // 6. Заполнить массу = 1 и нажать "Сформировать"
        await createGpbLotPage.fillMass('1');
        await createGpbLotPage.clickCreate();

        // 7. Дождаться редиректа на страницу новой партии и получить её ID
        await page.waitForURL(/\/lots\/gpb\/\d+/, { timeout: 15000 });
        const newLotId = page.url().match(/\/lots\/gpb\/(\d+)/)[1];
        console.log(`✅ Создана новая партия продуктов переработки ID: ${newLotId}`);
        await expect(page.locator('.v-chip__content:has-text("Создано")')).toBeVisible({ timeout: 10000 });

        // 8. Перехватываем запрос на сохранение подписи (POST /api/lot/signature/save)
        await page.route('/api/lot/signature/save', async route => {
            console.log('🔄 Перехвачен POST /api/lot/signature/save → 200 OK');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: true })
            });
        });

        // 9. Перехватываем ЛЮБОЙ запрос к API получения данных партии продуктов переработки
        //    и подменяем статус на "SUBSCRIBED"
        await page.route(/\/api\/gpb\/show\/\d+/, async route => {
            const url = route.request().url();
            console.log(`🔄 Перехвачен GET ${url}, подменяем статус на SUBSCRIBED`);
            const response = await route.fetch();       // получаем оригинальный ответ
            let json = await response.json();
            // Устанавливаем статус "SUBSCRIBED" (Подписано)
            if (json.response) {
                json.response.status = "SUBSCRIBED";
            } else {
                json.status = "SUBSCRIBED";
            }
            await route.fulfill({
                status: response.status(),
                contentType: response.headers()['content-type'],
                body: JSON.stringify(json)
            });
        });

        // 10. Нажать кнопку "Подписать"
        await createGpbLotPage.clickSign();

        // 11. Даём время на отправку запросов 
        await page.waitForTimeout(2000);

        // 12. Перезагружаем страницу – теперь фронтенд запросит данные партии,
        //     наш мок подставит статус "Подписано"
        await page.reload();

        // 13. Проверяем, что статус партии изменился на "Подписано"
        await expect(page.locator('.v-chip__content:has-text("Подписано")')).toBeVisible({ timeout: 15000 });
        console.log('✅ Новая партия продуктов переработки подписана (мок API)');
    });
});