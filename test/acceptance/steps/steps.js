const { Given, When, Then } = require('@wdio/cucumber-framework');
const { browser } = require('@wdio/globals')
const scoreResults = require('../pages/scoreResults');

Given(/^the user navigates to "([^"]*)?"$/, async (page) => {
    await browser.url(page);
});

When(/^(?:the user clicks|clicks) on "([^"]*)?"$/, async (text) => {
    await $("//*[contains(text(),'" + text + "')]").click();
});

When(/^(?:the user continues|continues)$/, async () => {
    await $("//button[@id='Continue' or @id='btnContinue']").click();
});

When(/^(?:the user goes|goes) back$/, async () => {
    await $("//*[@id='linkBack']").click();
});

When(/^(?:the user pauses|pauses)$/, async () => {
    await browser.pause(5000);
});

When(/^(?:the user confirms|confirms) and sends$/, async () => {
    await $("//button[@id='btnConfirmSend']").click();
});

When(/^the user selects "([^"]*)?"$/, async (text) => {
    const element = await $("//input[contains(@value,'" + text + "')]");
    if (!await element.isSelected()) {
        await element.click();
    }});

When(/^the user selects the following$/, async (dataTable) => {
    for (const row of dataTable.raw()) {
        const element = await $("//input[@type='checkbox' and contains(@value,'" + row[0] + "')]");
        if (!await element.isSelected()) {
            await element.click();
        }
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

When(/^(?:the user chooses|chooses) to change their "([^"]*)?" answers$/, async (section) => {
    await scoreResults.changeAnswersFor(section);
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

Then(/^(?:the user should|should) see the following scoring answers$/, async (dataTable) => {
    const expectedAnswers = [];
    let expectedAnswer = {};
    
    for (const row of dataTable.hashes()) {
        let section = row["SECTION"];
        let answer = row["ANSWERS"];
        let score = row["SCORE"];
        let fundingPriorities = row["FUNDING PRIORITIES"];

        if (section) {
            expectedAnswer = {
                section: section,
                answers: [],
                score: score,
                fundingPriorities: fundingPriorities
            };
            expectedAnswers.push(expectedAnswer);
        }

        if (answer) {
            expectedAnswer.answers.push(answer);
        }
    }

    const actualAnswers = await scoreResults.getScores();

    await expect(actualAnswers).toEqual(expectedAnswers);
});
