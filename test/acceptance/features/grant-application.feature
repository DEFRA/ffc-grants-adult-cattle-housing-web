    @RunInCI
    Feature: Applying for an Adult Cattle Housing Grant
    Illustrates scenarios applying for a Future Farming and Countryside Programme Adult Cattle Housing Grant.

    Scenario: User successfully applies for a grant
        # start
        Given the user navigates to "/adult-cattle-housing/start"
        And clicks on "Accept analytics cookies"
        Then the user should see heading "Check if you can apply for an Adult Cattle Housing Grant"
        When the user clicks on "Start now"

        # legal-status
        Then the user should be at URL "legal-status"
        And should see heading "What is the legal status of the business?"
        When the user selects "Limited company"
        And continues

        # items-needed
        Then the user should be at URL "items-needed"
        And should see heading "What eligible items does your project need?"
        When the user selects the following
        | Constructing or improving buildings for housing |
        | Processing equipment or machinery               |
        And continues

        # project-cost
        Then the user should be at URL "project-cost"
        And should see heading label "What is the estimated cost of the items?"
        When the user enters "100000" in "projectCost"
        And continues

        # impact
        Then the user should be at URL "impact"
        And should see heading "What impact will this project have?"
        When the user selects the following
        | Allow selling direct to consumer                 |
        | Creating added-value products for the first time |
        And continues

        # score
        Then the user should be at URL "score"
        And should see "Weak" for their project's score
        And should see the following scoring answers
        | SECTION | ANSWERS                                          | SCORE | FUNDING PRIORITIES                                          |
        | Impact  | Allow selling direct to consumer                 | Weak  | Improve processing and supply chains and grow your business |
        |         | Creating added-value products for the first time |       |                                                             |

        When the user continues

        # business-details
        Then the user should be at URL "business-details"
        And should see heading "Business details"
        When the user enters the following
        | FIELD                              | VALUE                    | ID               |
        | Project name                       | Home Farm Cattle Project | projectName      |
        | Business name                      | Home Farm Ltd            | businessName     |
        | Number of employees                | 5                        | numberEmployees  |
        | Annual business turnover (£)       | 2000000                  | businessTurnover |
        | Single Business Identifier (SBI)   | 123456789                | sbi              |
        | County parish holding (CPH) number | 98/765/4321              | cph              |
        And continues

        # applying
        Then the user should be at URL "applying"
        And should see heading "Who is applying for this grant?"
        When the user selects "Applicant"
        And continues
        
        # applicant-details
        Then the user should be at URL "applicant-details"
        And should see heading "Applicant's details"
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
        Then the user should be at URL "check-details"
        And should see heading "Check your details"
        And continues

        # confirm
        Then the user should be at URL "confirm"
        And should see heading "Confirm and send"
        And confirms and sends

        # confirmation
        Then the user should be at URL "confirmation"
        And should see heading "Details submitted"
        And should see a reference number for their application

        Then a spreadsheet should be generated with the following values
        | FIELD NAME                                         | FIELD VALUE                    |
        | FA or OA(EOI):	                                 | Outline Application            |
        | Surname                                            | Deacon                         |
        | Forename                                           | Andrew                         |
        | Business name                                      | Home Farm Ltd                  |
        | Address line 1                                     | Home Farm                      |
        | Address line 2                                     | Market Weston                  |
        | Address line 4 (town)                              | Oakham                         |
        | Address line 5 (county)                            | Rutland                        |
        | Postcode (use capitals)                            | LE1 1LE                        |
        | Landline number                                    | 01234 123456                   |
        | Mobile number                                      | 07777 123456                   |
        | Email                                              | andrew.deacon@equalexperts.com |
        | Business size                                      | Micro                          |
        | Employees	                                         | 5                              |
        | Business Form Classification (Status of Applicant) | Limited company                |

    Scenario: User is ineligible on legal status
        # start
        Given the user navigates to "/adult-cattle-housing/start"
        And clicks on "Accept analytics cookies"
        When the user clicks on "Start now"

        # legal-status
        Then the user should be at URL "legal-status"
        And should see heading "What is the legal status of the business?"

        When the user selects "None of the above"
        And continues
        Then the user should see heading "You cannot apply for a grant from this scheme"

        When the user goes back
        Then the user should see heading "What is the legal status of the business?"

    Scenario: User changes a weak score to a strong score    
        # start
        Given the user navigates to "/adult-cattle-housing/start"
        And clicks on "Accept analytics cookies"
        When the user clicks on "Start now"

        # legal-status
        When the user selects "Limited company"
        And continues

        # items-needed
        When the user selects the following
        | Constructing or improving buildings for housing |
        And continues

        # project-cost
        When the user enters "100000" in "projectCost"
        And continues

        # impact
        When the user selects the following
        | Creating added-value products for the first time |
        And continues

        # score
        Then the user should see "Weak" for their project's score
        And should see the following scoring answers
        | SECTION | ANSWERS                                          | SCORE | FUNDING PRIORITIES                                          |
        | Impact  | Creating added-value products for the first time | Weak  | Improve processing and supply chains and grow your business |
        When the user chooses to change their "Impact" answers
  
        # impact
        Then the user should be at URL "impact"
        When the user selects the following
        | Increasing range of added-value products         |
        | Increasing volume of added-value products        |
        | Allow selling direct to consumer                 |
        | Creating added-value products for the first time |
        And continues

        # score
        Then the user should be at URL "score"
        And should see "Strong" for their project's score
        And should see the following scoring answers
        | SECTION | ANSWERS                                          | SCORE  | FUNDING PRIORITIES                                          |
        | Impact  | Increasing range of added-value products         | Strong | Improve processing and supply chains and grow your business |
        |         | Increasing volume of added-value products        |        |                                                             |
        |         | Allow selling direct to consumer                 |        |                                                             |
        |         | Creating added-value products for the first time |        |                                                             |
