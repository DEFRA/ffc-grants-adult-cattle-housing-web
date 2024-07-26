Feature: Applying for an Adult Cattle Housing Grant
    Illustrates scenarios around applying for a Farming Transformation Fund Adult Cattle Housing Grant.

    Scenario: User applies for an Adult Cattle Housing Grant
        # start
        Given the user navigates to "/adult-cattle-housing/start"
        And clicks on "Accept analytics cookies"
        Then the user should see heading "Check if you can apply for an Adult Cattle Housing Grant"
        When the user clicks on "Start now"

        # legal-status
        Then the user should see heading "What is the legal status of the business?"
        When the user selects option "Limited company"
        And continues

        # items-needed
        Then the user should see heading "What eligible items does your project need?"
        When the user chooses the following
        | Constructing or improving buildings for housing |
        | Processing equipment or machinery               |
        And continues

        # project-cost
        Then the user should see heading label "What is the estimated cost of the items?"
        When the user enters "100000" in "projectCost"
        And continues

        # impact
        Then the user should see heading "What impact will this project have?"
        When the user chooses the following
        | Allow selling direct to consumer                 |
        | Creating added-value products for the first time |
        And continues

        # score
        Then the user should see heading "Score results"
        And should see "Weak" for their project's score
        When the user continues

        # business-details
        Then the user should see heading "Business details"
        When the user enters the following
        | FIELD                              | VALUE                    | ID               |
        | Project name                       | Home Farm Cattle Project | projectName      |
        | Business name                      | Home Farm                | businessName     |
        | Number of employees                | 5                        | numberEmployees  |
        | Annual business turnover (£)       | 2000000                  | businessTurnover |
        | Single Business Identifier (SBI)   | 123456789                | sbi              |
        | County parish holding (CPH) number | 98/765/4321              | cph              |
        And continues

        # applying
        Then the user should see heading "Who is applying for this grant?"
        When the user selects option "Applicant"
        And continues
        
        # applicant-details
        Then the user should see heading "Applicant's details"
        When the user enters the following
        | FIELD                 | VALUE                          | ID                  |
        | First name            | Andrew                         | firstName           |
        | Last name             | Deacon                         | lastName            |
        | Email address         | andrew.deacon@equalexperts.com | emailAddress        |
        | Confirm email address | andrew.deacon@equalexperts.com | confirmEmailAddress |
        | Mobile phone number   | 07777 123456                   | mobileNumber        |
        | Landline number       | 01234 123456                   | landlineNumber      |
        | Address line 1        | Home Farm                      | address1            |
        | Address line 2        | Market Weston                  | address2            |
        | Town                  | Oakham                         | town                |
        | County                | Rutland                        | county              |
        | Postcode              | LE1 1LE                        | postcode            |
        | Project postcode      | LE1 2LE                        | projectPostcode     |
        And continues

        # check-details
        Then the user should see heading "Check your details"
        And continues

        # confirm
        Then the user should see heading "Confirm and send"
        And confirms and sends

        # confirmation
        Then the user should see heading "Details submitted"
        And should see a reference number for their application
