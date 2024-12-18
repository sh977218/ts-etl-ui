import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';

const loadNumber = '20270501081501';
test.use({ accountUsername: 'Christophe', loadNumber });

test('add note to load version qa', async ({ page, materialPage, loadVersionQaPage }) => {
  const matDialog = materialPage.matDialog();
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
    await expect(page.locator('app-load-version-note').getByText('#Test.Hashtag2')).not.toHaveCount(0);
  });

});
