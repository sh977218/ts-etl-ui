import test from './baseFixture';
import { expect } from '@playwright/test';

test('Empty user', async ({ emptyUserPage }) => {
  await expect(emptyUserPage).toHaveURL(/login-cb\?ticket=ghost-ticket/);
});