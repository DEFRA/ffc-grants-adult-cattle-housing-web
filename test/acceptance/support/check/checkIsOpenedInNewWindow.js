/**
 * Check if the given URL was opened in a new window
 * @param  {String}   expectedUrl The URL to check for
 * @param  {String}   obsolete    Indicator for the type (window or tab) unused
 */

export default async (expectedUrl, obsolete) => {
  /**
     * All the current window handles
     * @type {Object}
     */
  const windowHandles = await browser.getWindowHandles()

  await expect(windowHandles).length.to.not.equal(1, 'A popup was not opened')

  /**
     * The last opened window handle
     * @type {Object}
     */
  const lastWindowHandle = windowHandles.slice(-1)

  // Make sure we focus on the last opened window handle
  await browser.switchToWindow(lastWindowHandle[0])

  /**
     * Get the URL of the current browser window
     * @type {String}
     */
  const windowUrl = await browser.getUrl()

  await expect(windowUrl).to
    .contain(expectedUrl, 'The popup has a incorrect getUrl')

  await browser.closeWindow()
};
