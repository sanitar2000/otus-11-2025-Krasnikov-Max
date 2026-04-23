const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { DashboardPage } = require('./pages/DashboardPage');
const { LotsRegistryPage } = require('./pages/LotsRegistryPage');

const USERNAME = 'Kovpak';
const PASSWORD = 'Kovpak11';
const MIN_MASS = 10; // минимальная масса в кг

test.describe('Работа с реестром партий зерна', () => {
  let loginPage;
  let dashboardPage;
  let lotsRegistryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    lotsRegistryPage = new LotsRegistryPage(page);

    await loginPage.goto();
    await loginPage.login(USERNAME, PASSWORD);
    await dashboardPage.expectDashboardUrl();
    await dashboardPage.closeModalsIfPresent();
  });

  test('Выбрать случайную партию с массой > 10 кг (через UI таблицу)', async () => {
    // 1. Открыть реестр партий
    await lotsRegistryPage.openLotsRegistry();

    // 2. Выбрать статус "Подписано"
    await lotsRegistryPage.filterByStatus();

    // 3. Нажать "Поиск" и дождаться загрузки таблицы
    await lotsRegistryPage.clickSearch();

    // 4. Выбрать случайную партию с текущей массой > MIN_MASS и кликнуть по ней
    const selectedLotId = await lotsRegistryPage.selectRandomLotWithMassGreaterThan(MIN_MASS);
    console.log(`Выбрана партия ID: ${selectedLotId}`);

    // 5. Проверить, что открылась страница партии
    await expect(lotsRegistryPage.page).toHaveURL(new RegExp(`/lots/${selectedLotId}`));
  });
});