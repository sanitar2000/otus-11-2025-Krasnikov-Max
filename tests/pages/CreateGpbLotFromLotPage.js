const { expect } = require('@playwright/test');

class CreateGpbLotFromLotPage {
  constructor(page) {
    this.page = page;
    this.moreButton = page.locator('button:has-text("Еще")');
    this.menuItem = page.locator('div[role="menuitem"]:has-text("Сформировать партию переработки из партии")');
    this.formTitle = page.locator('span.title:has-text("Формирование партии продуктов переработки зерна из других партий")');
    // Точный текст, чтобы избежать нескольких элементов
    this.massLabel = page.getByText('Введите массу партии');
    this.createButton = page.locator('button:has-text("Сформировать")');
    this.signButton = page.locator('button:has-text("Подписать")');
  }

  async openCreateFromLotForm() {
    await this.moreButton.click();
    await this.menuItem.click();
    await expect(this.formTitle).toBeVisible({ timeout: 10000 });
  }

  async fillMass(mass) {
    // Клик по тексту, чтобы активировать поле ввода
    await this.massLabel.click();
    // После клика ищем поле ввода с placeholder "Введите массу"
    const input = this.page.locator('input[placeholder="Введите массу"]');
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(mass);
    // Клик в пустое пространство, чтобы сработала валидация
    await this.page.locator('body').click();
  }

  async clickCreate() {
    await expect(this.createButton).toBeEnabled({ timeout: 5000 });
    await this.createButton.click();
  }

  async clickSign() {
    await expect(this.signButton).toBeEnabled();
    await this.signButton.click();
  }
}

module.exports = { CreateGpbLotFromLotPage };