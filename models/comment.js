const mongoose = require('mongoose');
const book = require('./book');
const commentSchema = new mongoose.Schema({
    bookID : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'book',
        required:true
    },
    text: {
        type: String, 
        required: true
    }
});

module.exports = mongoose.model('comment',commentSchema);