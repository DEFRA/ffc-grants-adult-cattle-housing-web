const { $$ } = require('@wdio/globals')

class scoreResultsPage {
    async getScores () {
        const scoringRowElements = await this.#getScoringRowElements();
        return await Promise.all(await scoringRowElements.map(async e => {
            return {
                section: await this.#getSectionName(e),
                answers: await this.#getAnswers(e),
                score: await this.#getScore(e),
                fundingPriorities: await this.#getFundingPriorities(e)
            };
        }));
    }

    async changeAnswersFor(section) {
        const scoringRowElements = await this.#getScoringRowElements();
        const chosenScoringRowElement = (await scoringRowElements.filter(async e => await this.#getSectionName(e) === section))[0];
        await chosenScoringRowElement.$$("td")[2].$("a").click();
    }

    async #getScoringRowElements () {
        return $$("//h2[text()='Your answers']/following-sibling::table/tbody/tr");
    }

    async #getSectionName(parentElement) {
        const text = await parentElement.$("th").getText();
        return text.substring(0, text.indexOf("\n")).trim();
    }

    async #getAnswers(parentElement) {
        const liElements = await parentElement.$("th").$("ul").$$("li");
        return await Promise.all(await liElements.map(async li => {
            const text = await li.getText();
            return text.trim();
        }));
    }

    async #getScore(parentElement) {
        const text = await parentElement.$$("td")[0].getText();
        return text.trim();
    }

    async #getFundingPriorities(parentElement) {
        const text = await parentElement.$$("td")[1].getText();
        return text.trim();
    }
}

module.exports = scoreResultsPage;
