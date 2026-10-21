const { test, expect, openApp, goTab } = require('../support/fixtures');

test('Ajustes: name is saved and used in the greeting; font size toggles', async ({ page }) => {
  await openApp(page);
  await goTab(page, 'Ajustes');
  await expect(page.locator('#screen h1, #screen h2').first()).toContainText(/Ajustes/);
  const input = page.locator('#screen input[type="text"]').first();
  await input.fill('Maria');
  await page.getByRole('button', { name: 'Salvar nome' }).click();
  await goTab(page, 'Hoje');
  await expect(page.locator('#screen h1').first()).toContainText('Maria');

  await goTab(page, 'Ajustes');
  const before = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  await page.getByRole('button', { name: /A\+, texto maior/ }).click();
  const after = await page.evaluate(() => getComputedStyle(document.documentElement).fontSize);
  expect(parseFloat(after)).toBeGreaterThan(parseFloat(before));
  await page.reload();
  await page.locator('#screen h1').first().waitFor();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).fontSize)).toBe(after);
});
