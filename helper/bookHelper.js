const Books = require('../models/book.js');
const Comments = require('../models/comment.js');

const checkValidText = (input) =>{
    return /^[a-zA-Z0-9\s\-\:\'\,\.\!\?]{1,100}$/.test(input.trim());
}

const addBook = async (title) =>{
    if(!checkValidText(title)) return null;
    const newBook = new Books({title});
    await newBook.save();
    return newBook;
}

const addComment = async (bookID,text) =>{
    const book = await Books.findById(bookID);
    if(!book) return null;
    const newComment = new Comments({bookID,text});
    await newComment.save();
    return newComment;
}

const findComments = async (id) =>{
    if(!id) return [];
    const comments = await Comments.find({bookID:id}).select('text').lean();
    return comments.map(x=>x.text);
}

module.exports = {
    checkValidText,
    addBook,
    addComment,
    findComments
};