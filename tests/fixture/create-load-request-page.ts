import type { Page } from '@playwright/test';

export class CreateLoadRequestPage {
  constructor(public readonly page: Page) {
  }

}