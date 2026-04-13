const { expect } = require('@playwright/test');

class LoginPage {
  constructor(page) {
    this.page = page;
    // Локаторы
    this.loginInput = page.locator('[placeholder="Введите логин"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.error');
    this.validationMessages = page.locator('.validation-message');
  }

  async goto() {
    await this.page.goto('https://preprod-zerno.mcx.gov.ru/login');
  }

  async clearFields() {
    await this.loginInput.clear();
    await this.passwordInput.clear();
  }

  async fillLogin(login) {
    await this.loginInput.fill(login);
  }

  async fillPassword(password) {
    await this.passwordInput.fill(password);
  }

  async submit() {
    await this.submitButton.click();
  }

  async login(login, password) {
    await this.clearFields();
    await this.fillLogin(login);
    await this.fillPassword(password);
    await this.submit();
  }

  async expectErrorText(expectedText) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expectedText);
  }

  async expectValidationMessage(expectedText) {
    // Берём первый элемент, т.к. их может быть два
    const firstMsg = this.validationMessages.first();
    await expect(firstMsg).toBeVisible();
    await expect(firstMsg).toContainText(expectedText);
  }

  async expectLoginUrl() {
    await expect(this.page).toHaveURL('https://preprod-zerno.mcx.gov.ru/login');
  }
}

module.exports = { LoginPage };