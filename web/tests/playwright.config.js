// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/* Viewports required by the spec: two phones + a small tablet. */
const VIEWPORTS = [
  { tag: '320x640', width: 320, height: 640, mobile: true },
  { tag: '390x844', width: 390, height: 844, mobile: true },
  { tag: '640x900', width: 640, height: 900, mobile: false },
];

const ENGINES = [
  { name: 'chromium', device: devices['Desktop Chrome'], browserName: 'chromium' },
  { name: 'webkit', device: devices['Desktop Safari'], browserName: 'webkit' },
];

const projects = [];
for (const engine of ENGINES) {
  for (const vp of VIEWPORTS) {
    projects.push({
      name: `${engine.name}-${vp.tag}`,
      // The offline spec needs a Chromium service worker + context.setOffline.
      testIgnore: engine.name === 'webkit' ? /offline\.spec\.js$/ : undefined,
      use: {
        ...engine.device,
        browserName: engine.browserName,
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
        deviceScaleFactor: 2,
        locale: 'pt-BR',
        timezoneId: 'America/Sao_Paulo',
        serviceWorkers: 'block', // overridden to 'allow' in offline.spec.js
      },
    });
  }
}

module.exports = defineConfig({
  testDir: './e2e',
  // each test gets its own context => isolated localStorage
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  retries: 0,
  reporter: [['list']],
  projects,
});
