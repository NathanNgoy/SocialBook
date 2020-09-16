let mongoose = require("mongoose");
var moment = require('moment');
let Schema = mongoose.Schema;

let PostSchema = new Schema({
    content: {type: String, required: true},
    author: {type:Schema.Types.ObjectId, ref: "User"},
    comment: {type:Schema.Types.ObjectId, ref: "Comment"},
    likes: {type: Number, default: 0},
    image: {type: String, required: false},
    date: {type: Date, default: Date.now() }
});

PostSchema
.virtual('dateFormat')
.get(function() {
    return moment(this.date).format('Do of MMM \'YY, h:mm A');
});

PostSchema
.virtual("url")
.get(function() {
    return '/posts/' + this._id;
})

module.exports = mongoose.model("Post", PostSchema);
