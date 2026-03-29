interface Config {
  baseURL: string;
  credentials: {
    userName: string;
    password: string;
  };
  testData: {
    existingUser: {
      userName: string;
      password: string;
    };
    weakPassword: string;
    invalidToken: string;
  };
  endpoints: {
    account: {
      authorized: string;
      generateToken: string;
      user: string;
    };
    bookstore: {
      books: string;
      book: string;
    };
  };
}

const config: Config = {
  baseURL: 'https://bookstore.demoqa.com',
  credentials: {
    userName: 'TestUser123',
    password: 'Test@Password123!',
  },
  testData: {
    existingUser: {
      userName: 'ExistingUser',
      password: 'Existing@Pass123',
    },
    weakPassword: '12345',
    invalidToken: 'invalid-token-123',
  },
  endpoints: {
    account: {
      authorized: '/Account/v1/Authorized',
      generateToken: '/Account/v1/GenerateToken',
      user: '/Account/v1/User',
    },
    bookstore: {
      books: '/BookStore/v1/Books',
      book: '/BookStore/v1/Book',
    },
  },
};

export default config;
