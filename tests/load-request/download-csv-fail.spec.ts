import { test } from '../fixture/baseFixture';

test.use({ accountUsername: 'Peter' });
test('download csv fail', async ({ page, materialPage }) => {
  await page.route('**/load-request/list', async route => {
    await route.abort();
  });

  await test.step(`download csv failed.`, async () => {
    await page.getByRole('button', { name: 'Download' }).click();

    await materialPage.checkAndCloseAlert('Export download failed.');
  });
});