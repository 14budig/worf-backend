'use strict';

let mongoose = require('mongoose');
var Schema = mongoose.Schema;

var modelSchema = new Schema({
    location: String,
    text: String,
    username: String,
    created: Date,
    replies: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
});

module.exports = mongoose.model('Message', modelSchema);