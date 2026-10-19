import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'npm run preview:test', port: 4173 },
	testMatch: '**/*.e2e.{ts,js}'
});
