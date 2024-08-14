# Acceptance Tests
This folder contains the acceptance test project for the Adult Cattle Housing Grant web app. 

The framework used is WebdriverIO with Cucumber and the tests are containerised by default, running against a single browser (Chrome)
.
## Requirements
- Docker
- Node
- npm

## Running tests inside a container (default)
Docker is used to create containers for both the tests themselves (`wdio-cucumber`) and the Selenium instance of Chrome (`chrome-browser`).

1. Provide the following environment variables in a `.env` file in this directory:

```
TEST_ENVIRONMENT_ROOT_URL
SHAREPOINT_TENANT_ID
SHAREPOINT_CLIENT_ID
SHAREPOINT_CLIENT_SECRET
SHAREPOINT_HOSTNAME
SHAREPOINT_SITE_PATH
SHAREPOINT_DOCUMENT_LIBRARY
SHAREPOINT_UPLOAD_FOLDER
SHAREPOINT_WORKSHEET
```

2. For ARM architectures, change the image used for Chrome in `docker-compose.yaml`:

```
  selenium:
    image: selenium/standalone-chrome

CHANGES TO..

  selenium:
    image: seleniarm/standalone-chromium
```   

3. If running against `localhost` ensure the application container is running with `docker-compose up --build` from the root folder of this repository.

4. From the `/test/acceptance` directory run `docker-compose run --build --rm wdio-cucumber`. This will run all acceptance tests tagged `@RunInCI`.

5. HTML reports will be output to `./reports`.

## Running tests outside a container
To run the tests outside a container:

1. Comment out `hostname` and `port` in `wdio.conf.js`, i.e.:
```js
exports.config = {
    //hostname: 'selenium',
    //port: 4444,```
```
2. Run `npm run test`, this will execute the following script defined in `package.json`:
```pwsh
npx wdio run ./wdio.conf.js --cucumberOpts.tags=@RunInCI
```

## Running tests in parallel
Tests can be run in parallel at feature file level by increasing the number of instances available to WebdriverIO in `wdio.conf.js', e.g.:
```js
maxInstances: 3,
```

## Running tests against multiple browsers
Tests can be run against multiple browsers, currently only when running outside a container, by specifying additional capabilities together with more instances in `wdio.conf.js`:
```js
maxInstances: 10,
capabilities: [
    { acceptInsecureCerts: true, browserName: 'chrome' },
    { acceptInsecureCerts: true, browserName: 'firefox' },
    { acceptInsecureCerts: true, browserName: 'edge' }
],
```