const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { DashboardPage } = require('./pages/DashboardPage');
const { GpbLotsRegistryPage } = require('./pages/GpbLotsRegistryPage');

const USERNAME = 'Kovpak';
const PASSWORD = 'Kovpak11';
const MIN_MASS = 3; // минимальная масса в кг

test.describe('Работа с реестром партий продуктов переработки зерна', () => {
  let loginPage;
  let dashboardPage;
  let gpbLotsRegistryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    gpbLotsRegistryPage = new GpbLotsRegistryPage(page);

    await loginPage.goto();
    await loginPage.login(USERNAME, PASSWORD);
    await dashboardPage.expectDashboardUrl();
    await dashboardPage.closeModalsIfPresent();
  });

  test('Выбрать случайную партию продуктов переработки с массой > 3 кг (через UI таблицу)', async () => {
    // 1. Открыть реестр партий продуктов переработки
    await gpbLotsRegistryPage.openGpbRegistry();

    // 2. Выбрать статус "Подписано"
    await gpbLotsRegistryPage.filterByStatus();

    // 3. Нажать "Поиск" и дождаться загрузки таблицы
    await gpbLotsRegistryPage.clickSearch();

    // 4. Выбрать случайную партию с текущей массой > MIN_MASS и перейти на её страницу
    const selectedLotId = await gpbLotsRegistryPage.selectRandomLotWithCurrentMassGreaterThan(MIN_MASS);
    console.log(`Выбрана партия ID: ${selectedLotId}`);

    // 5. Проверить, что открылась страница партии продуктов переработки
    await expect(gpbLotsRegistryPage.page).toHaveURL(new RegExp(`/lots/gpb/${selectedLotId}`));
  });
});