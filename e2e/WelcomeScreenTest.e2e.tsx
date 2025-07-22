describe('Welcome Screen', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should show the welcome title and button', async () => {
    await expect(element(by.text('Welcome to RecoMate'))).toBeVisible()
    await expect(element(by.id('getStartedButton'))).toBeVisible()
  })

  it('should navigate to register screen after tapping the button', async () => {
    await element(by.id('getStartedButton')).tap()

    await expect(element(by.text('Register'))).toBeVisible()
  })
})
