const { I } = inject();
const assert = require('assert');

class DashboardPage {
  constructor() {
    this.welcomeButton = locate('button').withText('Понятно');
    this.warningPopup = '//*[text()="Предупреждение"]';
    this.warningCloseIcon = '.v-card__title svg';
    this.dashboardText = '.col.col-12';
    this.navMenu = 'div.v-expansion-panels';
    this.menuTitles = '.sidebar-menu__title';
    this.userWrapper = '.user-info__wrapper';
    this.userName = '.user';
    this.logoutButton = 'img[src*="log_out"]';
    this.mainContent = 'main, .content, .dashboard-container, .v-main';
  }

  async closeModalsIfPresent() {
    const hasWelcomeButton = await I.grabNumberOfVisibleElements(this.welcomeButton) > 0;
    if (hasWelcomeButton) {
      I.click(this.welcomeButton);
      I.wait(2);
    }
    const hasWarning = await I.grabNumberOfVisibleElements(this.warningPopup) > 0;
    if (hasWarning) {
      I.click(this.warningCloseIcon);
    }
  }

  async seeDashboardUrl() {
    I.seeInCurrentUrl('/home');
  }

  async seeDashboardContent() {
    const text = await I.grabTextFrom(this.dashboardText);
    assert.ok(text.toLowerCase().includes('личный кабинет'), 'Не найден "Личный кабинет"');
    assert.ok(text.toLowerCase().includes('товаропроизводителя'), 'Не найден "Товаропроизводителя"');
  }

  async seeNavMenu() {
    I.seeElement(this.navMenu);
  }

  async seeMenuItems() {
    I.seeElement(this.menuTitles);
    const count = await I.grabNumberOfVisibleElements(this.menuTitles);
    assert.ok(count > 0, 'Меню должно содержать пункты');
  }

  async seeUserInfo() {
    I.seeElement(this.userWrapper);
    I.seeElement(this.userName);
    const userNameText = await I.grabTextFrom(this.userName);
    assert.ok(userNameText.trim().length > 0, 'Имя пользователя не должно быть пустым');
  }

  async seeLogoutButton() {
    I.waitForElement(this.logoutButton, 10);
    I.seeElement(this.logoutButton);
  }

  async seeMainContent() {
    I.seeElement(this.mainContent);
  }

  async logout() {
    I.waitForElement(this.logoutButton, 10);
    I.scrollTo(this.logoutButton);
    I.click(this.logoutButton);
  }

  async seeRedirectToLogin() {
    I.seeInCurrentUrl('/login');
  }
}

module.exports = new DashboardPage();