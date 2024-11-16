import { test } from '../fixture/baseFixture';
import { expect } from '@playwright/test';
import { tomorrowInMatDate } from '../CONSTANT';

const newLoadRequest = {
  codeSystemName: 'USP',
  requestSubject: `Load request detail view - created load request ${new Date().toISOString()}`,
  sourceFilePath: 'file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/USP/USP20220823',
  requestType: 'Scheduled',
  scheduledDate: tomorrowInMatDate(),
  scheduledTime: '11:30 PM',
};
const requester = 'peterhuang';
test.use({ accountUsername: 'Peter', createLoadRequest: newLoadRequest });
test.describe('Load Request detail Messages', async () => {
  if (process.env.NLM) {
    test.skip();
  }
  test('Load Request detail Messages', async ({ page, createLoadRequestPage }) => {
    await page.goto('/load-request/0');
    await expect(page.getByRole('row', { name: '# of Messages:' })).toContainText('4');
    await page.getByRole('button', { name: 'Time', exact: true }).click();
    await page.getByRole('button', { name: 'Start Time' }).click();
    await page.getByRole('button', { name: 'Creation Time' }).click();
    await page.getByRole('button', { name: 'Message Type' }).click();

    await page.locator('td:has-text("Error while extracting")');
  });

  test('Load Request detail Messages Filter', async ({ page }) => {
    await page.goto('/load-request/0');
    await expect(page.locator('app-load-component-message')).toContainText('RAW_TABLE_COUNT');
    await page.getByPlaceholder('Ex. INFO').pressSequentially('inject');
    await page.getByRole('link', { name: 'Load Request' }).focus();
    await expect(page.locator('app-load-component-message')).not.toContainText('RAW_TABLE_COUNT');
  });
  
  test('LR with no LV', async ({ page }) => {
    await page.goto('/load-request/8');
    await expect(page.locator('body')).toContainText('bensonmcgowan@zilphur.com');
  });
});
