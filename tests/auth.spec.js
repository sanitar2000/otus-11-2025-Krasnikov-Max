const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { LoginPage } = require('./pages/LoginPage');
const { DashboardPage } = require('./pages/DashboardPage');

// Тестовые данные
const USERNAME = 'Kovpak';
const PASSWORD = 'Kovpak11';
const WRONG_PASSWORD = 'WrongPass123';

// Пути к профилю
const ORIGINAL_PROFILE_DIR = path.join(os.homedir(), 'AppData', 'Local', 'Yandex', 'YandexBrowser', 'User Data');

let context = null;
let tempProfileDir = null;

test.beforeEach(async ({ playwright }) => {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  tempProfileDir = path.join(__dirname, '..', `temp-profile-${uniqueId}`);
  fs.cpSync(ORIGINAL_PROFILE_DIR, tempProfileDir, { recursive: true });

  const executablePath = `C:\\Program Files (x86)\\Yandex\\YandexBrowser\\Application\\browser.exe`;
  context = await playwright.chromium.launchPersistentContext(tempProfileDir, {
    executablePath,
    headless: false,
    args: [
      `--profile-directory=Profile 1`,
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--disable-default-apps',
    ],
    viewport: { width: 1280, height: 720 },
  });

  // Закрываем лишние вкладки, оставляя одну
  const pages = context.pages();
  for (let i = 1; i < pages.length; i++) {
    await pages[i].close();
  }
});

test.afterEach(async () => {
  await context?.close();
  if (tempProfileDir && fs.existsSync(tempProfileDir)) {
    fs.rmSync(tempProfileDir, { recursive: true, force: true });
  }
});

test.describe('UI функциональные тесты авторизации (Page Object Model)', () => {

  test('Тест №1: Успешный вход с валидными учетными данными', async () => {
    const page = context.pages()[0];
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(USERNAME, PASSWORD);

    await dashboardPage.expectDashboardUrl();
    await dashboardPage.closeModalsIfPresent();
    await dashboardPage.expectDashboardContent();
  });

  test('Тест №2: Ошибка аутентификации при неверном пароле', async () => {
    const page = context.pages()[0];
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(USERNAME, WRONG_PASSWORD);

    await loginPage.expectLoginUrl();
    await loginPage.expectErrorText('Неверный логин или пароль');
  });

  test('Тест №3: Валидация формы – пустые поля', async () => {
    const page = context.pages()[0];
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.clearFields();
    await loginPage.submit();

    await loginPage.expectLoginUrl();
    await loginPage.expectValidationMessage('Обязательно для заполнения');
  });

  test('Тест №4: Завершение сессии (выход из системы)', async () => {
    const page = context.pages()[0];
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(USERNAME, PASSWORD);
    await dashboardPage.expectDashboardUrl();
    await dashboardPage.closeModalsIfPresent();

    await dashboardPage.logout();
    await dashboardPage.expectRedirectToLogin();

    // Проверка, что сессия завершена – попытка перейти на дашборд возвращает на логин
    await page.goto('https://preprod-zerno.mcx.gov.ru/home');
    await expect(page).toHaveURL('https://preprod-zerno.mcx.gov.ru/login');
  });

  test('Тест №5: Наличие базовых UI-компонентов после успешного входа', async () => {
    const page = context.pages()[0];
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login(USERNAME, PASSWORD);
    await dashboardPage.expectDashboardUrl();
    await dashboardPage.closeModalsIfPresent();

    await dashboardPage.expectNavMenuVisible();
    await dashboardPage.expectMenuItemsPresent();
    await dashboardPage.expectUserInfoVisible();
    await dashboardPage.expectLogoutButtonVisible();
    await dashboardPage.expectMainContentVisible();
  });
});