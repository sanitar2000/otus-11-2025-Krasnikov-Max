import { defineConfig } from '@playwright/test';
import path from 'path';

const EXTENSION_PATH = path.resolve('framework/fixtures/my-extension');

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,      // отключаем параллельность между файлами
  workers: 1,                // один рабочий процесс – файлы идут строго по очереди
  reporter: 'html',
  timeout: 120000,
  use: {
    trace: 'on-first-retry',
  },
  // Явный порядок файлов 
  testMatch: [
    'tests/auth.spec.js',
    'tests/lots.spec.js',
    'tests/gpb-lots.spec.js',
    'tests/sdiz.spec.js',
    'tests/sdiz-gpb.spec.js',
    'tests/e2e-create-lot.spec.js',
    'tests/e2e-create-gpb-lot.spec.js',
  ],
  projects: [
    {
      name: 'yandex-with-extension',
      use: {        
        executablePath: 'C:/Program Files/Yandex/YandexBrowser/Application/browser.exe',
        headless: false,
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            '--disable-blink-features=AutomationControlled',
            '--no-first-run',
          ],
        },
      },
    },
  ],
});