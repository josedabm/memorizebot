const express = require('express')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const axios = require('axios')
const mongoose = require('mongoose')
const Reminder = require('./Models/Reminder')
const moment = require('moment')
const config = require('./config')


const app = express()

// Express middlewares
app.use(helmet())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
) // for parsing application/x-www-form-urlencoded

// Database connection
mongoose.connect(config.dbConnectUrl)
var db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => {
  sendReminders()
  setInterval(sendReminders, config.timeInterval)
})

//This is the route the API will call
app.post('/new-message', (req, res) => {
  const {
    message
  } = req.body
  const now = new Date()

  let databaseInputs = config.remindersTimeout.map(days => {
    return {
      datetime: moment(now).add(days, 'days'),
      chatId: message.chat.id,
      replyToMessageId: message.message_id
    }
  })

  Reminder.create(databaseInputs).then(() => {
    axios.post(config.apiBotEndpoint, {
        chat_id: message.chat.id,
        text: 'Te lo recordare mañana, en una semana y un mes. Gracias por confiar en mi!'
      })
      .then(response => {
        // We get here if the message was successfully posted
        console.log('mensaje enviado')
        res.end('ok')
      })
      .catch(err => {
        console.error('Error :', err)
        res.end('Error :' + err)
      })
  })
})

// Finally, start our server
app.listen(3000, () => {
  console.log('Telegram app listening on port 3000!')
})

function sendReminders() {
  let now = new Date()

  Reminder.find({
    datetime: {
      $lt: now
    }
  }).exec((error, reminders) => {
    if (error) return console.error(error)

    var counter = 0
    var sendedReminderIds = []

    console.log('REMINDERS LENGTH', reminders.length)
    console.log('REMINDERS', reminders)

    reminders.forEach(reminder => {
      axios.post(config.apiBotEndpoint, {
        chat_id: reminder.chatId,
        reply_to_message_id: reminder.replyToMessageId,
        text: 'Te recuerdo que hoy tienes que ojear esto ;)'
      }).then(response => {
        sendedReminderIds.push(reminder._id)
        counter++
        deleteReminders(counter, sendedReminderIds, reminders)
      }, (error) => {
        console.error('ERROR AL ENVIAR EL RECORDATORIO', error)
        counter++
        deleteReminders(counter, sendedReminderIds, reminders)
      })
    })
  })
}

function deleteReminders(counter, sendedReminderIds, reminders) {
  console.log('COUNTER', counter)

  if (reminders.length === counter) {
    Reminder.remove({
      _id: {
        $in: sendedReminderIds
      }
    }, (error) => {
      if (error) return console.error('ERROR AL ELIMINAR LOS RECORDATORIOS PASADOS', error)
      console.log('RECORDATORIOS ELIMINADOS CORRECTAMENTE')
    })
  }
}