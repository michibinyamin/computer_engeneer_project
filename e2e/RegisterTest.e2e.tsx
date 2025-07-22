describe('Register Screen', () => {
  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should show all input fields', async () => {
    await expect(element(by.id('usernameInput'))).toBeVisible()
    await expect(element(by.id('emailInput'))).toBeVisible()
    await expect(element(by.id('passwordInput'))).toBeVisible()
    await expect(element(by.id('confirmPasswordInput'))).toBeVisible()
  })

  it('should show error if form is incomplete', async () => {
    await element(by.id('createAccountButton')).tap()
    await expect(element(by.text('Please fill in all fields.'))).toBeVisible()
  })
})
