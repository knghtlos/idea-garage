// Configurazione del robot collaudatore. Motore: non modificare a mano.
import { defineConfig } from '@playwright/test';

const browserPersonale = process.env.IDEA_GARAGE_CHROMIUM;

export default defineConfig({
  testDir: 'giochi',
  testMatch: '**/test/*.spec.mjs',
  timeout: 30000,
  retries: 0,
  workers: 1,             // un gioco alla volta: i computer di casa non sono tutti potenti
  reporter: [['list'], ['json', { outputFile: 'test-results/risultati.json' }]],
  use: {
    baseURL: 'http://localhost:4322',
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    launchOptions: browserPersonale
      ? { executablePath: browserPersonale, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }
      : { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }
  },
  webServer: {
    command: 'node motore/server.mjs . 4322',
    url: 'http://localhost:4322/',
    reuseExistingServer: true,
    timeout: 15000
  }
});
