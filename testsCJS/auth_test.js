const loginPage = inject('loginPage');
const dashboardPage = inject('dashboardPage');

const USERNAME = 'Kovpak';
const PASSWORD = 'Kovpak11';
const WRONG_PASSWORD = 'WrongPass123';

Feature('Авторизация на портале Зерно');

Scenario('Тест №1: Успешный вход с валидными учетными данными', async ({ I }) => {
  await loginPage.goto();
  await loginPage.login(USERNAME, PASSWORD);
  await dashboardPage.seeDashboardUrl();
  await dashboardPage.closeModalsIfPresent();
  await dashboardPage.seeDashboardContent();
});

Scenario('Тест №2: Ошибка аутентификации при неверном пароле', async ({ I }) => {
  await loginPage.goto();
  await loginPage.login(USERNAME, WRONG_PASSWORD);
  await loginPage.seeLoginUrl();
  await loginPage.seeErrorText('Неверный логин или пароль');
});

Scenario('Тест №3: Валидация формы – пустые поля', async ({ I }) => {
  await loginPage.goto();
  await loginPage.clearFields();
  await loginPage.submit();
  await loginPage.seeLoginUrl();
  await loginPage.seeValidationMessage('Обязательно для заполнения');
});

Scenario('Тест №4: Завершение сессии (выход из системы)', async ({ I }) => {
  await loginPage.goto();
  await loginPage.login(USERNAME, PASSWORD);
  await dashboardPage.seeDashboardUrl();
  await dashboardPage.closeModalsIfPresent();
  await dashboardPage.logout();
  await dashboardPage.seeRedirectToLogin();
  // Проверка, что сессия завершена
  I.amOnPage('/home');
  I.seeInCurrentUrl('/login');
});

Scenario('Тест №5: Наличие базовых UI-компонентов после успешного входа', async ({ I }) => {
  await loginPage.goto();
  await loginPage.login(USERNAME, PASSWORD);
  await dashboardPage.seeDashboardUrl();
  await dashboardPage.closeModalsIfPresent();
  await dashboardPage.seeNavMenu();
  await dashboardPage.seeMenuItems();
  await dashboardPage.seeUserInfo();
  await dashboardPage.seeLogoutButton();
  await dashboardPage.seeMainContent();
});