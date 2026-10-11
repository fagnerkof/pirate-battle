import { test, expect } from '@playwright/test';

test.describe('Pirate Battle - E2E Core Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('must navigate to options, save custom config, and persist in localStorage', async ({ page }) => {
    // Entra na tela de opções
    await page.click('button:has-text("Options")');
    await expect(page.getByRole('region', { name: 'Game Settings' })).toBeVisible();

    // Altera o tempo da partida para 90 segundos
    const timeInput = page.locator('#sessionTime');
    await timeInput.fill('90');

    // Salva e retorna
    await page.click('button:has-text("Save Options")');
    await expect(page.getByRole('heading', { name: 'PIRATE BATTLE' })).toBeVisible();

    // Valida persistência no localStorage
    const savedConfig = await page.evaluate(() => localStorage.getItem('pirate_battle_config'));
    expect(savedConfig).toContain('"sessionTime":90');
  });

  test('must render canvas arena, HUD elements, and handle exit', async ({ page }) => {
    await page.click('button:has-text("Play Game")');

    // Verifica presença da arena PixiJS e do HUD React
    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.getByText(/HP:/)).toBeVisible();
    await expect(page.getByText(/SCORE:/)).toBeVisible();

    // Testa saída manual
    await page.click('button:has-text("← Exit Game")');
    await expect(page.getByRole('heading', { name: 'PIRATE BATTLE' })).toBeVisible();
  });

  test('must handle window blur/focus events without errors', async ({ page }) => {
    await page.click('button:has-text("Play Game")');
    await expect(page.locator('canvas')).toBeVisible();

    // Simula perda e retorno de foco da janela
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));

    await expect(page.locator('canvas')).toBeVisible();
  });

  test('must display leaderboard and match history from MSW mocks', async ({ page }) => {
    // Aba de Ranking
    await expect(page.getByText('Blackbeard')).toBeVisible();

    // Troca para a aba de Histórico
    await page.click('button:has-text("Match History")');
    await expect(page.getByRole('tab', { name: 'Match History' })).toHaveAttribute('aria-selected', 'true');
  });
});