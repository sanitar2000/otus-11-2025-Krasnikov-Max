const AccountController = require('../framework/services/accountController');
const config = require('../framework/config/config');
const Helpers = require('../framework/fixtures/helpers');

describe('Account API Tests', () => {
    let accountController;
    let testUser;
    let authToken;

    beforeAll(async () => {
        accountController = new AccountController();
    });

    afterAll(async () => {
        // Очистка: удаляем тестового пользователя если он был создан
        if (testUser && testUser.userId && authToken) {
            try {
                await accountController.deleteUser(testUser.userId, authToken);
            } catch (error) {
                console.log('Ошибка при очистке (можно игнорировать):', error.message);
            }
        }
    });

    describe('Создание пользователя', () => {
        test('Должна быть ошибка при создании пользователя с существующим именем', async () => {
            const userData = {
                userName: config.testData.existingUser.userName,
                password: config.testData.existingUser.password
            };

            const response = await accountController.createUser(userData);
            
            // Проверяем что ответ существует
            expect(response).toBeDefined();
            
            // Проверяем что статус не 201 (не успешное создание)
            expect(response.status).not.toBe(201);
            
            // Проверяем что статус указывает на ошибку (4xx)
            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.status).toBeLessThan(500);
            
            // Проверяем что есть сообщение об ошибке
            expect(response.data).toBeDefined();
            
            // Проверяем что сообщение об ошибке указывает на существующего пользователя           
            const errorMessage = JSON.stringify(response.data).toLowerCase();       
            
            expect(errorMessage).toMatch(
                /user exists|already exists|duplicate|пользователь существует|уже существует/i
            );
        });

        test('Должна быть ошибка при создании пользователя со слабым паролем', async () => {
            const userData = {
                userName: Helpers.generateUniqueUsername(),
                password: config.testData.weakPassword
            };

            const response = await accountController.createUser(userData);
            
            expect(response).toBeDefined();
            expect(response.status).not.toBe(201);
            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.status).toBeLessThan(500);
            
            // Проверяем что сообщение об ошибке связано с паролем
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
                password: Helpers.generateValidPassword()
            };

            const response = await accountController.createUser(userData);
            
            // Сохраняем для следующих тестов
            if (response && response.status === 201) {
                testUser = { 
                    ...userData, 
                    userId: response.data.userID || response.data.userId 
                };
            }

            expect(response).toBeDefined();
            expect(response.status).toBe(201);
            expect(response.data).toBeDefined();
            
            // Проверяем наличие ID пользователя в ответе
            const hasUserId = response.data.userID || response.data.userId;
            expect(hasUserId).toBeDefined();
            
            // Проверяем имя пользователя
            const responseUsername = response.data.username || response.data.userName;
            expect(responseUsername).toBe(userData.userName);
        });
    });

 describe('Генерация токена', () => {
    test('Должна быть ошибка при генерации токена с неверными учетными данными', async () => {
        const credentials = {
            userName: 'nonexistent@user.com',
            password: 'WrongPassword123!'
        };

        const response = await accountController.generateToken(credentials);
        
        expect(response).toBeDefined();
        
        // API может возвращать 200 даже для неверных данных, но с полем status: "Failed"
        if (response.status === 200) {
            // Проверяем что в теле ответа есть указание на ошибку
            expect(response.data).toBeDefined();
            
            // Проверяем разные возможные форматы ответа об ошибке
            const hasError = 
                (response.data.status && response.data.status.toLowerCase() === 'failed') ||
                (response.data.result && response.data.result.toLowerCase() === 'failed') ||
                (response.data.error) ||
                (response.data.message && response.data.message.toLowerCase().includes('fail')) ||
                (response.data.token === null || response.data.token === '');
            
            expect(hasError).toBeTruthy();
            
            // Если есть сообщение об ошибке, проверяем его
            if (response.data.message) {
                expect(response.data.message.toLowerCase()).toContain('fail');
            }
            
            // Токен не должен быть валидным
            if (response.data.token) {
                expect(response.data.token).not.toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/); // не похож на JWT
            }
        } else {
            // Если статус не 200, проверяем что это ошибка
            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.status).toBeLessThan(500);
        }
    });

    test('Должен успешно сгенерировать токен с верными учетными данными', async () => {
        // Если нет тестового пользователя, используем данные из конфига
        const credentials = testUser || {
            userName: config.credentials.userName,
            password: config.credentials.password
        };

        const response = await accountController.generateToken({
            userName: credentials.userName,
            password: credentials.password
        });
        
        expect(response).toBeDefined();
        
        // Проверяем что получили успешный ответ
        if (response.status === 200) {
            authToken = response.data.token;
            
            // Проверяем что токен существует
            expect(response.data.token).toBeDefined();
            expect(response.data.token).not.toBe('');
            
            // Проверяем что статус успешный (если есть поле status)
            if (response.data.status) {
                expect(response.data.status.toLowerCase()).toBe('success');
            }
            
            // Проверяем что нет сообщения об ошибке
            if (response.data.message) {
                expect(response.data.message.toLowerCase()).not.toContain('fail');
                expect(response.data.message.toLowerCase()).not.toContain('error');
            }
        } else {
            // Если статус не 200, тест должен упасть
            expect(response.status).toBe(200);
        }
    });
});

    describe('Авторизация', () => {
    test('Должен успешно авторизовать пользователя с верными учетными данными', async () => {
        // Только эта проверка - если нет тестового пользователя, тест падает
        if (!testUser) {
            throw new Error('Тестовый пользователь не создан. Проверьте beforeAll hook');
        }

        const response = await accountController.authorizeUser({
            userName: testUser.userName,
            password: testUser.password
        });

        // Здесь только обычные expect без throw
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
                password: 'WrongPassword123!'
            });

            expect(response).toBeDefined();
            
            // Должен вернуть статус ошибки
            expect(response.status).not.toBe(200);
            expect(response.status).toBeGreaterThanOrEqual(400);
            expect(response.status).toBeLessThan(500);
        });
    });

    describe('Информация о пользователе', () => {
        test('Должен успешно получить информацию о пользователе', async () => {
            // Пропускаем если нет тестового пользователя или токена
            if (!testUser || !testUser.userId || !authToken) {
                console.log('Пропускаем тест: нет тестового пользователя или токена');
                return;
            }

            const response = await accountController.getUser(testUser.userId, authToken);

            expect(response).toBeDefined();
            expect(response.status).toBe(200);
            expect(response.data).toBeDefined();
            
            // Проверяем ID пользователя в ответе
            const responseUserId = response.data.userId || response.data.userID;
            expect(responseUserId).toBe(testUser.userId);
            
            // Проверяем имя пользователя
            const responseUsername = response.data.username || response.data.userName;
            expect(responseUsername).toBe(testUser.userName);
        });

        test('Должна быть ошибка при получении информации о пользователе с неверным токеном', async () => {
            // Пропускаем если нет тестового пользователя
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
            // Пропускаем если нет тестового пользователя или токена
            if (!testUser || !testUser.userId || !authToken) {
                console.log('Пропускаем тест: нет тестового пользователя или токена');
                return;
            }

            const response = await accountController.deleteUser(testUser.userId, authToken);

            expect(response).toBeDefined();
            
            // Удаление может вернуть 200, 202 или 204
            const successStatuses = [200, 202, 204];
            expect(successStatuses).toContain(response.status);
            
            // Очищаем тестового пользователя чтобы избежать двойного удаления в afterAll
            testUser = null;
        });
    });
});