const httpClient = require('../services/httpClient');
const config = require('../config/config');

class AccountController {
    constructor() {
        this.endpoints = config.endpoints.account;
    }

    async createUser(userData) {
        const response = await httpClient.post(
            this.endpoints.user,
            userData
        );
        return response;
    }

    async generateToken(credentials) {
        const response = await httpClient.post(
            this.endpoints.generateToken,
            credentials
        );
        return response;
    }

    async authorizeUser(credentials) {
        const response = await httpClient.post(
            this.endpoints.authorized,
            credentials
        );
        return response;
    }

    async getUser(userId, token) {
        const response = await httpClient.get(
            `${this.endpoints.user}/${userId}`,
            {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }
        );
        return response;
    }

    async deleteUser(userId, token) {
        const response = await httpClient.delete(
            `${this.endpoints.user}/${userId}`,
            {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            }
        );
        return response;
    }
}

module.exports = AccountController;