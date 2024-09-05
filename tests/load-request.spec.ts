import test from './baseFixture';
import { expect } from '@playwright/test';
import { readFileSync } from 'fs';

test('Load Request Tab', async ({ page, materialPo }) => {
  test.slow();
  const matDialog = materialPo.matDialog();

  await expect(page.getByRole('link', { name: 'Load Request' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create Request' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Download' })).toBeVisible();

  await expect(page.getByRole('table').locator('tbody tr.example-element-row')).not.toHaveCount(0);

  // this api interception is to make network slow, so the spinner can be verified.
  await page.route('/load-request/list', async route => {
    await page.waitForTimeout(2000);
    await route.continue();
  });
  await page.route('/api/loadRequest/', async route => {
    await page.waitForTimeout(2000);
    await route.continue();
  });

  await test.step('add load request', async () => {
    await page.getByRole('button', { name: 'Create Request' }).click();
    await matDialog.waitFor();
    /**
     * note: We can use `await page.getByRole('radio', {name: 'Regular'}).check();`
     * but using `matDialog` instead of `page` is it ensures those fields are inside a dialog modal
     */
    await matDialog.getByRole('radio', { name: 'Regular' }).check();
    await matDialog.getByLabel('Code System Name').click();
    /**
     * mat-option is not attached to modal, it appends to end of app root tag, so using page instead of `matDialog`.
     */
    await page.getByRole('option', { name: 'HPO' }).click();
    await matDialog.getByLabel('Request Subject').fill('newly created load request');
    await matDialog.getByPlaceholder('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/').fill('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/LOINC/LOINC2020/');
    await matDialog.getByLabel('Notification Email').fill('playwright@example.com');
    await matDialog.getByRole('button', { name: 'Submit' }).click();
    await matDialog.waitFor({ state: 'hidden' });
    await materialPo.checkAndCloseAlert(/Request \(ID: \d+\) created successfully/);
  });

  await test.step('search for newly added load request', async () => {
    await page.locator('[id="opRequestSeqFilterInput"]').fill('149');
    await page.getByPlaceholder('Any Request date').click();
    await materialPo.matOption().filter({ hasText: `Today's` }).click(); // this line triggers search
    await materialPo.waitForSpinner();

    await expect(page.locator('td:has-text("Regular")')).toBeVisible();
    await expect(page.locator('td:has-text("HPO")')).toBeVisible();
    await expect(page.getByText('newly created load request')).toBeVisible();
  });

  await test.step(`download newly added load request`, async () => {
    const [, downloadFile] = await Promise.all([
      page.getByRole('button', { name: 'Download' }).click(),
      page.waitForEvent('download')],
    );

    await materialPo.checkAndCloseAlert('Export downloaded.');

    const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
    expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
    expect(fileContent).toContain('"149","HPO","newly created load request","Open","Regular"');
  });

  await test.step(`edit load request`, async () => {
    await page.getByText('newly created load request').click();
    await page.getByRole('button', { name: 'Edit' }).click();
    await matDialog.waitFor();
    await matDialog.getByRole('radio', { name: 'Emergency' }).check();
    await matDialog.getByLabel('Code System Name').click();
    await page.getByRole('option', { name: 'CPT' }).click();
    await matDialog.getByLabel('Request Subject').fill('newly edited load request');
    await matDialog.getByPlaceholder('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/').fill('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/june-26-2024');
    await matDialog.getByLabel('Notification Email').fill('playwright-edit@example.com');
    await matDialog.getByRole('button', { name: 'Submit' }).click();
    await matDialog.waitFor({ state: 'hidden' });
    await materialPo.checkAndCloseAlert(/Request \(ID: \d+\) edited successfully/);
  });

  await test.step('search for newly edited load request', async () => {
    await page.locator('[id="opRequestSeqFilterInput"]').fill('149');
    // next 2 lines might fall, if the test runs first step on Saturday 11:59 PM and this step runs on Sunday 00:00 AM. This week's filter will fail. But this is very unlikely
    await page.getByPlaceholder('Any Request date').click();
    await materialPo.matOption().filter({ hasText: `This week's` }).click(); // this line triggers search
    await materialPo.waitForSpinner();

    await expect(page.locator('td:has-text("Emergency")')).toBeVisible();
    await expect(page.locator('td:has-text("CPT")')).toBeVisible();
    await expect(page.getByText('newly edited load request')).toBeVisible();
  });

  await test.step(`download newly edited load request`, async () => {
    const [, downloadFile] = await Promise.all([
      page.getByRole('button', { name: 'Download' }).click(),
      page.waitForEvent('download')],
    );

    await materialPo.checkAndCloseAlert('Export downloaded.');

    const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
    expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
    expect(fileContent).toContain('"149","CPT","newly edited load request","Open","Emergency"');
  });

  await test.step(`cancel load request`, async () => {
    await page.getByText('newly edited load request').click();
    await page.getByRole('button', { name: 'Cancel' }).click();
    await matDialog.waitFor();
    await matDialog.getByRole('button', { name: 'Confirm' }).click();
    await matDialog.waitFor({ state: 'hidden' });
    await materialPo.checkAndCloseAlert(/Request \(ID: \d+\) deleted successfully/);
  });

  await test.step('search for newly cancelled load request', async () => {
    await page.locator('[id="requestStatusInput"]').selectOption('Cancelled'); // this line triggers search
    await materialPo.waitForSpinner();
    await expect(page.locator('td:has-text("Emergency")')).toBeVisible();
    await expect(page.locator('td:has-text("CPT")')).toBeVisible();
    await expect(page.locator('td:has-text("Cancelled")')).toBeVisible();
    await expect(page.getByText('newly edited load request')).toBeVisible();
  });

  await test.step(`download newly cancelled load request`, async () => {
    const [, downloadFile] = await Promise.all([
      page.getByRole('button', { name: 'Download' }).click(),
      page.waitForEvent('download')],
    );

    await materialPo.checkAndCloseAlert('Export downloaded.');

    const fileContent = readFileSync(await downloadFile.path(), { encoding: 'utf-8' });
    expect(fileContent).toContain('opRequestSeq, codeSystemName, requestSubject, requestStatus, requestType, requestTime, requester, creationTime');
    expect(fileContent).toContain('"149","CPT","newly edited load request","Cancelled","Emergency"');
  });

  await page.unrouteAll({ behavior: 'ignoreErrors' });
});
