let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let UserSchema = new Schema({
    firstName: { type: String, required: true, max: 20 },
    lastName: { type: String, required: true, max: 20},
    email: { type: String, required: true },
    password: { type: String, required: true},
    bio: { type: String },
    profile_picture: {type: String, rqeuired: false},
    friends: [{type: Schema.Types.ObjectId, ref: "User"}],
    friend_requests: [{type: Schema.Types.ObjectId, ref: "FriendRequest"}],
    posts: [{type: Schema.Types.ObjectId, ref: "Post"}]
});

UserSchema
.virtual('fullName')
.get(function() {
    return this.firstName + ' ' + this.lastName;
});

UserSchema
.virtual('url')
.get(function() {
    return '/users/' + this._id;
});

module.exports = mongoose.model('User', UserSchema);

