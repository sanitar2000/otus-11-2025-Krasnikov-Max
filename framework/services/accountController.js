const axios = require('axios');
const config = require('../config/config');

class AccountController {
    constructor() {
        this.baseURL = config.baseURL;
        this.endpoints = config.endpoints.account;
    }

    async createUser(userData) {
        try {
            const response = await axios.post(
                `${this.baseURL}${this.endpoints.user}`,
                userData
            );
            return response;
        } catch (error) {
            return error.response;
        }
    }

    async generateToken(credentials) {
        try {
            const response = await axios.post(
                `${this.baseURL}${this.endpoints.generateToken}`,
                credentials
            );
            return response;
        } catch (error) {
            return error.response;
        }
    }

    async authorizeUser(credentials) {
        try {
            const response = await axios.post(
                `${this.baseURL}${this.endpoints.authorized}`,
                credentials
            );
            return response;
        } catch (error) {
            return error.response;
        }
    }

    async getUser(userId, token) {
        try {
            const response = await axios.get(
                `${this.baseURL}${this.endpoints.user}/${userId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            return response;
        } catch (error) {
            return error.response;
        }
    }

    async deleteUser(userId, token) {
        try {
            const response = await axios.delete(
                `${this.baseURL}${this.endpoints.user}/${userId}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            return response;
        } catch (error) {
            return error.response;
        }
    }
}

module.exports = AccountController;