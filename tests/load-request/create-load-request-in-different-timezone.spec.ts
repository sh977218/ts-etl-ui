import { expect } from '@playwright/test';

import test from '../fixture/baseFixture';
import { EU_TIMEZONE } from '../CONSTANT';

test.use({ accountUsername: 'Peter', timezoneId: EU_TIMEZONE });
test('Create Load Request in different timezone', async ({ page, materialPage }) => {
  const newCreateSubject = `newly ${EU_TIMEZONE} created load request ${new Date().toISOString()}`;
  const matDialog = materialPage.matDialog();

  // this api interception is to make network slow, so the spinner can be verified.
  await page.route('**/load-request/list', async route => {
    await page.waitForTimeout(2000);
    await route.continue();
  });

  await page.route('**/loadRequest/', async route => {
    await page.waitForTimeout(2000);
    await route.continue();
  });

  await test.step(`add load request in ${EU_TIMEZONE}`, async () => {
    await page.getByRole('button', { name: 'Create Request' }).click();
    await matDialog.waitFor();
    /**
     * note: We can use `await page.getByRole('radio', {name: 'Regular'}).check();`
     * but using `matDialog` instead of `page` is it ensures those fields are inside a dialog modal
     */
    await matDialog.getByRole('radio', { name: 'Scheduled' }).check();
    await matDialog.getByRole('button', { name: 'Open calendar' }).click();
    await page.locator(`mat-calendar`).waitFor();
    await page.locator('.mat-calendar-body-cell.mat-calendar-body-active').click();
    await page.locator(`mat-calendar`).waitFor({ state: 'hidden' });
    await matDialog.getByRole('combobox', { name: 'Scheduled time' }).click();
    await page.getByRole('option', { name: '11:30 PM' }).click();
    await matDialog.getByLabel('Code System Name').click();
    /**
     * mat-option is not attached to modal, it appends to end of app root tag, so using page instead of `matDialog`.
     */
    await page.getByRole('option', { name: 'HPO' }).click();
    await matDialog.getByLabel('Request Subject').fill(newCreateSubject);
    await matDialog.getByLabel('Source File Path').fill('file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/LOINC/LOINC2020/');
    await page.locator('mat-dialog-container h2').click();
    await matDialog.getByLabel('Notification Email').fill('playwright@example.com');
    await matDialog.getByRole('button', { name: 'Submit' }).click();
    await matDialog.waitFor({ state: 'hidden' });
    await materialPage.checkAndCloseAlert(/Request \(ID: \d+\) created successfully/);
  });

  await test.step(`verify load request created in ${EU_TIMEZONE}`, async () => {
    await page.getByPlaceholder('subject...').fill(newCreateSubject);
    await page.getByRole('button', { name: 'Search' }).click();
    await materialPage.waitForSpinner();
    const tableRows = page.locator('tbody[role="rowgroup"]').getByRole('row');
    await expect(tableRows.first().locator('td').nth(5)).toContainText(/(EDT|EST)/);
  });

  await page.unrouteAll({ behavior: 'ignoreErrors' });
});
