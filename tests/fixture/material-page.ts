import { expect, Locator, Page } from '@playwright/test';
import { MAT_MONTH_MAP, MatDate } from '../CONSTANT';

export class MaterialPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  matOverlay() {
    return this.page.locator('.cdk-overlay-container');
  }

  matDialog() {
    return this.page.locator('mat-dialog-container');
  }

  matSpinner() {
    return this.page.locator('mat-spinner');
  }

  matOption() {
    return this.page.locator('mat-option');
  }

  /**
   *
   * @param selectLocator the locator where the select button is
   * @param options the options to select the dropdown
   * @param waitForSpinner default true, whether waits for mat spinner or not, if true, there is a need to slow down the api by intercept the request
   */
  async selectMultiOptions(selectLocator: Locator, options: string[], waitForSpinner = false) {
    await selectLocator.click();
    for (const option of options) {
      await this.page.getByRole('option', { name: option }).click();
      if (waitForSpinner) {
        await this.waitForSpinner();
      }
    }
    await this.page.keyboard.press('Escape');
  }

  async selectDateRangerPicker(containerLocator: Locator, from: MatDate, to: MatDate | undefined = undefined) {
    const calendarIcon = containerLocator.locator(`button[aria-label="Open calendar"]`);
    await calendarIcon.click();
    const calendar = this.page.locator(`mat-calendar`);
    await calendar.waitFor();
    await this.selectMatDate(from);
    if (to) {
      await this.selectMatDate(to);
    } else {
      await this.page.keyboard.press('Escape');
    }
    await calendar.waitFor({ state: 'hidden' });
  }

  private async selectMatDate(d: MatDate) {
    const calendar = this.page.locator(`mat-calendar`);
    await calendar.locator(`[aria-label="Choose month and year"]`).click();

    // navigate to year select which desired year in range
    let firstYear = await calendar.getByRole('gridcell').first().innerText();
    while (d.year < Number(firstYear)) {
      await calendar.getByLabel('Previous 24 years').click();
      firstYear = await calendar.getByRole('gridcell').first().innerText();
    }
    let lastYear = await calendar.getByRole('gridcell').last().innerText();
    while (d.year > Number(lastYear)) {
      await calendar.getByLabel('Next 24 years').click();
      lastYear = await calendar.getByRole('gridcell').last().innerText();
    }

    await calendar.getByRole('button', { name: d.year + '', exact: true }).click();
    await calendar.getByLabel(MAT_MONTH_MAP[d.month]).click();
    await calendar.getByLabel(`${MAT_MONTH_MAP[d.month]} ${d.day},`).click();
  }

  async waitForSpinner() {
    await this.matSpinner().waitFor();
    await this.matSpinner().waitFor({ state: 'hidden' });
  }

  async checkAndCloseAlert(text: string | RegExp) {
    const snackBarContainer = this.page.locator('mat-snack-bar-container');
    const snackBarLabel = this.page.locator('.mat-mdc-snack-bar-label.mdc-snackbar__label');
    await snackBarContainer.waitFor();
    await expect(snackBarLabel).toHaveText(text);
    await snackBarContainer.getByRole('button').click();
  }
}
