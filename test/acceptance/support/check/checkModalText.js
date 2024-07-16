/**
 * Check the text of a modal
 * @param  {String}   modalType     The type of modal that is expected
 *                                  (alertbox, confirmbox or prompt)
 * @param  {String}   falseState    Whether to check if the text matches or not
 * @param  {String}   expectedText  The text to check against
 */
export default async (modalType, falseState, expectedText) => {
  try {
    /**
         * The text of the current modal
         * @type {String}
         */
    const text = await browser.getAlertText()

    if (falseState) {
      await expect(text).to.not.equal(
        expectedText,
        `Expected the text of ${modalType} not to equal ` +
                `"${expectedText}"`
      )
    } else {
      await expect(text).to.equal(
        expectedText,
        `Expected the text of ${modalType} to equal ` +
                `"${expectedText}", instead found "${text}"`
      )
    }
  } catch (e) {
    await assert(
      e,
      `A ${modalType} was not opened when it should have been opened`
    )
  }
};
