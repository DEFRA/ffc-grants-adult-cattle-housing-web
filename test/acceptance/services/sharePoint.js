const { worksheet, worksheetField } = require("../dto/worksheet");
const { AdalFetchClient } = require("@pnp/nodejs-commonjs");
const wreck = require("@hapi/wreck");

class sharePoint {
  static #config = {
      tenantId: process.env.SHAREPOINT_TENANT_ID,
      clientId: process.env.SHAREPOINT_CLIENT_ID,
      clientSecret: process.env.SHAREPOINT_CLIENT_SECRET,
      hostname: process.env.SHAREPOINT_HOSTNAME,
      sitePath: process.env.SHAREPOINT_SITE_PATH,
      documentLibrary: process.env.SHAREPOINT_DOCUMENT_LIBRARY,
      uploadFolder: process.env.SHAREPOINT_UPLOAD_FOLDER,
      worksheet: process.env.SHAREPOINT_WORKSHEET
  };

  static async isSpreadsheetPresentFor(partialFileName) {
    const accessToken = await this.#getAccessToken(this.#config.tenantId, this.#config.clientId, this.#config.clientSecret);
    const siteId = await this.#getSiteId(accessToken, this.#config.hostname, this.#config.sitePath);
    const driveId = await this.#getDriveId(accessToken, siteId, this.#config.documentLibrary);

    try {
      await this.#getFileIdFor(accessToken, driveId, this.#config.uploadFolder, partialFileName);
    } catch (error) {
      return false;
    }

    return true;
  }

  static async getWorksheetFor(partialFileName) {
      const accessToken = await this.#getAccessToken(this.#config.tenantId, this.#config.clientId, this.#config.clientSecret);
      const siteId = await this.#getSiteId(accessToken, this.#config.hostname, this.#config.sitePath);
      const driveId = await this.#getDriveId(accessToken, siteId, this.#config.documentLibrary);
      const fileId = await this.#getFileIdFor(accessToken, driveId, this.#config.uploadFolder, partialFileName);    
      return this.#getWorksheet(accessToken, driveId, fileId, this.#config.worksheet);
  }

  static async #getAccessToken(tenantId, clientId, clientSecret) {
    const tokenClient = new AdalFetchClient(tenantId, clientId, clientSecret);
    return (await tokenClient.acquireToken()).accessToken;
  }

  static async #getSiteId(accessToken, hostname, sitePath) {
    const response = await wreck.get(
      `https://graph.microsoft.com/v1.0/sites/${hostname}:/${sitePath}?$select=id`,
      { headers: { Authorization: `Bearer ${accessToken}` }, json: true }
    );  
    return response.payload.id;
  }

  static async #getDriveId(accessToken, siteId, driveName) {
    const response = await wreck.get(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drives?$select=id,name`,
      { headers: { Authorization: `Bearer ${accessToken}` }, json: true }
    );
    return response.payload.value
      .find(drive => drive.name === driveName)
      .id
  }

  static async #getFileIdFor(accessToken, driveId, uploadFolder, partialFileName) {
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

  static async #getWorksheet(accessToken, driveId, fileId, worksheetName) {
    const response = await wreck.get(
      `https://graph.microsoft.com/v1.0/drives/${driveId}/items/${fileId}/workbook/worksheets/${encodeURIComponent(worksheetName)}/usedRange?$select=values`,
      { headers: { Authorization: `Bearer ${accessToken}` }, json: true }
    );
    
    const fields = response.payload.values
      .filter(row => row[0] !== "" || row[1] !== "" || row[2] !== "")
      .map(row => new worksheetField(row[1], row[2]));

    return new worksheet(worksheetName, fields);
  }
}

module.exports = sharePoint;
