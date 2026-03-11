//стартовый URL для теста из конфига
const config = require('./config');

// Генерируем уникальное имя пользователя
function generateUsername() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

// Тестовые данные
const EXISTING_USER = {
    userName: 'existing_user',
    password: 'ValidPass123!'
};

const WEAK_PASSWORD_USER = {
    userName: 'new_user',
    password: '123'
};

describe('Book Store API Тесты (Fetch API)', () => {
    // 1. Создание пользователя с ошибкой: логин уже используется
    test('Создание пользователя - логин уже используется', async () => {
        const response = await fetch(`${config.baseURL}/Account/v1/User`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(EXISTING_USER)
        });

        expect(response.status).toBe(406);
        const data = await response.json();
        expect(data.code).toBe('1204');
        expect(data.message.toLowerCase()).toContain('user exists!');
    });

    // 2. Создание пользователя с ошибкой: пароль не подходит
    test('Создание пользователя - слабый пароль', async () => {
        const response = await fetch(`${config.baseURL}/Account/v1/User`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(WEAK_PASSWORD_USER)
        });

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.code).toBe('1300');
        expect(data.message.toLowerCase()).toContain('pass');
    });

    // 3. Создание пользователя успешно
    test('Создание пользователя - успешно', async () => {
        const newUser = {
            userName: generateUsername(),
            password: 'ValidPass123!'
        };

        const response = await fetch(`${config.baseURL}/Account/v1/User`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.userID).toBeTruthy();
        expect(data.username).toBe(newUser.userName);
    });

    // 4. Генерация токена с ошибкой
    test('Генерация токена - неверные учетные данные', async () => {
        const response = await fetch(`${config.baseURL}/Account/v1/GenerateToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userName: 'non_existing_user',
                password: 'WrongPass123!'
            })
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.status).toBe('Failed');
        expect(data.result.toLowerCase()).toContain('user authorization failed.');
    });

    // 5. Генерация токена успешно
    test('Генерация токена - успешно', async () => {
        const newUser = {
            userName: generateUsername(),
            password: 'ValidPass123!'
        };

        // Сначала создаем пользователя
        await fetch(`${config.baseURL}/Account/v1/User`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });

        // Генерируем токен
        const response = await fetch(`${config.baseURL}/Account/v1/GenerateToken`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.status).toBe('Success');
        expect(data.token).toBeTruthy();
    });
});