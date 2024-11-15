import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';

const loadNumber = '20230912080001';

test.use({ accountUsername: 'Christophe', loadNumber });
test('reject load version qa', async ({ page, materialPage, acceptRejectLoadVersionQaPage }) => {
  const matDialog = materialPage.matDialog();

  await test.step(`Reject version QA`, async () => {
    await page.getByRole('button', { name: 'Reject' }).click();
    await matDialog.waitFor();
    await matDialog.getByPlaceholder('Notes').fill('Rejected by me');
    await matDialog.getByRole('button', { name: 'Save' }).click();
    await matDialog.waitFor({ state: 'hidden' });
    await materialPage.checkAndCloseAlert('Activity added successfully.');
    await expect(page.locator('app-load-version-activity table tbody tr').last().locator('td').nth(1)).toHaveText('Reject');
  });

  await test.step('Add note', async () => {
    await page.getByRole('button', { name: 'Add Note' }).click();
    for (const [index, tag] of ['Test.Hashtag1', 'Test.Hashtag2', 'New Test Note', 'This tag should be removed'].entries()) {
      await page.getByPlaceholder('New Hashtag...').fill(tag);
      await page.keyboard.press('Enter');
      await expect(page.locator('mat-chip-row')).toHaveCount(index + 1);
    }

    await test.step('Remove one tag', async () => {
      await matDialog.locator('mat-chip-row')
        .filter({ hasText: 'This tag should be removed' })
        .getByRole('button')
        .click();
    });

    await page.locator('mat-dialog-content textarea').fill('New Test Note');
    await page.getByRole('button', { name: 'Save' }).click();
    await materialPage.checkAndCloseAlert('Note added successfully.');
    await expect(page.locator('app-load-version-note').getByText('#Test.Hashtag2')).toBeVisible();
  });
});