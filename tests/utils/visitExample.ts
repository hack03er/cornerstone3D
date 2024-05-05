import { Page } from '@playwright/test';

export async function visitExample(page: Page, title: string) {
  await page.click(`a:has-text("${title}")`);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForSelector('div#content');
}
