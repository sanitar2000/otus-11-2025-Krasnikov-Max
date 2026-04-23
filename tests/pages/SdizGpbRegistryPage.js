const { expect } = require('@playwright/test');

class SdizGpbRegistryPage {
  constructor(page) {
    this.page = page;

    // Локаторы
    this.sdizGpbMenuButton = page.getByRole('button', { name: 'Управление СДИЗ продуктов переработки', exact: true });
    this.registryLink = page.locator('a.sidebar-menu__link:has-text("Реестр СДИЗ продуктов переработки")');
    
    this.statusDropdown = page.locator('input[placeholder="Выберите статус СДИЗ"]');
    this.searchButton = page.getByText('Поиск');
   
    this.tableRows = page.locator('.v-data-table__wrapper tbody tr');
    this.viewLinkInRow = (row) => row.locator('td:first-child a[href^="/sdizs-gpb/show/"]');
  }

  async openSdizGpbRegistry() {
    await this.sdizGpbMenuButton.click();
    await expect(this.registryLink).toBeVisible();
    await this.registryLink.click();
    await expect(this.page).toHaveURL(/\/sdizs-gpb\/list/);
  }

  async filterByStatus(status) {
    await this.statusDropdown.click();
    const option = this.page.getByRole('option', { name: status, exact: true });
    await option.waitFor({ state: 'visible', timeout: 5000 });
    await option.click();
  }

  async clickSearch() {
    await this.searchButton.click();
  }
  
 /**
   * Перехватывает ответ API. endpoints:  /api/sdiz/list
   */
  async getSdizGpbListFromApi() {
    const responsePromise = this.page.waitForResponse(
      resp => resp.url().includes('/api/sdiz/gpb/list') && resp.status() === 200,
      { timeout: 15000 }
    );
    await this.clickSearch();
    const response = await responsePromise;
    const data = await response.json();
    console.log(`API URL: ${response.url()}, количество записей: ${data.response?.length || 0}`);
    return data.response || [];
  }

  selectRandomSdizGpb(sdizList) {
    if (sdizList.length === 0) {
      throw new Error('Список СДИЗ продуктов переработки пуст');
    }
    const randomIndex = Math.floor(Math.random() * sdizList.length);
    return sdizList[randomIndex];
  }

  async clickOnSdizById(sdizId) {
    const row = this.page.locator(`tr:has-text("${sdizId}")`).first();
    await row.waitFor({ state: 'visible', timeout: 10000 });
    await row.scrollIntoViewIfNeeded();
    await this.viewLinkInRow(row).click();
  }

  async getStatusFromCard() {
    const statusChip = this.page.locator('.v-chip__content').first();
    await statusChip.waitFor({ state: 'visible', timeout: 10000 });
    const statusText = await statusChip.textContent();
    return statusText.trim();
  }
}

module.exports = { SdizGpbRegistryPage };