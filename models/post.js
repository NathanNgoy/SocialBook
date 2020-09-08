let mongoose = require("mongoose");
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

module.exports = mongoose.model("Post", PostSchema);
