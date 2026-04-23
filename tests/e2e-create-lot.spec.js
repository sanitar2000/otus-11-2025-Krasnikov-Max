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

test.describe('E2E: Создание партии и подписание документа (мок API)', () => {
    let loginPage, dashboardPage, lotsRegistryPage, createLotPage;

    test.beforeEach(async () => {
        const { LoginPage } = require('./pages/LoginPage');
        const { DashboardPage } = require('./pages/DashboardPage');
        const { LotsRegistryPage } = require('./pages/LotsRegistryPage');
        const { CreateLotFromLotPage } = require('./pages/CreateLotFromLotPage');

        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);
        lotsRegistryPage = new LotsRegistryPage(page);
        createLotPage = new CreateLotFromLotPage(page);

        await loginPage.goto();
        await loginPage.login(USERNAME, PASSWORD);
        await dashboardPage.expectDashboardUrl();
        await dashboardPage.closeModalsIfPresent();
    });

    test('Создать партию, подписать (мок ответов сервера)', async () => {
        // 1. Открыть реестр партий и выбрать случайную партию с массой >10 кг
        await lotsRegistryPage.openLotsRegistry();
        await lotsRegistryPage.filterByStatus();         // статус "Подписано"
        await lotsRegistryPage.clickSearch();
        const selectedLotId = await lotsRegistryPage.selectRandomLotWithMassGreaterThan(10);
        console.log(`Исходная партия ID: ${selectedLotId}`);

        // 2. Сформировать новую партию
        await createLotPage.openCreateFromLotForm();
        await createLotPage.fillMass('1');
        await createLotPage.clickCreate();

        // 3. Дождаться редиректа на страницу новой партии и получить её ID
        await page.waitForURL(/\/lots\/\d+/, { timeout: 15000 });
        const newLotId = page.url().match(/\/lots\/(\d+)/)[1];
        console.log(`✅ Создана новая партия ID: ${newLotId}`);
        await expect(page.locator('.v-chip__content:has-text("Создано")')).toBeVisible({ timeout: 10000 });

        // 4. Перехватываем запрос на сохранение подписи (возвращаем успех)
        await page.route('/api/lot/signature/save', async route => {
            console.log('🔄 Перехвачен POST /api/lot/signature/save → 200 OK');
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ status: true })
            });
        });

        // 5. Перехватываем ЛЮБОЙ запрос к API получения данных партии
        //    и подменяем в ответе статус на "SUBSCRIBED"
        await page.route(/\/api\/lot\/show\/\d+/, async route => {
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

        // 6. Нажать кнопку "Подписать" – откроется модальное окно, запросы будут перехвачены
        await createLotPage.clickSign();

        // 7. Даём время на отправку запросов
        await page.waitForTimeout(2000);

        // 8. Перезагружаем страницу – теперь фронтенд запросит данные партии,
        //    наш мок подставит статус "Подписано"
        await page.reload();

        // 9. Проверяем, что статус партии изменился на "Подписано"
        await expect(page.locator('.v-chip__content:has-text("Подписано")')).toBeVisible({ timeout: 15000 });
        console.log('✅ Новая партия подписана (мок API)');
    });
});