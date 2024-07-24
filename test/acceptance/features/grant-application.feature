Feature: Apply for an Adult Cattle Housing grant
    Covers scenarios around applying for an Adult Cattle Housing grant.

    Scenario: User applies for an Adult Cattle Housing grant
        Given I navigate to "/adult-cattle-housing/start"
        Then I should see link "//a[contains(@href,'/adult-cattle-housing/start')]"
