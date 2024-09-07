const router = require("express").Router();
const Client = require('ssh2-sftp-client');
const {generateAddUserCSV} = require("../utils/generateAddUserCsv");
const {generateAddAccountCSV} = require("../utils/generateAddAccountCsv");

class SFTPClient {
  constructor() {
    this.client = new Client();
  }

  async connect(options) {
    console.log(`Connecting to ${options.host}:${options.port}`);
    try {
      console.log('Connecting...');
      await this.client.connect(options);
      console.log('Connected Successfully');
    } catch (err) {
      console.log('Failed to connect:', err);
    }
  }

  async disconnect() {
    console.log('Disconnecting...');
    await this.client.end();
    console.log('Disconnected Successfully.');
  }

  async listFiles(remoteDir, fileGlob) {
    console.log(`Listing ${remoteDir} ...`);
    let fileObjects;
    try {
      fileObjects = await this.client.list(remoteDir, fileGlob);
    } catch (err) {
      console.log('Listing failed:', err);
    }

    const fileNames = [];

    for (const file of fileObjects) {
      if (file.type === 'd') {
        console.log(`${new Date(file.modifyTime).toISOString()} PRE ${file.name}`);
      } else {
        console.log(`${new Date(file.modifyTime).toISOString()} ${file.size} ${file.name}`);
      }

      fileNames.push(file.name);
    }

    return fileNames;
  }

  async uploadFile(localFile, remoteFile) {
    console.log(`Uploading ${localFile} to ${remoteFile} ...`);
    try {
      await this.client.put(localFile, remoteFile);
    } catch (err) {
      console.error('Uploading failed:', err);
    }
  }

  async downloadFile(remoteFile, localFile) {
    console.log(`Downloading ${remoteFile} to ${localFile} ...`);
    try {
      await this.client.get(remoteFile, localFile);
    } catch (err) {
      console.error('Downloading failed:', err);
    }
  }

  async deleteFile(remoteFile) {
    console.log(`Deleting ${remoteFile}`);
    try {
      await this.client.delete(remoteFile);
    } catch (err) {
      console.error('Deleting failed:', err);
    }
  }
}

// Example usage
const userInfo = {
    role: 'Trader',
    username: 'DemoUser',
    firstName: 'John',
    lastName: 'Smith',
    password: 'password',
    email: 'donotreply@rithmic.com'
  };
  

// Route to create a Rithmic account
router.post('/handlerithmic', async (req, res) => {
  const host = process.env.RITHMIC_HOST;
  const port = process.env.RITHMIC_PORT;
  const username = process.env.RITHMIC_USERNAME;
  const password = process.env.RITHMIC_PASSWORD;
  
  const userInfo = req.body;
  console.log('User Info: ', userInfo);

  const {addUserPath, addUserFileName} = generateAddUserCSV(userInfo);
  const {addAccountPath, addAccountFileName} = generateAddAccountCSV(userInfo);

  //* Open the connection
  const client = new SFTPClient();
  await client.connect({ host, port, username, password });

  //* List working directory files
  await client.listFiles(".");

  //* Upload local file to remote file
  // await client.uploadFile(addUserPath, "./RithmicTest/add_user/Aurelza-0002_2024-09-03_16-26-49.csv");
  // await client.uploadFile(addAccountPath, "./RithmicTest/add_user/Aurelza-0002_2024-09-03_16-26-49.csv");


  await client.disconnect();

  res.status(200).json({ message: 'Rithmic account created successfully.' });
});

module.exports = router;




