const { worksheet, worksheetField } = require("../dto/worksheet");
const { AdalFetchClient } = require("@pnp/nodejs-commonjs");
const wreck = require("@hapi/wreck");

const config = {
    tenantId: process.env.SHAREPOINT_TENANT_ID,
    clientId: process.env.SHAREPOINT_CLIENT_ID,
    clientSecret: process.env.SHAREPOINT_CLIENT_SECRET,
    hostname: process.env.SHAREPOINT_HOSTNAME,
    sitePath: process.env.SHAREPOINT_SITE_PATH,
    documentLibrary: process.env.SHAREPOINT_DOCUMENT_LIBRARY,
    uploadFolder: process.env.SHAREPOINT_UPLOAD_FOLDER,
    worksheet: process.env.SHAREPOINT_WORKSHEET
  };

async function isSpreadsheetPresentFor(partialFileName) {
  const accessToken = await getAccessToken();
  const siteId = await getSiteId(accessToken);
  const driveId = await getDriveId(accessToken, siteId, config.documentLibrary);

  try {
    await getFileIdFor(accessToken, driveId, config.uploadFolder, partialFileName);
  } catch (error) {
    return false;
  }

  return true;
}

async function getWorksheetFor(partialFileName) {
    const accessToken = await getAccessToken();
    const siteId = await getSiteId(accessToken);
    const driveId = await getDriveId(accessToken, siteId, config.documentLibrary);
    const fileId = await getFileIdFor(accessToken, driveId, config.uploadFolder, partialFileName);    
    return getWorksheet(accessToken, driveId, fileId, config.worksheet);
}

async function getAccessToken() {
  const tokenClient = new AdalFetchClient(config.tenantId, config.clientId, config.clientSecret);
  return (await tokenClient.acquireToken()).accessToken;
}

async function getSiteId(accessToken) {
  const response = await wreck.get(
    `https://graph.microsoft.com/v1.0/sites/${config.hostname}:/${config.sitePath}?$select=id`,
    { headers: { Authorization: `Bearer ${accessToken}` }, json: true }
  );  
  return response.payload.id;
}

async function getDriveId(accessToken, siteId, driveName) {
  const response = await wreck.get(
    `https://graph.microsoft.com/v1.0/sites/${siteId}/drives?$select=id,name`,
    { headers: { Authorization: `Bearer ${accessToken}` }, json: true }
  );
  return response.payload.value
    .find(drive => drive.name === driveName)
    .id
}

async function getFileIdFor(accessToken, driveId, uploadFolder, partialFileName) {
  const response = await wreck.get(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/root:/${encodeURIComponent(uploadFolder)}:/children?$select=id,name`,
    { headers: { Authorization: `Bearer ${accessToken}` }, json: true }
  );

  const file = response.payload.value.find(file => file.name.includes(partialFileName));
  if (file === undefined) {
    throw new Error(`File matching ${partialFileName} not found`);
  }

  return file.id;
}

async function getWorksheet(accessToken, driveId, fileId, worksheetName) {
  const response = await wreck.get(
    `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/workbook/worksheets/${encodeURIComponent(worksheetName)}/usedRange?$select=values`,
    { headers: { Authorization: `Bearer ${accessToken}` }, json: true }
  );
  
  const fields = response.payload.values
    .filter(row => row[0] !== "" || row[1] !== "" || row[2] !== "")
    .map(row => new worksheetField(row[1], row[2]));

  return new worksheet(worksheetName, fields);
}

module.exports = { isSpreadsheetPresentFor, getWorksheetFor }
