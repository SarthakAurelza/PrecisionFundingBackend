const fastcsv = require('fast-csv');
const path = require('path');
const fs = require('fs');

function generateRandomPassword() {
  let length = 13,
      charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$",
      retVal = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

function generateAddUserCSV(userInfo) {
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

  let user_count = '0001';
  let randomPassword = generateRandomPassword();
  console.log(randomPassword);

  const data = [
    {
      add_user: 'add_user',
      user_type: 'Trader',
      ib_id: 'PrecisionFunding',
      user_id: `PB_New-${user_count}`,
      first_name: userInfo.firstName,
      last_name: userInfo.lastName,
      password: randomPassword,
      email: userInfo.email,
      user_max_count: 1,
      login_expiration: '',
      life_span: '',
      trading_status: 'Enabled',
      nlx_user_id: '',
      cme_user_id: '',
      ice_user_id: '',
      dme_user_id: '',
      read_only: '',
      ullink_user_id: '',
      pulse_order_limit: '',
      cboe_user_id: '',
      cbsx_user_id: '',
      cfe_user_id: '',
      ic_user_id: '',
      risk_read_only: '',
      rithmic_user_type: '',
      ice_otc_user_id: '',
      nybot_user_id: '',
      wce_user_id: '',
      authorized_ice_user_id: '',
      authorized_ice_otc_user_id: '',
      authorized_nybot_user_id: '',
      authorized_wce_user_id: '',
      address_1: userInfo.address,
      address_2: '',
      city: userInfo.city,
      country: userInfo.country,
      state: userInfo.state,
      postal_code: userInfo.postalCode,
      home_phone: '',
      work_phone: '',
      mobile_phone: '',
      fax: '',
      billing_code: '',
      tdex_user_id: '',
      associated_user: '',
      eurex_user_id: '',
      prior_market_data_vendor_id: '',
      prior_market_data_subscriber_id: '',
      pre_trade_anonymity: '',
      password_self_service: '',
      demo_user: '',
      liffe_user_id: '',
      liffe_authorized_trader_id: '',
      ice_trader_mifidid: '',
      meff_client_id_short_code: '',
      meff_investment_decision_short_code: '',
      meff_execution_decision_short_code: '',
      meff_trading_capacity: '',
      matif_trading_capacity: '',
      matif_non_executing_broker_short_code: '',
      matif_investment_decision_short_code: '',
      matif_execution_decision_short_code: '',
      matif_client_id_short_code: '',
      aex_trading_capacity: '',
      aex_non_executing_broker_short_code: '',
      aex_investment_decision_short_code: '',
      aex_execution_decision_short_code: '',
      aex_client_id_short_code: '',
      eurex_client_id_short_code: '',
      eurex_investment_decision_short_code: '',
      eurex_execution_decision_short_code: '',
      disable_add_accounts: '',
      disable_add_user: '',
      disable_assign: '',
      disable_edit_markets: '',
      disable_edit_cash: '',
      disable_edit_risk: '',
      liquidating_only_cap: '',
      smfe_subscriber_token: '',
      smfe_user_id: '',
      max_session_count_for_orders: 2,
      max_session_count_for_market_data: 1,
      gain_user_id: '',
      go_live_time: '',
      nasdaq_user_id: '',
      fairx_user_id: '',
      crosstower_user_id: ''
    },
  ];

  const dirPath = './csv_files/add_user';
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
    generateAddUserCSV
}