const { Given, Then } = require('@wdio/cucumber-framework');
const { browser } = require('@wdio/globals')

Given(/^I navigate to "([^"]*)?"$/, async (page) => {
    await browser.url(page);
});

Then(/^I should see link "([^"]*)?"$/, async (selector) => {
    const element = await $(selector);
    await expect(element).toBeDisplayed();
});
