const { test, expect, openApp, goTab } = require('../support/fixtures');

// Perfil de iPhone (Safari): o convite "Adicionar à Tela de Início" aparece sozinho.
test.use({
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});

test('convite de instalação no iPhone não cobre nada e o último botão continua tocável', async ({ page }) => {
  await openApp(page, { clock: false });
  const hint = page.locator('.install-hint');
  await expect(hint).toBeVisible({ timeout: 10_000 });
  await expect(hint).toContainText('Adicionar à Tela de Início');

  // Em qualquer tela, o aviso não pode sobrepor a área de rolagem.
  for (const tab of ['Hoje', 'Mente', 'Corpo', 'Cuidado']) {
    await goTab(page, tab);
    const r = await page.evaluate(() => {
      const s = document.querySelector('#screen').getBoundingClientRect();
      const b = document.querySelector('.install-hint').getBoundingClientRect();
      return { screenBottom: s.bottom, hintTop: b.top };
    });
    expect(r.hintTop, `aviso sobrepõe a tela em ${tab}`).toBeGreaterThanOrEqual(r.screenBottom - 0.5);
  }

  // O último botão da tela Mente (rolando até o fim) tem que receber o toque, não o aviso.
  await goTab(page, 'Mente');
  const hit = await page.evaluate(() => {
    const screen = document.querySelector('#screen');
    screen.scrollTop = screen.scrollHeight;
    const buttons = [...screen.querySelectorAll('button')];
    const last = buttons[buttons.length - 1];
    last.scrollIntoView({ block: 'end' });
    const r = last.getBoundingClientRect();
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { ok: el === last || last.contains(el), top: el && el.className };
  });
  expect(hit.ok, `toque no último botão interceptado por: ${hit.top}`).toBe(true);

  // Dispensar: some e não volta depois de recarregar.
  await page.getByRole('button', { name: 'Agora não' }).click();
  await expect(hint).toHaveCount(0);
  await page.reload();
  await page.waitForTimeout(5000);
  await expect(page.locator('.install-hint')).toHaveCount(0);
});
