// @ts-check
import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ---------- НАСТРОЙКИ ДЛЯ ЯНДЕКС.БРАУЗЕРА ----------
// Путь к оригинальному профилю (где установлены плагины)
const ORIGINAL_YANDEX_PROFILE = `C:\\Users\\user\\AppData\\Local\\Yandex\\YandexBrowser\\User Data`;
// Временная копия профиля, чтобы не блокировать оригинал
const TEMP_PROFILE_DIR = path.join(process.cwd(), 'temp-yandex-profile');

// Функция копирования профиля (вызывается один раз при загрузке конфига)
function copyYandexProfile() {
  if (!fs.existsSync(ORIGINAL_YANDEX_PROFILE)) {
    console.warn(`⚠️ Профиль Яндекс.Браузера не найден: ${ORIGINAL_YANDEX_PROFILE}`);
    console.warn(`Тесты для Яндекс.Браузера будут пропущены.`);
    return false;
  }
  if (fs.existsSync(TEMP_PROFILE_DIR)) {
    fs.rmSync(TEMP_PROFILE_DIR, { recursive: true, force: true });
  }
  fs.cpSync(ORIGINAL_YANDEX_PROFILE, TEMP_PROFILE_DIR, { recursive: true });
  console.log(`✅ Профиль скопирован в ${TEMP_PROFILE_DIR}`);
  return true;
}

const yandexProfileReady = copyYandexProfile();

// ---------- ОСНОВНАЯ КОНФИГУРАЦИЯ ----------
export default defineConfig({
  testDir: './tests',
  /* Для работы с персистентным профилем отключаем параллельность */
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,   // только один рабочий процесс, чтобы профиль не конфликтовал
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    // Базовые настройки для всех проектов
  },

  projects: [
    // Стандартные браузеры (можно оставить для других тестов)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // ----- НАСТРОЙКА ДЛЯ ЯНДЕКС.БРАУЗЕРА С ПЛАГИНАМИ -----
    ...(yandexProfileReady ? [{
      name: 'yandex-browser',
      use: {
        // Путь к исполняемому файлу Яндекс.Браузера
        executablePath: `C:\\Program Files (x86)\\Yandex\\YandexBrowser\\Application\\browser.exe`,
        channel: 'chrome',   // Playwright управляет Chromium-браузером
        headless: false,     // обязательно false, иначе плагины не будут работать
        viewport: { width: 1280, height: 720 },
        // Аргументы запуска – указываем скопированный профиль и нужную директорию профиля
        launchOptions: {
          args: [
            `--user-data-dir=${TEMP_PROFILE_DIR}`,
            `--profile-directory=Profile 1`,   // имя вашего профиля (Default, Profile 1, Profile 2...)
            '--disable-blink-features=AutomationControlled',
          ],
        },
      },
    }] : []),
  ],
});