const { expect } = require('@playwright/test');

class DashboardPage {
  constructor(page) {
    this.page = page;
    // Локаторы
    this.welcomeButton = page.getByRole('button', { name: 'Понятно' });
    this.warningPopup = page.getByText('Предупреждение');
    this.warningCloseIcon = page.locator('.v-card__title svg');
    this.dashboardText = page.locator('.col.col-12');
    this.navMenu = page.locator('div.v-expansion-panels');
    this.menuTitles = page.locator('.sidebar-menu__title');
    this.userWrapper = page.locator('.user-info__wrapper');
    this.userName = page.locator('.user');
    this.logoutButton = page.locator('img[src*="log_out"]');
    this.mainContent = page.locator('main, .content, .dashboard-container, .v-main');
  }

  async closeModalsIfPresent() {
    if (await this.welcomeButton.isVisible()) {
      await this.welcomeButton.click();
      // Ждём, пока появится текст "Предупреждение"
      await this.warningPopup.waitFor({ state: 'visible', timeout: 5000 });
    }
    if (await this.warningPopup.isVisible()) {
      await this.warningCloseIcon.click();
    }
  }

  async expectDashboardUrl() {
    await expect(this.page).toHaveURL('https://preprod-zerno.mcx.gov.ru/home');
  }

  async expectDashboardContent() {
    await expect(this.dashboardText).toContainText(['Личный кабинет', 'Товаропроизводителя']);
  }

  async expectNavMenuVisible() {
    await expect(this.navMenu).toBeVisible();
  }

  async expectMenuItemsPresent() {
    await expect(this.menuTitles.first()).toBeVisible();
    const count = await this.menuTitles.count();
    expect(count).toBeGreaterThan(0);
  }

  async expectUserInfoVisible() {
    await expect(this.userWrapper).toBeVisible();
    await expect(this.userName).toBeVisible();
    await expect(this.userName).not.toBeEmpty();
    // Проверка, что имя пользователя содержит ожидаемый текст
    await expect(this.userName).toContainText(/СИДОР КОВПАК|Kovpak/i);
  }

  async expectLogoutButtonVisible() {
    await expect(this.logoutButton).toBeVisible();
    await expect(this.logoutButton).toBeEnabled();
  }

  async expectMainContentVisible() {
    await expect(this.mainContent).toBeVisible();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async expectRedirectToLogin() {
    await expect(this.page).toHaveURL('https://preprod-zerno.mcx.gov.ru/login');
  }
}

module.exports = { DashboardPage };