import { test, expect } from '@playwright/test';

test('auth flow', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // 1. Check Landing Page
    await expect(page.getByText("India's #1 Student Marketplace")).toBeVisible();

    // 2. Navigate to Auth
    await page.getByRole('button', { name: 'Start Hiring Now' }).click();
    await expect(page.getByText('Welcome Back')).toBeVisible();

    // 3. Toggle to Register
    await page.getByText('Create Account').click();
    await expect(page.getByText('Create Free Account')).toBeVisible();

    // 4. Fill Form (Mock)
    await page.getByPlaceholder('username').fill('testuser_' + Date.now());
    await page.getByPlaceholder('name@college.edu.in').fill(`test${Date.now()}@example.com`);
    await page.getByPlaceholder('••••••••').fill('password123');
    await page.getByPlaceholder('Select your college').fill('IIT Bombay');
    await page.getByText('IIT Bombay').click();

    // 5. Submit
    // Note: We can't fully test Firebase Auth in this simple script without mocking or real credentials.
    // But we can check if the button is clickable and loading state appears.
    const submitBtn = page.getByRole('button', { name: 'Create Free Account' });
    await submitBtn.click();

    // Expect loading state
    await expect(submitBtn).toBeDisabled();
});
