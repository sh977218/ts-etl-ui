import { test } from '../fixture/baseFixture';
import { expect } from '@playwright/test';

const loadNumber = '20250501081501';
test.use({ accountUsername: 'Christophe', loadNumber });
test('Note Filters', async ({ page, acceptRejectLoadVersionQaPage }) => {
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
