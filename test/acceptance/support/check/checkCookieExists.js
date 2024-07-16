/**
 * Check if a cookie with the given name exists
 * @param  {[type]}   name      The name of the cookie
 * @param  {[type]}   falseCase Whether or not to check if the cookie exists or
 *                              not
 */
export default async (name, falseCase) => {
  /**
     * The cookie as retrieved from the browser
     * @type {Object}
     */
  const cookie = await browser.getCookies(name)

  if (falseCase) {
    await expect(cookie.length).to.equal(
      0,
      `Expected cookie "${name}" not to exists but it does`
    )
  } else {
    await expect(cookie.length).to.not.equal(
      0,
      `Expected cookie "${name}" to exists but it does not`
    )
  }
};
