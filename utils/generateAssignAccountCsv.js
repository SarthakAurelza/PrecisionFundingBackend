const fastcsv = require('fast-csv');
const path = require('path');
const fs = require('fs');

function generateAssignAccountCSV(userInfo) {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

  const data = [
    {
      assign_account_to_user: 'assign_account_to_user',
      ib_id: 'PrecisionFunding',
      user_id: `A-1`,
      account_id: `A-1`,
      access_type: 'Read Only',
    },
  ];

  const dirPath = './csv_files/assign_account';
  const fileName = `${data[0].user_id}_${timestamp}.csv`;
  const filePath = path.join(dirPath,fileName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const ws = fs.createWriteStream(filePath);

  fastcsv
    .write(data, { headers: false })
    .pipe(ws);

  return {filePath, fileName};
}

module.exports={
    generateAssignAccountCSV
}