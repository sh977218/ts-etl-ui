import test from './baseFixture';
import { expect } from '@playwright/test';

test.describe('LV - ', async () => {

  test('Version QA Table', async ({ page, materialPo }) => {
    const matDialog = materialPo.matDialog();

    await page.getByRole('link', { name: 'Version QA' }).click();

    await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(0);

    await test.step(`Accept version QA`, async () => {
      await page.locator('tbody tr td .fake-link').nth(1).click();
      await page.getByRole('button', { name: 'Accept' }).click();
      await matDialog.waitFor();
      await matDialog.getByPlaceholder('Notes').fill('Accepted by me');
      await matDialog.getByRole('button', { name: 'Save' }).click();
      await matDialog.waitFor({ state: 'hidden' });
      await materialPo.checkAndCloseAlert('Activity added successfully.');
      await expect(page.locator('app-load-version-activity').getByText('Accepted by me')).toBeVisible();
      await expect(page.locator('app-load-version-note').getByText('Accepted by me')).toBeVisible();
    });

    await test.step('Add note', async () => {
      await page.getByRole('button', { name: 'Add Note' }).click();
      for (const [index, tag] of ['Test.Hashtag1', 'Test.Hashtag2', 'New Test Note'].entries()) {
        await page.getByPlaceholder('New Hashtag...').fill(tag);
        await page.keyboard.press('Enter');
        await expect(page.locator('mat-chip-row')).toHaveCount(index + 1);
      }

      await page.locator('mat-dialog-content textarea').fill('New Test Note');
      await page.getByRole('button', { name: 'Save' }).click();
      await materialPo.checkAndCloseAlert('Note added successfully.');
      await expect(page.locator('app-load-version-note').getByText('#Test.Hashtag2')).toBeVisible();
    });

    await test.step(`Open QA Report page`, async () => {
      const [qaReportPage] = await Promise.all([
        page.waitForEvent('popup'),
        page.getByRole('link', { name: 'Go to QA Report' }).click(),
      ]);

      await expect(qaReportPage).toHaveTitle(`Version QA Report`);
    });
  });

  test('Rule Message', async ({ page }) => {
    await page.goto('/load-version-report/0');
    const firstRow = 'app-load-version-report-rule-message tbody tr:first-of-type';
    await expect(page.locator(firstRow)).toContainText('Code.Hierarchy.OrphanCode');
    await expect(page.locator(firstRow)).toContainText('Error');
    await expect(page.locator(firstRow)).toContainText('Code D90012 is not mapped to a term');

    await page.locator('#messageGroupSearch').selectOption('Warning');
    await expect(page.locator(firstRow)).not.toContainText('Code D90012 is not mapped to a term');
  });

  test('QA Rules', async ({ page }) => {
    await page.goto('/load-version-report/0');
    const row = 'app-load-version-report-rule tbody tr:nth-of-type(2)';
    await expect(page.locator(row)).toContainText('Code.DuplicateCode');
    await expect(page.locator(row)).toContainText('No duplicate codes in cs_code table');
    await expect(page.locator(`${row} td:nth-of-type(4)`)).toContainText('5');

    await page.locator('app-load-version-report-rule #nameFilterInput').fill('QaCount');
    await page.keyboard.press('Enter');

    await expect(page.locator(row)).not.toContainText('No duplicate codes in cs_code table');
    await expect(page.locator(row)).toContainText('Raw counts are not present');
  });

  test('Note Filters', async ({ page }) => {
    await page.goto('/load-versions');
    await page.locator('tbody tr td .fake-link', { hasText: '20231012080001' }).click();

    const tbody = 'app-load-version-note tbody';

    await expect(page.locator(tbody)).toContainText('TestTag');
    await expect(page.locator(tbody)).toContainText('Tag.3');

    await page.locator('#hashtagsFilterInput').selectOption('Tag2');
    await expect(page.locator(tbody)).toContainText('Note2');
    await expect(page.locator(tbody)).not.toContainText('TestTag');
    await expect(page.locator(tbody)).not.toContainText('Tag.3');

    await page.locator('#hashtagsFilterInput').selectOption('ALL');
    await expect(page.locator(tbody)).toContainText('TestTag');
    await expect(page.locator(tbody)).toContainText('Tag.3');

    await page.locator('#noteInput').fill('Second');
    await expect(page.locator(tbody)).toContainText('Note2');
    await expect(page.locator(tbody)).not.toContainText('TestTag');
    await expect(page.locator(tbody)).not.toContainText('Tag.3');

    await page.locator('#noteInput').clear();
    await page.locator('#createdBySearchInput').selectOption('ludetc');
    await expect(page.locator(tbody)).toContainText('Note2');
    await expect(page.locator(tbody)).not.toContainText('TestTag');
    await expect(page.locator(tbody)).not.toContainText('Tag.3');

    await page.locator('#createdBySearchInput').selectOption('ALL');
    await expect(page.locator(tbody)).toContainText('TestTag');
    await expect(page.locator(tbody)).toContainText('Tag.3');
  });
});