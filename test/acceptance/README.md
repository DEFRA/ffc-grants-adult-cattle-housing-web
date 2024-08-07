# Acceptance Tests

> Future Farming and Countryside Programme - Adult Cattle Housing Grant Acceptance Tests

This folder contains acceptance tests for the FFC Adult Cattle Housing Grant web application.

The framework is (Cucumber)[https://cucumber.io/] and (webdriver.io)[https://webdriver.io/] based and containerised.

## Requirements

- Docker Desktop
- Node
- NPM

# Quick start

Docker is used to create a container for the Selenium instance of Chrome (chrome-browser) and the tests themselves (wdio-cucumber).
* Chrome Browser is the browser specified in the configuration file `wdio.conf.js` by default.
* Webdriver.io along with Cucumber is the framework that defines the tests.

## How to run the tests

1. Set the root URL for the environment in the environment variable `TEST_ENVIRONMENT_ROOT_URL`

2. If running against localhost, then no need to set `TEST_ENVIRONMENT_ROOT_URL` as it will default to `docker.host.internal:3600`.  Instead make sure the application container is running with `docker-compose up --build` in the root folder of this repository.

3. From the directory containing the dockerfile run `docker-compose run --build --rm wdio-cucumber`. This will run an acceptance test against the FFC Adult Cattle Housing Grant web app.

4. The test reports will be output to `./html-reports`. Note that WSL users need to run `mkdir -m 777 html-reports`. Read more about report configuration in the [rpii/wdio-hmtl-reporter docs](https://github.com/rpii/wdio-html-reporter).

5. Now you are ready to maintain, extend or write your own features in the `./acceptance/features` directory.

# Using tags

If you want to run only specific tests you can mark your features with tags. These tags will be placed before each feature like so:

```gherkin
@Tag
Feature: ...
```

To run only the tests with specific tag(s) use the `--cucumberOpts.tagExpression=` parameter like so:

```sh
$ npx wdio wdio.conf.js --cucumberOpts.tags='@Tag or @AnotherTag'
```

For more tag options please see the [Cucumber.js documentation](https://docs.cucumber.io/tag-expressions/)

# Pending test

If you have failing or unimplemented tests you can mark them as "Pending" so they will get skipped.

```gherkin
// skip whole feature file
@Pending
Feature: ...

// only skip a single scenario
@Pending
Scenario: ...
```
