/**
 * Set the text of the current prompt
 * @param  {String}   modalText The text to set to the prompt
 */
export default async modalText => {
  try {
    await browser.sendAlertText(modalText)
  } catch (e) {
    await assert(e, 'A prompt was not open when it should have been open')
  }
};
