const axios = require('axios');
const config = require('../config/config');

// Создаем клиент с отключенной валидацией статусов
const httpClient = axios.create({
    baseURL: config.baseURL,
    validateStatus: function (status) {
        return true; // Всегда возвращаем true, чтобы не было исключений
    },
    timeout: 30000 // 30 секунд таймаут
});

module.exports = httpClient;