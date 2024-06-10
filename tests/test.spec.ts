import { test, expect, Page } from '@playwright/test';

class MaterialPO {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  matOverlay() {
    return this.page.locator('.cdk-overlay-container')
  }

  matDialog() {
    return this.page.locator('mat-dialog-container')
  }

  async checkAndCloseAlert(text: string) {
    const snackBarContainer = this.page.locator('mat-snack-bar-container');
    const snackBarLabel = this.page.locator('.mat-mdc-snack-bar-label.mdc-snackbar__label')
    await snackBarContainer.waitFor()
    await expect(snackBarLabel).toHaveText(text);
    await snackBarContainer.getByRole('button').click();
  }

}

test.describe('e2e test', async () => {
  test.beforeEach(async ({page, baseURL}) => {
    await page.goto('/');
    // Expect a title "to contain" a substring.
    await test.step('has title', async () => {
      await expect(page).toHaveTitle('TS ETL UI');
    })
    await test.step('has login required message', async () => {
      await expect(page.getByRole('heading').getByText('his application requires you to log in. Please do so before proceeding.')).toBeVisible()
    })

    await test.step('login', async () => {
      await page.getByRole('button', {name: 'Log In'}).click();
      await page.getByRole('button', {name: 'UTS'}).click();
      await page.waitForURL(baseURL || '')
    })
  })

  test('Load Request Tab', async ({page}) => {
    const materialPo = new MaterialPO(page);
    const matDialog = materialPo.matDialog();

    await expect(page.getByRole('tab', {name: 'Load Request'})).toBeVisible();

    await expect(page.getByRole('button', {name: 'Search'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Reset'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Create Request'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'Download'})).toBeVisible();

    await expect(page.getByRole('table').locator('tbody tr.example-element-row')).not.toHaveCount(0)

    await test.step('add load request', async () => {
      await page.getByRole('button', {name: 'Create Request'}).click();
      await matDialog.waitFor();
      /**
       * note: We can use `await page.getByRole('radio', {name: 'Regular'}).check();`
       * but using `matDialog` instead of `page` is it ensures those fields are inside a dialog modal
       */
      await matDialog.getByRole('radio', {name: 'Regular'}).check();
      await matDialog.getByLabel('Code System Name').click();
      /**
       * mat-option is not attached to modal, it appends to end of app root tag, so using page instead of `matDialog`.
       */
      await page.getByRole('option', {name: 'HPO'}).click()
      await matDialog.getByLabel('Request Subject').fill('newly created load request');
      await matDialog.locator('[id="sourcePathFile"]').setInputFiles('./tests/glass.jpg');
      await expect(matDialog.locator('.file-upload')).toContainText('glass.jpg')

      await matDialog.getByRole('button', {name: 'Submit'}).click();
      await matDialog.waitFor({state: 'hidden'})
      await materialPo.checkAndCloseAlert('Successfully created load request.')
    })

    await test.step('search for newly added load request', async () => {
      await page.getByLabel('Filter by all fields').fill('newly created load request');
      await page.getByRole('button', {name: 'Search'}).click();
      await expect(page.getByText('Regular')).toBeVisible()
      await expect(page.getByText('glass.jpg')).toBeVisible()
      await expect(page.getByText('HPO')).toBeVisible()
      await expect(page.getByText('newly created load request')).toBeVisible()
    })
  })

  test('Version QA Tab', async ({page}) => {
    const materialPo = new MaterialPO(page);
    const matDialog = materialPo.matDialog();

    await page.getByRole('tab', {name: 'Version QA'}).click();

    await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(0)

    await test.step(`Accept version QA`, async()=>{
      const versionQRows = page.getByRole('table').locator('tbody tr');
      const collapsedRow = versionQRows.first();
      const expandedRow = versionQRows.nth(1)
      await collapsedRow.click();
      await expandedRow.getByRole('button', {name: 'Accept'}).click();
      await matDialog.waitFor()
      await matDialog.getByPlaceholder('Notes').fill('Accepted by me');
      await matDialog.getByRole('button', {name: 'Save'}).click();
      await matDialog.waitFor({state: 'hidden'})

      const activityHistoryFirstRow = page.locator('mat-card-content > table')
        .nth(1)
        .locator('tbody tr')
        .first()
      await activityHistoryFirstRow.click();
      await expect(page.getByText('Accepted by me')).toBeVisible()
    })
  })

  test('Code System Tab', async ({page}) => {
    await page.getByRole('tab', {name: 'Code System'}).click()
    await expect(page.getByRole('table').locator('tbody tr')).not.toHaveCount(0)
  })
});
