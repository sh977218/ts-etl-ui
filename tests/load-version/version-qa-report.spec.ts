import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';

const loadNumber = '20231012080001';

test.use({ accountUsername: 'Christophe', loadNumber });
test('Version QA Report', async ({ page, loadVersionQaPage }) => {

  await test.step(`Open QA Report page`, async () => {
    const [qaReportPage] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('link', { name: 'Go to QA Report' }).click(),
    ]);
    await expect(qaReportPage).toHaveTitle(`Version QA Report`);
  });
});