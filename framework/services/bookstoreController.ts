const httpClient = require('../services/httpClient');
const config = require('../config/config');

class BookstoreController {
    constructor() {
        this.endpoints = config.endpoints.bookstore;
    }

    async createBook(bookData, token) {
        const response = await httpClient.post(
            this.endpoints.books,
            bookData,
            {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }
        );
        return response;
    }

    async getAllBooks(token) {
        const response = await httpClient.get(
            this.endpoints.books,
            {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }
        );
        return response;
    }

    async getBook(isbn, token) {
        const response = await httpClient.get(
            this.endpoints.book,
            { 
                params: { ISBN: isbn },
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }
        );
        return response;
    }

    async updateBook(isbn, updateData, token) {
        const response = await httpClient.put(
            `${this.endpoints.books}/${isbn}`,
            updateData,
            {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }
        );
        return response;
    }

    async deleteBook(isbn, token) {
        const response = await httpClient.delete(
            this.endpoints.book,
            { 
                data: { isbn: isbn },
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }
        );
        return response;
    }
}

module.exports = BookstoreController;