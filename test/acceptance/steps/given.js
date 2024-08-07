const { Given } = require("@wdio/cucumber-framework");
const { browser } = require("@wdio/globals");

Given(/^the user navigates to "([^"]*)?"$/, async (page) => {
    await browser.url(page);
});
