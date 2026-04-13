const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');
const fs = require('fs');
const path = require('path');
const os = require('os');

setHeadlessWhen(false);
setCommonPlugins();

const userName = os.userInfo().username;
const ORIGINAL_PROFILE = `C:\\Users\\${userName}\\AppData\\Local\\Yandex\\YandexBrowser\\User Data`;
const TEMP_PROFILE = path.join(__dirname, 'temp-profile');

if (!fs.existsSync(TEMP_PROFILE)) {
  fs.cpSync(ORIGINAL_PROFILE, TEMP_PROFILE, { recursive: true });
}

exports.config = {
  tests: './testsCJS/*_test.js',
  output: './output',
  helpers: {
    Playwright: {
      url: 'https://preprod-zerno.mcx.gov.ru',
      show: true,
      browser: 'chromium',                       // <-- важно!
      executablePath: 'C:\\Program Files (x86)\\Yandex\\YandexBrowser\\Application\\browser.exe',
      userDataDir: TEMP_PROFILE,
      waitForNavigation: 'load',
      chromium: {
        args: [
          '--profile-directory=Profile 1',
          '--disable-blink-features=AutomationControlled',
          '--no-first-run',
          '--disable-default-apps'
        ]
      }
    }
  },
  include: {
    I: './steps_file.js',
    loginPage: './testsCJS/pages/loginPage.js',
    dashboardPage: './testsCJS/pages/dashboardPage.js'
  },
  plugins: {
    screenshotOnFail: { enabled: true },
    retryFailedStep: { enabled: true },  
    pauseOnFail: {}
  },
  name: 'codeceptjs-tests'
};