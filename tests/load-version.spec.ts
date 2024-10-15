import test from './baseFixture';
import { expect, test as pwTest } from '@playwright/test';
import { readFileSync } from 'fs';

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
    await expect(page.locator(firstRow)).toContainText('The difference of TERM');
    await page.locator('#messageGroupSearch').selectOption('All');

    await page.locator('#messageTypeSearch').selectOption('DEV');
    await expect(page.locator(firstRow)).toContainText('Code D90012 is not mapped to a term');
    await expect(page.locator(firstRow)).not.toContainText('The difference of TERM');
    await page.locator('#messageTypeSearch').selectOption('All');

    await page.locator('#tagSearch').selectOption('DUPLICATE_CODE_COUNT');
    await expect(page.locator(firstRow)).not.toContainText('The difference of TERM');
    await expect(page.locator(firstRow)).toContainText('Code D90001 appears more than once');
    await page.locator('#tagSearch').selectOption('All');
  });

  test('QA Rules', async ({ page, materialPo }) => {
    await page.goto('/load-version-report/0');
    const row = 'app-load-version-report-rule tbody tr:nth-of-type(2)';
    await expect(page.locator(row)).toContainText('Code.DuplicateCode');
    await expect(page.locator(row)).toContainText('No duplicate codes in cs_code table');
    await expect(page.locator(`${row} td:nth-of-type(4)`)).toContainText('5');

    await page.locator('app-load-version-report-rule #nameFilterInput').fill('QaCount');
    await page.keyboard.press('Enter');

    await test.step(`log view modal`, async () => {
      const row1 = 'app-load-version-report-rule tbody tr:nth-of-type(1)';
      await page.locator(row1).locator('mat-icon', { hasText: 'announcement' }).click();
      await materialPo.matDialog().waitFor();
      await expect(materialPo.matDialog().getByText('The difference of TERM between expected and actual number is')).toBeVisible();
      await materialPo.matDialog().getByRole('button', { name: 'Close' }).click();
      await materialPo.matDialog().waitFor({ state: 'hidden' });
    });

    await expect(page.locator(row)).not.toContainText('No duplicate codes in cs_code table');
    await expect(page.locator(row)).toContainText('Raw counts are not present');
  });

  test('Note Filters', async ({ page }) => {
    await page.goto('/load-versions');
    await page.locator('tbody tr td .fake-link', { hasText: '20231012080001' }).click();

    const tbody = 'app-load-version-note tbody';

    await expect(page.locator(tbody)).toContainText('TestTag');
    await expect(page.locator(tbody)).toContainText('Tag.3');

    await page.locator('#activityIdInput').pressSequentially('2024');
    await expect(page.locator(tbody)).not.toContainText('TestTag');
    await page.locator('#activityIdInput').clear();

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

  test('Table Expanded', async ({ page }) => {
    await page.goto('/load-versions?loadNumber=20231012080001&expand=0');
    await page.getByRole('link', { name: 'Go to QA Report' });

    await page.locator(`[id="versionFilterInput"]`).fill('2023');
    await page.keyboard.press('Enter');
    await page.getByRole('columnheader', { name: 'Code System Name' }).click();
    await expect(page).toHaveURL(/loadNumber=20231012080001/);
    await expect(page).toHaveURL(/version=2023/);
    await expect(page).toHaveURL(/sortBy=codeSystemName/);
  });

  test('Collapse Table', async ({ page }) => {
    await page.goto('/load-versions?loadNumber=20231012080001&expand=0');
    await expect(page.locator('main')).toContainText('View Source Data Files');
    await page.locator('tbody tr td .fake-link', { hasText: '20231012080001' }).click();
    await expect(page.locator('main')).not.toContainText('View Source Data Files');
  });

  test('Edit Activity Avail Date', async ({ page, materialPo }) => {
    await page.goto('/load-versions?loadNumber=20231012080001&expand=0');
    await page.getByRole('link', { name: 'Go to QA Report' });
    await page.getByRole('button', { 'name': 'Edit available date' }).click();
    await page.locator('app-load-version-activity input').clear();
    await page.locator('app-load-version-activity input').fill('2025-03-10');
    await page.getByRole('button', { 'name': 'Confirm' }).click();
    await materialPo.checkAndCloseAlert('Available Date Updated');
    await expect(page.locator('app-load-version-activity')).toContainText('2025/03');
  });

  test(`download newly added load request`, async ({ page, materialPo }) => {
    await page.goto('/load-versions?loadNumber=20231012080001&expand=0');
    const [, downloadFile] = await Promise.all([
      page.getByRole('button', { name: 'Download' }).click(),
      page.waitForEvent('download')],
    );

    await materialPo.checkAndCloseAlert('QA Activities downloaded.');

    const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
    expect(fileContent).toContain('id, activity,');
    expect(fileContent).toContain('"2023-07-02T04:00:00.000Z","Accept",');
  });

});

pwTest('QA report on localhost 4200', async ({ page }) => {
  await page.goto('http://localhost:4200');
  await page.getByRole('button', { name: 'Log In' }).click();
  await page.getByRole('link', { name: 'UTS' }).click();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.locator('[name="ticket"]').selectOption('Peter');
  await page.getByRole('button', { name: 'Ok' }).click();
  await page.waitForURL(/load-requests/);
  await expect(page.getByRole('button', { name: 'Download' })).toBeVisible();

  await page.goto('http://localhost:4200/load-version-report/0');
  const row = 'app-load-version-report-rule tbody tr:nth-of-type(2)';
  await expect(page.locator(row)).toContainText('Code.DuplicateCode');
});
