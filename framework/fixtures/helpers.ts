class Helpers {
  static generateUniqueUsername() {
    return `User_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }

  static generateValidPassword() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*';

    const getRandomChar = (str: string) => str[Math.floor(Math.random() * str.length)];

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
      publishDate: new Date().toISOString().split('T')[0],
    };
  }

  static async createTestUser(accountController: any) {
    const userData = {
      userName: this.generateUniqueUsername(),
      password: this.generateValidPassword(),
    };

    try {
      const response = await accountController.createUser(userData);
      if (response && response.status === 201) {
        return {
          ...userData,
          userId: response.data.userID || response.data.userId,
        };
      }
    } catch (error) {
      console.error('Failed to create test user:', error instanceof Error ? error.message : error);
    }
    return null;
  }

  static async getAuthToken(accountController: any, credentials: any) {
    try {
      const response = await accountController.generateToken(credentials);
      return response && response.status === 200 ? response.data.token : null;
    } catch (error) {
      console.error('Failed to get auth token:', error instanceof Error ? error.message : error);
      return null;
    }
  }

  static generateInvalidToken() {
    return `invalid_${Math.random().toString(36).substring(2, 15)}`;
  }
}

export default Helpers;
