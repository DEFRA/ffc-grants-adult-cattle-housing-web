Feature: Applying for an Adult Cattle Housing Grant
    Illustrates scenarios around applying for a Farming Transformation Fund Adult Cattle Housing Grant.

    Scenario: User applies for an Adult Cattle Housing Grant
        # start
        Given the user navigates to "/adult-cattle-housing/start"
        Then the user should see heading "Check if you can apply for an Adult Cattle Housing Grant"
        When the user clicks on "Start now"

        # legal-status
        Then the user should see heading "What is the legal status of the business?"
        When the user selects option "Limited company"
        And the user continues

        # items-needed
        Then the user should see heading "What eligible items does your project need?"
        When the user chooses the following
        | Constructing or improving buildings for housing |
        | Processing equipment or machinery               |
        And the user continues

        # project-cost
        Then the user should see heading label "What is the estimated cost of the items?"
        When the user enters "100000" in "projectCost"
        And the user continues

        # impact
        Then the user should see heading "What impact will this project have?"
        When the user chooses the following
        | Allow selling direct to consumer                 |
        | Creating added-value products for the first time |
        And the user continues

        # score
        Then the user should see heading "Score results"