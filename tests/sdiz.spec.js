const { test, expect } = require('@playwright/test');
const { LoginPage } = require('./pages/LoginPage');
const { DashboardPage } = require('./pages/DashboardPage');
const { SdizRegistryPage } = require('./pages/SdizRegistryPage');

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

test.describe('Работа с реестром СДИЗ', () => {
  let loginPage;
  let dashboardPage;
  let sdizRegistryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    sdizRegistryPage = new SdizRegistryPage(page);

    await loginPage.goto();
    await loginPage.login(USERNAME, PASSWORD);
    await dashboardPage.expectDashboardUrl();
    await dashboardPage.closeModalsIfPresent();
  });

  for (const status of statuses) {
    test(`Выбрать случайный СДИЗ со статусом "${status}" и проверить его`, async () => {
      await sdizRegistryPage.openSdizRegistry();
      await sdizRegistryPage.filterByStatus(status);

      // Получаем список СДИЗ через API
      const sdizList = await sdizRegistryPage.getSdizListFromApi();

      // Фильтруем по status_id, используя обратный маппинг
      const targetStatusId = Object.keys(statusMap).find(key => statusMap[key] === status);
      const filteredList = sdizList.filter(item => item.status_id === parseInt(targetStatusId));

      if (filteredList.length === 0) {
        throw new Error(`Нет СДИЗ со статусом "${status}" (status_id = ${targetStatusId})`);
      }

      const selected = sdizRegistryPage.selectRandomSdiz(filteredList);
      const statusName = statusMap[selected.status_id];
      console.log(`Выбран СДИЗ ID: ${selected.id}, номер: ${selected.number || selected.sdiz_number}, статус: ${statusName}`);

      await sdizRegistryPage.clickOnSdizById(selected.id);
      const actualStatus = await sdizRegistryPage.getStatusFromCard();
      expect(actualStatus).toBe(status);
    });
  }
});