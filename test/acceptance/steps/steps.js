const { Given, When, Then } = require('@wdio/cucumber-framework');
const { browser } = require('@wdio/globals')

Given(/^the user navigates to "([^"]*)?"$/, async (page) => {
    await browser.url(page);
});

When(/^(?:the user clicks|clicks) on "([^"]*)?"$/, async (text) => {
    await $("//*[contains(text(),'" + text + "')]").click();
});

When(/^(?:the user continues|continues)$/, async () => {
    await $("//button[@id='Continue' or @id='btnContinue']").click();
});

When(/^(?:the user confirms|confirms) and sends$/, async () => {
    await $("//button[@id='btnConfirmSend']").click();
});

When(/^the user selects option "([^"]*)?"$/, async (text) => {
    await $("//input[@type='radio' and contains(@value,'" + text + "')]").click();
});

When(/^the user chooses the following$/, async (dataTable) => {
    for (const row of dataTable.raw()) {
        await $("//input[@type='checkbox' and contains(@value,'" + row[0] + "')]").click();
    };
});

When(/^(?:the user enters|enters) "([^"]*)?" in "([^"]*)?"$/, async (text, id) => {
    await $("//input[@id='" + id + "']").setValue(text);
});

When(/^the user enters the following$/, async (dataTable) => {
    for (const row of dataTable.hashes()) {
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
    await expect($("//a[contains(text(),'" + text + "')]")).toBeDisplayed();
});

Then(/^the user should see heading "([^"]*)?"$/, async (text) => {
    if (text.indexOf("'") > -1) {
        text = text.substring(0, text.indexOf("'"))
    }
    await expect($("//h1[contains(text(),\"" + text + "\")]")).toBeDisplayed();
});

Then(/^the user should see heading label "([^"]*)?"$/, async (text) => {
    await expect($("//h1/label[contains(text(),'" + text + "')]")).toBeDisplayed();
});

Then(/^(?:the user should|should) see "([^"]*)?" for their project's score$/, async (scoreStrength) => {
    await expect($("//h1[text()='Score results']/following-sibling::div[1]/span")).toHaveText(scoreStrength);
});

Then(/^(?:the user should|should) see a reference number for their application$/, async () => {
    await expect($("//h1/following-sibling::div[1]/strong")).toHaveText(expect.stringContaining("-"));
});
