const httpClient = require('../services/httpClient');
const config = require('../config/config');

class BookstoreController {
  endpoints: any;
  constructor() {
    this.endpoints = config.endpoints.bookstore;
  }

  async createBook(bookData: any, token: any) {
    const response = await httpClient.post(this.endpoints.books, bookData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response;
  }

  async getAllBooks(token: any) {
    const response = await httpClient.get(this.endpoints.books, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response;
  }

  async getBook(isbn: any, token: any) {
    const response = await httpClient.get(this.endpoints.book, {
      params: { ISBN: isbn },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response;
  }

  async updateBook(isbn: any, updateData: any, token: any) {
    const response = await httpClient.put(`${this.endpoints.books}/${isbn}`, updateData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response;
  }

  async deleteBook(isbn: any, token: any) {
    const response = await httpClient.delete(this.endpoints.book, {
      data: { isbn: isbn },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response;
  }
}

export default BookstoreController;
