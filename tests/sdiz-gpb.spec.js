const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { DashboardPage } = require('./pages/DashboardPage');
const { SdizGpbRegistryPage } = require('./pages/SdizGpbRegistryPage');

const USERNAME = 'Kovpak';
const PASSWORD = 'Kovpak11';

// Маппинг status_id -> русское название
const statusMap = {
  2: 'Оформлен',
  3: 'Погашен',
  4: 'Аннулирован'
};

// Список русских статусов для тестирования
const statuses = ['Оформлен', 'Погашен', 'Аннулирован'];

test.describe('Работа с реестром СДИЗ продуктов переработки', () => {
  let loginPage;
  let dashboardPage;
  let sdizGpbRegistryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    sdizGpbRegistryPage = new SdizGpbRegistryPage(page);

    await loginPage.goto();
    await loginPage.login(USERNAME, PASSWORD);
    await dashboardPage.expectDashboardUrl();
    await dashboardPage.closeModalsIfPresent();
  });

  for (const status of statuses) {
    test(`Выбрать случайный СДИЗ продуктов переработки со статусом "${status}" и проверить его`, async () => {
      await sdizGpbRegistryPage.openSdizGpbRegistry();
      await sdizGpbRegistryPage.filterByStatus(status);

      const sdizList = await sdizGpbRegistryPage.getSdizGpbListFromApi();

      const targetStatusId = Object.keys(statusMap).find(key => statusMap[key] === status);
      const filteredList = sdizList.filter(item => item.status_id === parseInt(targetStatusId));

      if (filteredList.length === 0) {
        throw new Error(`Нет СДИЗ продуктов переработки со статусом "${status}" (status_id = ${targetStatusId})`);
      }

      const selected = sdizGpbRegistryPage.selectRandomSdizGpb(filteredList);
      const statusName = statusMap[selected.status_id];
      console.log(`Выбран СДИЗ ID: ${selected.id}, номер: ${selected.number || selected.sdiz_number}, статус: ${statusName}`);

      await sdizGpbRegistryPage.clickOnSdizById(selected.id);
      const actualStatus = await sdizGpbRegistryPage.getStatusFromCard();
      expect(actualStatus).toBe(status);
    });
  }
});