import { expect } from '@playwright/test';

import { test } from '../fixture/baseFixture';
import { CreateLoadRequest, EU_TIMEZONE, MatDate } from '../CONSTANT';

const newLoadRequest: CreateLoadRequest = {
  codeSystemName: 'USP',
  requestSubject: `newly ${EU_TIMEZONE} created load request ${new Date().toISOString()}`,
  sourceFilePath: 'file://nlmsambaserver.nlm.nih.gov/dev-ts-data-import/USP/USP20220823',
  requestType: 'Scheduled',
  scheduledDate: 'today',
  scheduledTime: '11:30 PM',
};
test.use({ accountUsername: 'peter', timezoneId: EU_TIMEZONE });
/**
 * do not include `createLoadRequestPage` fixture here, because we want to do more than just create load request, we validate source file path and maybe more.
 * We do those additional checks in this file only so that:
 * 1. Code coverage is met, and
 * 2. We don't want to include those checks in fixture, which would be run on all other tests, unnecessarily
 */
test('Create Load Request in different timezone - EU', async ({ page, materialPage }) => {
  await test.step('add load request', async () => {
    const matDialog = materialPage.matDialog();

    await page.getByRole('button', { name: 'Create Request' }).click();
    await matDialog.waitFor();
    await matDialog.getByLabel('Code System Name').click();
    /**
     * mat-option is not attached to modal, it appends to end of app root tag, so using page instead of `matDialog`.
     */
    await page.getByRole('option', { name: newLoadRequest.codeSystemName }).click();

    await matDialog.getByLabel('Request Subject').fill(newLoadRequest.requestSubject);

    await test.step('validate source file path load request', async () => {
      await matDialog.getByLabel('Source File Path').fill('this is not valid');
      await matDialog.getByLabel('Source File Path').fill(newLoadRequest.sourceFilePath);
    });

    await matDialog.getByRole('radio', { name: newLoadRequest.requestType }).check();
    if (newLoadRequest.requestType === 'Scheduled') {
      await matDialog.getByRole('button', { name: 'Open calendar' }).click();
      await page.locator(`mat-calendar`).waitFor();
      if (newLoadRequest.scheduledDate === 'today') {
        await page.locator('.mat-calendar-body-cell.mat-calendar-body-active').click();
      } else {
        await materialPage.selectMatDate(newLoadRequest.scheduledDate as MatDate);
      }
      await page.locator(`mat-calendar`).waitFor({ state: 'hidden' });
      await matDialog.getByRole('combobox', { name: 'Scheduled time' }).click();
      await page.getByRole('option', { name: newLoadRequest.scheduledTime }).click();
    }
    if (newLoadRequest.notificationEmail) {
      await matDialog.getByLabel('Notification Email').fill(newLoadRequest.notificationEmail);
    }
    await matDialog.getByRole('button', { name: 'Submit' }).click();
    await matDialog.waitFor({ state: 'hidden' });
    await materialPage.checkAndCloseAlert(/Request \(ID: \d+\) created successfully/);
  });

  await test.step(`verify load request created in ${EU_TIMEZONE}`, async () => {
    await page.getByPlaceholder('subject...').fill(newLoadRequest.requestSubject);
    await page.getByRole('button', { name: 'Search' }).click();
    await materialPage.waitForSpinner();
    const tableRows = page.locator('tbody[role="rowgroup"]').getByRole('row');
    await expect(tableRows.first().locator('td').nth(5)).toContainText(/(EDT|EST)/);
  });
  await page.unrouteAll({ behavior: 'ignoreErrors' });
});
