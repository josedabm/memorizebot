const {
  API_BOT_ENDPOINT,
  DB_CONNECT_URL,
} = process.env

const config = {
  // App config
  timeInterval: 3600000,
  apiBotEndpoint: API_BOT_ENDPOINT,

  // Days to send reminders
  remindersTimeout: [1, 7, 30],

  // Database
  dbConnectUrl: DB_CONNECT_URL
}

module.exports = config