const { Then } = require("@wdio/cucumber-framework");
const { browser } = require("@wdio/globals");
const _ = require("lodash");
const { scoreAnswer } = require("../dto/scoreAnswer");
const { worksheetField } = require("../dto/worksheet");
const scoreResultsPage = require("../pages/scoreResultsPage");
const guard = require("../services/guard");
const poller = require("../services/poller");
const sharePoint = require("../services/sharePoint");

let referenceNumber = null;

Then(/^(?:the user should|should) be at URL "([^"]*)?"$/, async (urlPath) => {
    const fullUrl = await browser.getUrl();
    expect(fullUrl.endsWith(urlPath));
});

Then(/^(?:the user should|should) see heading "([^"]*)?"$/, async (text) => {
    if (text.indexOf("'") > -1) {
        text = text.substring(0, text.indexOf("'"))
    }
    await expect($("//h1[contains(text(),\"" + text + "\")]")).toBeDisplayed();
});

Then(/^(?:the user should|should) see heading label "([^"]*)?"$/, async (text) => {
    await expect($("//h1/label[contains(text(),'" + text + "')]")).toBeDisplayed();
});

Then(/^(?:the user should|should) see "([^"]*)?" for their project score$/, async (expectedScore) => {
    const actualScore = await new scoreResultsPage().getScore();
    await expect(actualScore).toEqual(expectedScore);
});

Then(/^(?:the user should|should) see a reference number for their application$/, async () => {
    const selector = $("//h1/following-sibling::div[1]/strong");
    await expect(selector).toHaveText(expect.stringContaining("-"));
    referenceNumber = await selector.getText();
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
            expectedAnswer = new scoreAnswer(
                section,
                [],
                score,
                fundingPriorities
            );
            expectedAnswers.push(expectedAnswer);
        }

        if (answer) {
            expectedAnswer.answers.push(answer);
        }
    }

    const actualAnswers = await new scoreResultsPage().getAnswers();

    await expect(actualAnswers).toEqual(expectedAnswers);
});

Then(/^a spreadsheet should be generated with the following values$/, async (expectedDataTable) => {
    guard.isNotNull(referenceNumber, "referenceNumber should have been set by a prior step");

    const isSpreadsheetPresent = await poller.pollForSuccess(async() => sharePoint.isSpreadsheetPresentFor(referenceNumber));
    await expect(isSpreadsheetPresent).toBe(true);

    const expectedFields = expectedDataTable.hashes()
        .map(row => new worksheetField(row["FIELD NAME"], row["FIELD VALUE"]));

    const actualFields = (await sharePoint.getWorksheetFor(referenceNumber)).fields;

    for (const expectedField of expectedFields) {
        const matchingActualField = actualFields.find(actualField => _.isEqual(actualField, expectedField));
        await expect(matchingActualField).toEqual(expectedField);
    }
});
