import { expect, test } from '@playwright/test';

// E2E-04
// User Story: US-05
// Test Cases: TC-018
test('Manager approves a one-level direct-report Trip', async ({ page }) => {
  test.setTimeout(60_000);

  const email = process.env.E2E_MANAGER_EMAIL;
  const password = process.env.E2E_MANAGER_PASSWORD;
  test.skip(!email || !password, 'BLOCKED: manager credentials are not configured.');

  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 20_000 });
  await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
  await page.getByPlaceholder('ten@smarttravel.vn').fill(email!);
  await page.getByPlaceholder('Nhập mật khẩu').fill(password!);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();

  await expect(
    page.getByRole('heading', { name: 'Phê duyệt yêu cầu cấp 1' }),
  ).toBeVisible({ timeout: 25_000 });

  const tripCode = process.env.E2E_MANAGER_TRIP_CODE?.trim();
  test.skip(
    !tripCode,
    'BLOCKED: set E2E_MANAGER_TRIP_CODE to an isolated SUBMITTED direct-report Trip that does not require Level 2.',
  );

  const tripCard = page.locator('.ui-card').filter({ hasText: tripCode! });
  if ((await tripCard.count()) === 0) {
    test.skip(
      true,
      'BLOCKED: the configured Trip is not present in the Manager approval queue.',
    );
  }

  if ((await tripCard.getByTestId('two-level-badge').count()) > 0) {
    test.skip(
      true,
      'BLOCKED: the configured Trip requires Level 2; TC-018 requires a one-level Trip.',
    );
  }

  await expect(tripCard).toContainText(tripCode!);
  await expect(tripCard).toContainText('Chờ duyệt cấp 1');
  await tripCard.getByRole('button', { name: 'Xem & duyệt' }).click();

  await expect(page.getByText('Quyết định cấp 1')).toBeVisible();
  await expect(page.getByText(tripCode!, { exact: true })).toBeVisible();
  await expect(page.getByTestId('approval-reasons-banner')).toHaveCount(0);

  await page.getByRole('button', { name: 'Phê duyệt cấp 1' }).click();
  await expect(
    page.getByRole('heading', { name: 'Phê duyệt yêu cầu cấp 1' }),
  ).toBeVisible();

  await page.getByRole('button', { name: /^Đã xử lý/ }).click();
  const processedTrip = page.locator('.ui-card').filter({ hasText: tripCode! });
  await expect(processedTrip).toBeVisible();
  await expect(processedTrip.getByText('Đã duyệt', { exact: true })).toBeVisible();
});
