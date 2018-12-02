const mongoose = require('mongoose')

var ReminderSchema = mongoose.Schema({
  datetime: Date,
  chatId: Number,
  replyToMessageId: Number
})

var Reminder = mongoose.model('Reminder', ReminderSchema)

module.exports = Reminder