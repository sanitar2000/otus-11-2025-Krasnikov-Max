class Helpers {
    static generateUniqueUsername() {
        // Создаем уникальное имя пользователя без использования UUID.
        return `User_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    }

    static generateValidPassword() {
        // Сгенерируем действительный пароль (не менее 8 символов, включающий заглавные буквы, строчные буквы, цифры и специальные символы).
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const special = '!@#$%^&*';
        
        const getRandomChar = (str) => str[Math.floor(Math.random() * str.length)];
        
        const password = 
            getRandomChar(uppercase) +
            getRandomChar(lowercase) +
            getRandomChar(numbers) +
            getRandomChar(special) +
            Math.random().toString(36).substring(2, 10);
        
        return password;
    }

    static generateBookData() {
        return {
            isbn: `978-${Math.floor(Math.random() * 1000000000)}`,
            title: `Test Book ${Date.now()}`,
            author: `Author ${Math.floor(Math.random() * 1000)}`,
            publisher: 'Test Publisher',
            publishDate: new Date().toISOString().split('T')[0]
        };
    }

    static async createTestUser(accountController) {
        const userData = {
            userName: this.generateUniqueUsername(),
            password: this.generateValidPassword()
        };
        
        try {
            const response = await accountController.createUser(userData);
            if (response && response.status === 201) {
                return {
                    ...userData,
                    userId: response.data.userID || response.data.userId
                };
            }
        } catch (error) {
            console.error('Failed to create test user:', error.message);
        }
        return null;
    }

    static async getAuthToken(accountController, credentials) {
        try {
            const response = await accountController.generateToken(credentials);
            return response && response.status === 200 ? response.data.token : null;
        } catch (error) {
            console.error('Failed to get auth token:', error.message);
            return null;
        }
    }

    static generateInvalidToken() {
        return `invalid_${Math.random().toString(36).substring(2, 15)}`;
    }
}

module.exports = Helpers;