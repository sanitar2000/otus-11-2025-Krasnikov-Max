// tests/auth.spec.js
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Тестовые данные
const LOGIN_URL = 'https://preprod-zerno.mcx.gov.ru/login';
const DASHBOARD_URL = 'https://preprod-zerno.mcx.gov.ru/home';
const USERNAME = 'Kovpak';
const PASSWORD = 'Kovpak11';

// Путь к оригинальному профилю Яндекс.Браузера (где установлены плагины)
const ORIGINAL_PROFILE_DIR = path.join(os.homedir(), 'AppData', 'Local', 'Yandex', 'YandexBrowser', 'User Data');

let context = null;
let tempProfileDir = null;

test.beforeEach(async ({ playwright }) => {
  // Создаём уникальную временную папку для каждого теста
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  tempProfileDir = path.join(__dirname, '..', `temp-profile-${uniqueId}`);
  
  // Копируем оригинальный профиль во временную папку
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
  
  // Закрываем лишние автоматически открытые страницы, оставляем только одну
  const pages = context.pages();
  for (let i = 1; i < pages.length; i++) {
    await pages[i].close();
  }
});

test.afterEach(async () => {
  await context?.close();
  // Удаляем временную папку после теста
  if (tempProfileDir && fs.existsSync(tempProfileDir)) {
    fs.rmSync(tempProfileDir, { recursive: true, force: true });
  }
});

test.describe('UI функциональные тесты авторизации', () => {

  test('Тест №1: Успешный вход с валидными учетными данными', async () => {
    const page = context.pages()[0];
    await page.goto(LOGIN_URL);
    
    await page.locator('[placeholder="Введите логин"]').clear();
    await page.locator('input[type="password"]').clear();
    await page.fill('[placeholder="Введите логин"]', USERNAME);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(DASHBOARD_URL, { timeout: 15000 });
    
    // Закрытие модальных окон
    const okButton = page.getByRole('button', { name: 'Понятно' });
    if (await okButton.isVisible()) await okButton.click();
    const warning = page.getByText('Предупреждение');
    if (await warning.isVisible()) {
      const closeIcon = page.locator('.v-card__title svg');
      await closeIcon.click();
    }
    await expect(page.locator('.col.col-12')).toContainText(['Личный кабинет', 'Товаропроизводителя']);
  });

  test('Тест №2: Ошибка аутентификации при неверном пароле', async () => {
    const page = context.pages()[0];
    await page.goto(LOGIN_URL);
    
    await page.locator('[placeholder="Введите логин"]').clear();
    await page.locator('input[type="password"]').clear();
    await page.fill('[placeholder="Введите логин"]', USERNAME);
    await page.fill('input[type="password"]', 'WrongPass123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(LOGIN_URL);
    const errorMsg = page.locator('.error');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Неверный логин или пароль');
  });

  test('Тест №3: Валидация формы – пустые поля', async () => {
    const page = context.pages()[0];
    await page.goto(LOGIN_URL);
    
    await page.locator('[placeholder="Введите логин"]').clear();
    await page.locator('input[type="password"]').clear();
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(LOGIN_URL);
    const validationMsgs = page.locator('.validation-message');
    await expect(validationMsgs).toHaveCount(2);
    await expect(validationMsgs.first()).toBeVisible();
    await expect(validationMsgs.nth(1)).toBeVisible();
  });

  test('Тест №4: Завершение сессии (выход из системы)', async () => {
    const page = context.pages()[0];
    await page.goto(LOGIN_URL);
    await page.locator('[placeholder="Введите логин"]').clear();
    await page.locator('input[type="password"]').clear();
    await page.fill('[placeholder="Введите логин"]', USERNAME);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(DASHBOARD_URL, { timeout: 15000 });
    
    // Закрыть модалки
    const okButton = page.getByRole('button', { name: 'Понятно' });
    if (await okButton.isVisible()) await okButton.click();
    const warning = page.getByText('Предупреждение');
    if (await warning.isVisible()) {
      const closeIcon = page.locator('.v-card__title svg');
      await closeIcon.click();
    }
    
    const logoutButton = page.locator('img[src*="log_out"]');
    await logoutButton.click();
    await expect(page).toHaveURL(LOGIN_URL, { timeout: 10000 });
    
    // Проверка, что сессия завершена
    await page.goto(DASHBOARD_URL);
    await expect(page).toHaveURL(LOGIN_URL);
  });

  test('Тест №5: Наличие базовых UI-компонентов после успешного входа', async () => {
    const page = context.pages()[0];
    await page.goto(LOGIN_URL);
    await page.locator('[placeholder="Введите логин"]').clear();
    await page.locator('input[type="password"]').clear();
    await page.fill('[placeholder="Введите логин"]', USERNAME);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(DASHBOARD_URL, { timeout: 15000 });

    // Закрытие модальных окон
    const okButton = page.getByRole('button', { name: 'Понятно' });
    if (await okButton.isVisible()) await okButton.click();
    const warning = page.getByText('Предупреждение');
    if (await warning.isVisible()) {
      const closeIcon = page.locator('.v-card__title svg');
      await closeIcon.click();
    }
    
    // 1. Панель навигации (боковое меню) — аккордеон
    const navMenu = page.locator('div.v-expansion-panels');
    await expect(navMenu).toBeVisible();
    // 2. Пункты меню — один заголовок
    const menuTitles = page.locator('.sidebar-menu__title');
    await expect(menuTitles.first()).toBeVisible();
    // 3. Информация о пользователе (блок .user-info__wrapper)
    const userBlock = page.locator('.user-info__wrapper');
    await expect(userBlock).toBeVisible();
    const userName = userBlock.locator('.user');
    await expect(userName).toBeVisible();
    await expect(userName).not.toBeEmpty();    
    await expect(userName).toContainText(/СИДОР КОВПАК/i);
    // 4. Кнопка выхода
    const logoutBtn = page.locator('img[src*="log_out"]');
    await expect(logoutBtn).toBeVisible();
    await expect(logoutBtn).toBeEnabled();
  });
});