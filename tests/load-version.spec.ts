import test from './baseFixture';
import { expect } from '@playwright/test';

test.describe('LV - ', async () => {

  test('Version QA Table', async ({ loggedInPage, materialPo }) => {
    const matDialog = materialPo.matDialog();

    await loggedInPage.getByRole('link', { name: 'Version QA' }).click();

    await expect(loggedInPage.getByRole('table').locator('tbody tr')).not.toHaveCount(0);

    await test.step(`Accept version QA`, async () => {
      await loggedInPage.locator('tbody tr td .fake-link').nth(1).click();
      await loggedInPage.getByRole('button', { name: 'Accept' }).click();
      await matDialog.waitFor();
      await matDialog.getByPlaceholder('Notes').fill('Accepted by me');
      await matDialog.getByRole('button', { name: 'Save' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPo.checkAndCloseAlert('Activity added successfully.');
      await expect(loggedInPage.locator('app-load-version-activity').getByText('Accepted by me')).toBeVisible();
      await expect(loggedInPage.locator('app-load-version-note').getByText('Accepted by me')).toBeVisible();
    });

    await test.step('Add note', async () => {
      await loggedInPage.getByRole('button', { name: 'Add Note' }).click();
      for (const [index, tag] of ['Test.Hashtag1', 'Test.Hashtag2', 'New Test Note'].entries()) {
        await loggedInPage.getByPlaceholder('New Hashtag...').fill(tag);
        await loggedInPage.keyboard.press('Enter');
        await expect(loggedInPage.locator('mat-chip-row')).toHaveCount(index + 1);
      }

      await loggedInPage.locator('mat-dialog-content textarea').fill('New Test Note');
      await loggedInPage.getByRole('button', { name: 'Save' }).click();
      await materialPo.checkAndCloseAlert('Note added successfully.');
      await expect(loggedInPage.locator('app-load-version-note').getByText('#Test.Hashtag2')).toBeVisible();
    });

    await test.step(`Open QA Report page`, async () => {
      const [qaReportPage] = await Promise.all([
        loggedInPage.waitForEvent('popup'),
        loggedInPage.getByRole('link', { name: 'Go to QA Report' }).click(),
      ]);

      await expect(qaReportPage).toHaveTitle(`Version QA Report`);
    });
  });

  test('Rule Message', async ({ loggedInPage }) => {
    await loggedInPage.goto('/load-version-report/0');
    const firstRow = 'app-load-version-report-rule-message tbody tr:first-of-type';
    await expect(loggedInPage.locator(firstRow)).toContainText('Code.Hierarchy.OrphanCode');
    await expect(loggedInPage.locator(firstRow)).toContainText('Error');
    await expect(loggedInPage.locator(firstRow)).toContainText('Code D90012 is not mapped to a term');

    await loggedInPage.locator('#messageGroupSearch').selectOption('Warning');
    await expect(loggedInPage.locator(firstRow)).not.toContainText('Code D90012 is not mapped to a term');
  });

  test('QA Rules', async ({ loggedInPage }) => {
    await loggedInPage.goto('/load-version-report/0');
    const row = 'app-load-version-report-rule tbody tr:nth-of-type(2)';
    await expect(loggedInPage.locator(row)).toContainText('Code.DuplicateCode');
    await expect(loggedInPage.locator(row)).toContainText('No duplicate codes in cs_code table');
    await expect(loggedInPage.locator(`${row} td:nth-of-type(4)`)).toContainText('5');

    await loggedInPage.locator('app-load-version-report-rule #nameFilterInput').fill('QaCount');
    await loggedInPage.keyboard.press('Enter');

    await expect(loggedInPage.locator(row)).not.toContainText('No duplicate codes in cs_code table');
    await expect(loggedInPage.locator(row)).toContainText('Raw counts are not present');
  });

  test('Note Filters', async ({ loggedInPage }) => {
    await loggedInPage.goto('/load-versions');
    await loggedInPage.locator('tbody tr td .fake-link', { hasText: '20231012080001' }).click();

    const tbody = 'app-load-version-note tbody';

    await expect(loggedInPage.locator(tbody)).toContainText('TestTag');
    await expect(loggedInPage.locator(tbody)).toContainText('Tag.3');

    await loggedInPage.locator('#hashtagsFilterInput').selectOption('Tag2');
    await expect(loggedInPage.locator(tbody)).toContainText('Note2');
    await expect(loggedInPage.locator(tbody)).not.toContainText('TestTag');
    await expect(loggedInPage.locator(tbody)).not.toContainText('Tag.3');

    await loggedInPage.locator('#hashtagsFilterInput').selectOption('ALL');
    await expect(loggedInPage.locator(tbody)).toContainText('TestTag');
    await expect(loggedInPage.locator(tbody)).toContainText('Tag.3');

    await loggedInPage.locator('#noteInput').fill('Second');
    await expect(loggedInPage.locator(tbody)).toContainText('Note2');
    await expect(loggedInPage.locator(tbody)).not.toContainText('TestTag');
    await expect(loggedInPage.locator(tbody)).not.toContainText('Tag.3');

    await loggedInPage.locator('#noteInput').clear();
    await loggedInPage.locator('#createdBySearchInput').selectOption('ludetc');
    await expect(loggedInPage.locator(tbody)).toContainText('Note2');
    await expect(loggedInPage.locator(tbody)).not.toContainText('TestTag');
    await expect(loggedInPage.locator(tbody)).not.toContainText('Tag.3');

    await loggedInPage.locator('#createdBySearchInput').selectOption('ALL');
    await expect(loggedInPage.locator(tbody)).toContainText('TestTag');
    await expect(loggedInPage.locator(tbody)).toContainText('Tag.3');
  });
});