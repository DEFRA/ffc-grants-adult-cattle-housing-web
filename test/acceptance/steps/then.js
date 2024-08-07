const { Then } = require("@wdio/cucumber-framework");
const { browser } = require("@wdio/globals");
const scoreResults = require("../pages/scoreResults");
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

Then(/^(?:the user should|should) see "([^"]*)?" for their project's score$/, async (scoreStrength) => {
    await expect($("//h1[text()='Score results']/following-sibling::div[1]/span")).toHaveText(scoreStrength);
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

Then(/^a spreadsheet should be generated with the following values$/, async (expectedData) => {
    guard.isNotNull(referenceNumber, "referenceNumber should have been set by a prior step");

    const isSpreadsheetPresent = await poller.pollForSuccess(async() => sharePoint.isSpreadsheetPresentFor(referenceNumber));
    await expect(isSpreadsheetPresent).toBe(true);

    const actualData = (await sharePoint.getWorksheetDataFor(referenceNumber))
        .filter(row => row[0] !== "" || row[1] !== "" || row[2] !== "")
        .map(row => [row[1], row[2]]);

    for (const expectedRow of expectedData.hashes()) {
        const matchingActualRow = actualData.find(actualRow => expectedRow["FIELD NAME"] === actualRow[0] && expectedRow["FIELD VALUE"] === actualRow[1]);
        await expect(matchingActualRow).toEqual([expectedRow["FIELD NAME"], expectedRow["FIELD VALUE"]]);
    }
});
