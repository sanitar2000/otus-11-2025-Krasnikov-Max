const { I } = inject();

class LoginPage {
  constructor() {
    this.loginField = '[placeholder="Введите логин"]';
    this.passwordField = 'input[type="password"]';
    this.submitButton = 'button[type="submit"]';
    this.errorMessage = '.error';
    this.validationMessages = '.validation-message';
  }

  async goto() {
    I.amOnPage('/login');
  }

  async clearFields() {
    I.clearField(this.loginField);
    I.clearField(this.passwordField);
  }

  async fillLogin(login) {
    I.fillField(this.loginField, login);
  }

  async fillPassword(password) {
    I.fillField(this.passwordField, password);
  }

  async submit() {
    I.click(this.submitButton);
  }

  async login(login, password) {
    await this.clearFields();
    await this.fillLogin(login);
    await this.fillPassword(password);
    await this.submit();
  }

  async seeErrorText(expectedText) {
    I.seeElement(this.errorMessage);
    I.see(expectedText, this.errorMessage);
  }

  async seeValidationMessage(expectedText) {
    I.seeElement(this.validationMessages);
    const firstMsg = locate(this.validationMessages).first();
    I.see(expectedText, firstMsg);
  }

  async seeLoginUrl() {
    I.seeInCurrentUrl('/login');
  }
}

module.exports = new LoginPage();