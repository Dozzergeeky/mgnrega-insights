import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
	test("renders hero messaging", async ({ page }) => {
		await page.goto("/");

		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			/MGNREGA story in simple words/i
		);

		await expect(page.getByText("Trusted & cached data")).toBeVisible();
		await expect(page.getByRole("link", { name: /See system design/i })).toBeVisible();
	});

	test("loads district options and keeps continue disabled", async ({ page }) => {
		await page.goto("/");

		const districtSelect = page.getByLabel(/District/);
		await expect(districtSelect).toBeEnabled({ timeout: 15_000 });

		// Wait for the async fetch to complete by checking that the first real district loads.
		const firstDistrictOption = page.locator("#district option").nth(1);
		await expect(firstDistrictOption).toHaveText("Alipurduar");

		const continueButton = page.getByRole("button", { name: /Continue/i });
		await expect(continueButton).toBeDisabled();

		await districtSelect.selectOption({ label: "Alipurduar" });
		await expect(continueButton).toBeEnabled();
	});
});
