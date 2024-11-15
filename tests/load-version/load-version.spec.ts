import { expect } from '@playwright/test';
import { readFileSync } from 'fs';

import { test } from '../fixture/baseFixture';

test.use({ accountUsername: 'Christophe' });
test.describe('LV - ', async () => {
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

  test('QA Rules', async ({ page, materialPage }) => {
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
      await materialPage.matDialog().waitFor();
      await expect(materialPage.matDialog().getByText('The difference of TERM between expected and actual number is')).toBeVisible();
      await materialPage.matDialog().getByRole('button', { name: 'Close' }).click();
      await materialPage.matDialog().waitFor({ state: 'hidden' });
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

  test('Edit Activity Avail Date', async ({ page, materialPage }) => {
    await page.goto('/load-versions?loadNumber=20231012080001&expand=0');
    await materialPage.waitForSpinner();
    await page.getByRole('link', { name: 'Go to QA Report' });
    await page.getByRole('button', { 'name': 'Edit available date' }).click();
    await page.locator('app-load-version-activity input').clear();
    await page.locator('app-load-version-activity input').fill('2025-03-10');
    await page.getByRole('button', { 'name': 'Confirm' }).click();
    await materialPage.checkAndCloseAlert('Available Date Updated');
    await expect(page.locator('app-load-version-activity')).toContainText('2025/03');
  });

  test(`download newly added load request`, async ({ page, materialPage }) => {
    await page.goto('/load-versions?loadNumber=20231012080001&expand=0');
    await materialPage.waitForSpinner();
    const [, downloadFile] = await Promise.all([
      page.getByRole('button', { name: 'Download' }).click(),
      page.waitForEvent('download')],
    );

    await materialPage.checkAndCloseAlert('QA Activities downloaded.');

    const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
    expect(fileContent).toContain('id, activity,');
    expect(fileContent).toContain('"2023-07-02T04:00:00.000Z","Accept",');
  });

});
