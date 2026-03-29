import AccountController from '../framework/services/accountController';
import config from '../framework/config/config';
import Helpers from '../framework/fixtures/helpers';

describe('Account API Tests', () => {
  let accountController: any;
  let testUser: any;
  let authToken: any;

  beforeAll(async () => {
    accountController = new AccountController();
  });

  afterAll(async () => {
    // Очистка: удаляем тестового пользователя если он был создан
    if (testUser && testUser.userId && authToken) {
      try {
        await accountController.deleteUser(testUser.userId, authToken);
      } catch (error) {
        console.log(
          'Ошибка при очистке (можно игнорировать):',
          error instanceof Error ? error.message : error
        );
      }
    }
  });

  describe('Создание пользователя', () => {
    test('Должна быть ошибка при создании пользователя с существующим именем', async () => {
      const userData = {
        userName: config.testData.existingUser.userName,
        password: config.testData.existingUser.password,
      };

      const response = await accountController.createUser(userData);

      expect(response).toBeDefined();
      expect(response.status).not.toBe(201);
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      expect(response.data).toBeDefined();

      const errorMessage = JSON.stringify(response.data).toLowerCase();
      expect(errorMessage).toMatch(
        /user exists|already exists|duplicate|пользователь существует|уже существует/i
      );
    });

    test('Должна быть ошибка при создании пользователя со слабым паролем', async () => {
      const userData = {
        userName: Helpers.generateUniqueUsername(),
        password: config.testData.weakPassword,
      };

      const response = await accountController.createUser(userData);

      expect(response).toBeDefined();
      expect(response.status).not.toBe(201);
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);

      const errorMessage = JSON.stringify(response.data).toLowerCase();
      const hasPasswordMessage =
        errorMessage.includes('password') ||
        errorMessage.includes('пароль') ||
        errorMessage.includes('weak') ||
        errorMessage.includes('слабый') ||
        errorMessage.includes('character') ||
        errorMessage.includes('символ');

      expect(hasPasswordMessage).toBeTruthy();
    });

    test('Должен успешно создать нового пользователя', async () => {
      const userData = {
        userName: Helpers.generateUniqueUsername(),
        password: Helpers.generateValidPassword(),
      };

      const response = await accountController.createUser(userData);

      if (response && response.status === 201) {
        testUser = {
          ...userData,
          userId: response.data.userID || response.data.userId,
        };
      }

      expect(response).toBeDefined();
      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();

      const hasUserId = response.data.userID || response.data.userId;
      expect(hasUserId).toBeDefined();

      const responseUsername = response.data.username || response.data.userName;
      expect(responseUsername).toBe(userData.userName);
    });
  });

  describe('Генерация токена', () => {
    test('Должна быть ошибка при генерации токена с неверными учетными данными', async () => {
      const credentials = {
        userName: 'nonexistent@user.com',
        password: 'WrongPassword123!',
      };

      const response = await accountController.generateToken(credentials);

      expect(response).toBeDefined();

      if (response.status === 200) {
        expect(response.data).toBeDefined();

        const hasError =
          (response.data.status && response.data.status.toLowerCase() === 'failed') ||
          (response.data.result && response.data.result.toLowerCase() === 'failed') ||
          response.data.error ||
          (response.data.message && response.data.message.toLowerCase().includes('fail')) ||
          response.data.token === null ||
          response.data.token === '';

        expect(hasError).toBeTruthy();

        if (response.data.message) {
          expect(response.data.message.toLowerCase()).toContain('fail');
        }

        if (response.data.token) {
          expect(response.data.token).not.toMatch(
            /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/
          );
        }
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500);
      }
    });

    test('Должен успешно сгенерировать токен с верными учетными данными', async () => {
      const credentials = testUser || {
        userName: config.credentials.userName,
        password: config.credentials.password,
      };

      const response = await accountController.generateToken({
        userName: credentials.userName,
        password: credentials.password,
      });

      expect(response).toBeDefined();

      if (response.status === 200) {
        authToken = response.data.token;

        expect(response.data.token).toBeDefined();
        expect(response.data.token).not.toBe('');

        if (response.data.status) {
          expect(response.data.status.toLowerCase()).toBe('success');
        }

        if (response.data.message) {
          expect(response.data.message.toLowerCase()).not.toContain('fail');
          expect(response.data.message.toLowerCase()).not.toContain('error');
        }
      } else {
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Авторизация', () => {
    test('Должен успешно авторизовать пользователя с верными учетными данными', async () => {
      if (!testUser) {
        throw new Error('Тестовый пользователь не создан. Проверьте beforeAll hook');
      }

      const response = await accountController.authorizeUser({
        userName: testUser.userName,
        password: testUser.password,
      });

      expect(response).toBeDefined();
      expect(response.status).toBe(200);

      if (typeof response.data === 'boolean') {
        expect(response.data).toBe(true);
      } else if (response.data && typeof response.data === 'object') {
        const isSuccess =
          response.data.status === 'Success' ||
          response.data.status === 'success' ||
          response.data.success === true ||
          response.data.authorized === true;

        expect(isSuccess).toBeTruthy();

        if (response.data.message) {
          expect(response.data.message.toLowerCase()).not.toContain('fail');
          expect(response.data.message.toLowerCase()).not.toContain('error');
          expect(response.data.message.toLowerCase()).not.toContain('invalid');
        }
      }
    });

    test('Должна быть ошибка при авторизации с неверными учетными данными', async () => {
      const response = await accountController.authorizeUser({
        userName: testUser?.userName || 'nonexistent',
        password: 'WrongPassword123!',
      });

      expect(response).toBeDefined();
      expect(response.status).not.toBe(200);
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Информация о пользователе', () => {
    test('Должен успешно получить информацию о пользователе', async () => {
      if (!testUser || !testUser.userId || !authToken) {
        console.log('Пропускаем тест: нет тестового пользователя или токена');
        return;
      }

      const response = await accountController.getUser(testUser.userId, authToken);

      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();

      const responseUserId = response.data.userId || response.data.userID;
      expect(responseUserId).toBe(testUser.userId);

      const responseUsername = response.data.username || response.data.userName;
      expect(responseUsername).toBe(testUser.userName);
    });

    test('Должна быть ошибка при получении информации о пользователе с неверным токеном', async () => {
      if (!testUser || !testUser.userId) {
        console.log('Пропускаем тест: нет тестового пользователя');
        return;
      }

      const response = await accountController.getUser(
        testUser.userId,
        Helpers.generateInvalidToken()
      );

      expect(response).toBeDefined();
      expect(response.status).not.toBe(200);
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);

      if (response.data) {
        expect(response.data).toBeDefined();
      }
    });
  });

  describe('Удаление пользователя', () => {
    test('Должен успешно удалить пользователя', async () => {
      if (!testUser || !testUser.userId || !authToken) {
        console.log('Пропускаем тест: нет тестового пользователя или токена');
        return;
      }

      const response = await accountController.deleteUser(testUser.userId, authToken);

      expect(response).toBeDefined();

      const successStatuses = [200, 202, 204];
      expect(successStatuses).toContain(response.status);

      testUser = null;
    });
  });
});
