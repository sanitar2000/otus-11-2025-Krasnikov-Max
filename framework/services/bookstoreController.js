const axios = require('axios');
const config = require('../config/config');

class BookstoreController {
    constructor() {
        this.baseURL = config.baseURL;
        this.endpoints = config.endpoints.bookstore;
    }

    async createBook(bookData, token) {
        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await axios.post(
                `${this.baseURL}${this.endpoints.books}`,
                bookData,
                { headers }
            );
            return response;
        } catch (error) {
            if (error.response) {
                // Сервер ответил с ошибкой
                return error.response;
            } else if (error.request) {
                // Запрос был сделан, но ответа нет
                console.error('No response received:', error.request);
                return { status: 503, data: { message: 'Service unavailable' } };
            } else {
                // Ошибка при настройке запроса
                console.error('Request error:', error.message);
                return { status: 500, data: { message: error.message } };
            }
        }
    }

    async getAllBooks(token) {
        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await axios.get(
                `${this.baseURL}${this.endpoints.books}`,
                { headers }
            );
            return response;
        } catch (error) {
            if (error.response) {
                return error.response;
            } else {
                console.error('Error getting books:', error.message);
                return { status: 500, data: { message: error.message } };
            }
        }
    }

    async getBook(isbn, token) {
        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await axios.get(
                `${this.baseURL}${this.endpoints.book}`,
                { 
                    params: { ISBN: isbn },
                    headers 
                }
            );
            return response;
        } catch (error) {
            if (error.response) {
                return error.response;
            } else {
                console.error('Error getting book:', error.message);
                return { status: 500, data: { message: error.message } };
            }
        }
    }

    async updateBook(isbn, updateData, token) {
        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await axios.put(
                `${this.baseURL}${this.endpoints.books}/${isbn}`,
                updateData,
                { headers }
            );
            return response;
        } catch (error) {
            if (error.response) {
                return error.response;
            } else {
                console.error('Error updating book:', error.message);
                return { status: 500, data: { message: error.message } };
            }
        }
    }

    async deleteBook(isbn, token) {
        try {
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const response = await axios.delete(
                `${this.baseURL}${this.endpoints.book}`,
                { 
                    data: { isbn: isbn },
                    headers 
                }
            );
            return response;
        } catch (error) {
            if (error.response) {
                return error.response;
            } else {
                console.error('Error deleting book:', error.message);
                return { status: 500, data: { message: error.message } };
            }
        }
    }
}

module.exports = BookstoreController;