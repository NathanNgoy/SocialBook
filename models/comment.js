let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let CommentSchema = new Schema({
    content: {type: String, required: true},
    author: {type:Schema.Types.ObjectId, ref: "User"},
    likes: {type: Number, default: 0},
    date: {type: Date, default: Date.now() }
});

CommentSchema
.virtual('dateFormat')
.get(function() {
    return moment(this.date).format('Do of MMM \'YY, h:mm A');
});

module.exports = mongoose.model("Comment", CommentSchema);