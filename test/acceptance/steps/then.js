const { Then } = require('@wdio/cucumber-framework');
const { browser } = require('@wdio/globals')
const scoreResults = require('../pages/scoreResults');

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
