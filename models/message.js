let mongoose = require("mongoose");
var moment = require('moment');
let Schema = mongoose.Schema;

let messageSchema = new Schema({
    content: {type: String, required: true},
    author: {type: String, required: true},
    //author: {type:Schema.Types.ObjectId, ref: "User"},
    date: {type: Date, default: Date.now() }
});

messageSchema
.virtual('dateFormat')
.get(function() {
    return moment(this.date).format('h:mm A');
});

module.exports = mongoose.model("Message", messageSchema);
