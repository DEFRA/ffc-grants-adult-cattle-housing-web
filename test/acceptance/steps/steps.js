const { Given, When, Then } = require('@wdio/cucumber-framework');
const { browser } = require('@wdio/globals')

Given(/^the user navigates to "([^"]*)?"$/, async (page) => {
    await browser.url(page);
});

When(/^(?:the user clicks|clicks) on "([^"]*)?"$/, async (text) => {
    const element = await $("//*[contains(text(),'" + text + "')]");
    await element.click();
});

When(/^(?:the user continues|continues)$/, async () => {
    const element = await $("//button[@id='Continue' or @id='btnContinue']");
    await element.click();
});

When(/^(?:the user confirms|confirms) and sends$/, async () => {
    const element = await $("//button[@id='btnConfirmSend']");
    await element.click();
});

When(/^the user selects option "([^"]*)?"$/, async (text) => {
    const element = await $("//input[@type='radio' and contains(@value,'" + text + "')]");
    await element.click();
});

When(/^the user chooses the following$/, async (dataTable) => {
    const rows = dataTable.raw();
    for (const row of rows) {
        const element = await $("//input[@type='checkbox' and contains(@value,'" + row[0] + "')]");
        await element.click();            
    };
});

When(/^(?:the user enters|enters) "([^"]*)?" in "([^"]*)?"$/, async (text, id) => {
    const element = await $("//input[@id='" + id + "']");
    await element.setValue(text);
});

When(/^the user enters the following$/, async (dataTable) => {
    const hashes = dataTable.hashes();
    for (const row of hashes) {
        const element = await $("//*[@id='" + row["ID"] + "']");
        const tag = await element.getTagName();
        if (tag == "select") {
            await element.selectByVisibleText(row["VALUE"]);
        } else {
            await element.setValue(row["VALUE"]);
        }
    };
});

Then(/^the user should see link "([^"]*)?"$/, async (text) => {
    const element = await $("//a[contains(text(),'" + text + "')]");
    await expect(element).toBeDisplayed();
});

Then(/^the user should see heading "([^"]*)?"$/, async (text) => {
    if (text.indexOf("'") > -1) {
        text = text.substring(0, text.indexOf("'"))
    }
    const element = await $("//h1[contains(text(),\"" + text + "\")]");
    await expect(element).toBeDisplayed();
});

Then(/^the user should see heading label "([^"]*)?"$/, async (text) => {
    const element = await $("//h1/label[contains(text(),'" + text + "')]");
    await expect(element).toBeDisplayed();
});

Then(/^(?:the user should|should) see "([^"]*)?" for their project's score$/, async (scoreStrength) => {
    const element = await $("//h1[text()='Score results']/following-sibling::div[1]/span");
    await expect(element).toHaveText(scoreStrength);
});

Then(/^(?:the user should|should) see a reference number for their application$/, async () => {
    const element = await $("//h1/following-sibling::div[1]/strong");
    await expect(element).toHaveText(expect.stringContaining("-"));
});
