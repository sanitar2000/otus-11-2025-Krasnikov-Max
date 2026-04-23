const { expect } = require('@playwright/test');

class LotsRegistryPage {
  constructor(page) {
    this.page = page;
    this.grainManagementButton = page.getByRole('button', { name: 'Управление партиями зерна', exact: true });
    this.registryLink = page.locator('a.sidebar-menu__link:has-text("Реестр партий зерна")');
    this.statusDropdown = page.locator('input[placeholder="Выберите статус"]');
    this.statusOption = page.locator('div[role="option"]:has-text("Подписано")');
    this.searchButton = page.getByText('Поиск');
    this.tableRows = page.locator('.v-data-table__wrapper tbody tr');
    // Столбец "Текущая масса, кг" – индекс 10 (11-й столбец)
    this.currentMassCell = (row) => row.locator('td').nth(10);
    this.idCell = (row) => row.locator('td').nth(1);
    this.viewLinkInRow = (row) => row.locator('td:first-child a');
  }

  async openLotsRegistry() {
    await this.grainManagementButton.click();
    await expect(this.registryLink).toBeVisible();
    await this.registryLink.click();
    await expect(this.page).toHaveURL(/\/lots\/list/);
  }

  async filterByStatus() {
    await this.statusDropdown.click();
    await this.statusOption.click();
  }

  async clickSearch() {
    await this.searchButton.click();
    const progressBar = this.page.locator('.v-data-table__wrapper .v-progress-linear');
    if (await progressBar.isVisible().catch(() => false)) {
      await progressBar.waitFor({ state: 'hidden', timeout: 10000 });
    }
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForLoadState('networkidle');
  }

  async scrollTableToLoadAllRows() {
    const tableContainer = this.page.locator('.v-data-table__wrapper');
    await tableContainer.evaluate(async (container) => {
      return new Promise((resolve) => {
        let lastScrollTop = -1;
        const scrollStep = () => {
          container.scrollTop = container.scrollHeight;
          if (container.scrollTop === lastScrollTop) {
            resolve();
          } else {
            lastScrollTop = container.scrollTop;
            setTimeout(scrollStep, 300);
          }
        };
        scrollStep();
      });
    });
  }

  async getAllRowsWithMass() {
    await this.tableRows.first().waitFor({ state: 'visible', timeout: 10000 });
    await this.scrollTableToLoadAllRows();
    const rows = await this.tableRows.all();
    console.log(`📊 Найдено строк после прокрутки: ${rows.length}`);
    const result = [];
    for (const row of rows) {
      const massText = await this.currentMassCell(row).textContent();
      const cleaned = massText.trim().replace(/\s/g, '').replace(',', '.');
      const mass = parseFloat(cleaned);
      if (!isNaN(mass)) {
        const idText = await this.idCell(row).textContent();
        result.push({ row, mass, id: idText.trim() });
        console.log(`✅ Партия ID=${idText.trim()}, масса=${mass}`);
      } else {
        console.warn(`⚠️ Не удалось распарсить массу: "${massText}" -> "${cleaned}"`);
      }
    }
    console.log(`📊 Отфильтровано строк с корректной массой: ${result.length}`);
    return result;
  }

  async selectRandomLotWithMassGreaterThan(minMass = 10) {
    const rowsData = await this.getAllRowsWithMass();
    const filtered = rowsData.filter(item => item.mass > minMass);
    if (filtered.length === 0) {
      throw new Error(`Нет партий с текущей массой > ${minMass} кг`);
    }
    const randomIndex = Math.floor(Math.random() * filtered.length);
    const selected = filtered[randomIndex];
    console.log(`🎲 Выбрана партия ID=${selected.id}, текущая масса=${selected.mass}`);
    await selected.row.scrollIntoViewIfNeeded();
    await this.viewLinkInRow(selected.row).click();
    return selected.id;
  }
}

module.exports = { LotsRegistryPage };