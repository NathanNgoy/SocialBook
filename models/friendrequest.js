let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let FriendRequestSchema = new Schema({
    from: {type: Schema.Types.ObjectId, ref: "User"},
    to: {type: Schema.Types.ObjectId, ref: "User"},
    status: {type: String, required: false, default: "Pending"},
    date: {type: Date, default: Date.now() }
});

FriendRequestSchema
.virtual('dateFormat')
.get(function() {
    return moment(this.date).format('Do of MMM \'YY, h:mm A');
});

module.exports = mongoose.model("FriendRequest", FriendRequestSchema);