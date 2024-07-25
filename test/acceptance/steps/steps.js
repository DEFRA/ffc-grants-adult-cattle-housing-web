const { Given, When, Then } = require('@wdio/cucumber-framework');
const { browser } = require('@wdio/globals')

Given(/^the user navigates to "([^"]*)?"$/, async (page) => {
    await browser.url(page);
});

When(/^the user clicks on "([^"]*)?"$/, async (text) => {
    const element = await $("//*[contains(text(),'" + text + "')]");
    await element.click();
});

When(/^the user continues$/, async () => {
    const element = await $("//button[@id='Continue']");
    await element.click();
});

When(/^the user selects option "([^"]*)?"$/, async (text) => {
    const element = await $("//input[@type='radio' and contains(@value,'" + text + "')]");
    await element.click();
});

When(/^the user chooses the following$/, async (dataTable) => {
    dataTable.raw().forEach(async row => {
        const element = await $("//input[@type='checkbox' and contains(@value,'" + row[0] + "')]");
        await element.click();            
    });
});

When(/^the user enters "([^"]*)?" in "([^"]*)?"$/, async (text, id) => {
    const element = await $("//input[@id='" + id + "']");
    await element.click()
    await browser.keys(text)    
});

Then(/^the user should see link "([^"]*)?"$/, async (text) => {
    const element = await $("//a[contains(text(),'" + text + "')]");
    await expect(element).toBeDisplayed();
});

Then(/^the user should see heading "([^"]*)?"$/, async (text) => {
    const element = await $("//h1[contains(text(),'" + text + "')]");
    await expect(element).toBeDisplayed();
});

Then(/^the user should see heading label "([^"]*)?"$/, async (text) => {
    const element = await $("//h1/label[contains(text(),'" + text + "')]");
    await expect(element).toBeDisplayed();
});
