import { test, expect } from '@playwright/test';

test('галерея, прямая ссылка, фильтр, создание и сброс после перезагрузки', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /От макета/ })).toBeVisible();
  await page.getByRole('link', { name: /Коллекция/ }).click();
  await expect(page.getByTestId('row-count')).toHaveText('12');
  await expect(page.locator('canvas').first()).toBeVisible();
  await page.getByRole('button', { name: 'Мятные', exact: true }).click();
  await expect(page.getByTestId('row-count')).toHaveText('4');
  await page.getByRole('button', { name: 'Все', exact: true }).click();
  await page.getByRole('button', { name: 'Добавить предмет', exact: true }).click();
  await page.getByLabel('Название', { exact: true }).fill('Тестовый сценарий');
  await page.getByLabel('Количество', { exact: true }).fill('25');
  await page.getByRole('button', { name: 'Добавить', exact: true }).click();
  await expect(page.getByTestId('row-count')).toHaveText('13');
  await page.reload();
  await expect(page.getByTestId('row-count')).toHaveText('12');
  await page.getByRole('button', { name: 'Сбросить демо' }).click();
  await expect(page.getByTestId('row-count')).toHaveText('12');
  await page.getByRole('tab', { name: 'С высокой оценкой' }).click();
  await expect(page.getByTestId('row-count')).toHaveText('4');
  expect(errors).toEqual([]);
});

test('поиск TableCanvas и группировка доступны', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && message.text().includes('TypeError')) errors.push(message.text()); });
  await page.goto('/#/collection');
  const search = page.getByPlaceholder('Поиск', { exact: true });
  await search.fill('фонарик');
  await expect(page.getByTestId('row-count')).toHaveText('1');
  await search.fill('');
  await expect(page.getByTestId('row-count')).toHaveText('12');
  await page.getByText('Группировать', { exact: true }).click();
  await expect(page.getByText('Цвет', { exact: true }).last()).toBeVisible();
  await page.getByText('Цвет', { exact: true }).last().click();
  await page.keyboard.press('Escape');
  await expect(page.locator('canvas').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('канвас: выбор строки, изменение количества, сохранение и отмена', async ({ page }) => {
  await page.goto('/#/collection');
  const canvas = page.getByTestId('data-grid-canvas');
  await expect(canvas).toBeVisible();
  // Glide receives pointer events through its transparent scroller over the canvas.
  // Coordinates are relative to the fixed recipe geometry: header 34, row 48.
  let bounds = (await canvas.boundingBox())!;
  await page.mouse.click(bounds.x + 24, bounds.y + 58);
  await expect(page.getByTestId('selection-count')).toHaveText('1');
  await page.getByRole('button', { name: 'Редактировать', exact: true }).click();
  bounds = (await canvas.boundingBox())!;
  await page.mouse.dblclick(bounds.x + 900, bounds.y + 58);
  const editor = page.locator('input[inputmode="numeric"]');
  await expect(editor).toBeVisible();
  await editor.fill('20');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('quantity-total')).toHaveText('306,00');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page.getByTestId('quantity-total')).toHaveText('306,00');
  await page.reload();
  await expect(page.getByTestId('quantity-total')).toHaveText('294,00');
  await page.getByRole('button', { name: 'Редактировать', exact: true }).click();
  bounds = (await canvas.boundingBox())!;
  await page.mouse.dblclick(bounds.x + 900, bounds.y + 58);
  await editor.fill('30');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('quantity-total')).toHaveText('316,00');
  await page.getByRole('button', { name: 'Отменить', exact: true }).click();
  await expect(page.getByTestId('quantity-total')).toHaveText('294,00');
});

test('галерея помещается на узком экране', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Коллекция/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('новое открытие варианта начинает демо заново и не пишет в хранилища браузера', async ({ page }) => {
  await page.goto('/#/collection');
  const initialStorage = await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }));
  await page.getByRole('button', { name: 'Добавить предмет', exact: true }).click();
  await page.getByLabel('Название', { exact: true }).fill('Новая открытка');
  await page.getByRole('button', { name: 'Добавить', exact: true }).click();
  await expect(page.getByTestId('row-count')).toHaveText('13');
  expect(await page.evaluate(() => ({ local: { ...localStorage }, session: { ...sessionStorage } }))).toEqual(initialStorage);
  await page.getByRole('link', { name: 'Все прототипы', exact: true }).click();
  await page.getByRole('link', { name: /Коллекция/ }).click();
  await expect(page.getByTestId('row-count')).toHaveText('12');
});
