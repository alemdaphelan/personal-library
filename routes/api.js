/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const Books = require('../models/book.js');
const Comments = require('../models/comment.js');
const {checkValidText,addBook,addComment,findComments} = require('../helper/bookHelper.js');
module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      const books = await Books.find({}).lean();
      if(books.length === 0) return res.send('no book exists');
      
      const formatted = await Promise.all(
        books.map(async(book) =>{
          const comments = await findComments(book._id);
          return{
            ...book,
            comments,
            commentcount:comments.length
          };
        })
      );

      return res.json(formatted);
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      if(!title || !checkValidText(title)) return res.send('missing required field title');
      const book = await addBook(title);
      if(!book){
        return res.send('Could not create book');
      }
      return res.json(book);
    })
    
    .delete(async function(req, res){
      const books = await Books.find({});
      if(books.length === 0) return res.send('no book exists');
      await Books.deleteMany({});
      await Comments.deleteMany({});
      return res.send('complete delete successful');
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      const book = await Books.findById(bookid).lean();
      if(!book) return res.send('no book exists');
      const comments = await findComments(book._id);
      const formatted = {
        ...book,
        comments,
        commentcount:comments.length
      };
      return res.json(formatted);
    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;

      if(!comment || !checkValidText(comment)) return res.send('missing required field comment');
      const book = await Books.findById(bookid).lean();
      if(!book) return res.send('no book exists');
      const newComment = await addComment(book._id,comment);
      if(!newComment) return res.send('could not add comment');
      const comments = await findComments(book._id);
      const formatted = {
        ...book,
        comments,
        commentcount:comments.length
      };
      return res.json(formatted);
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;
      const book = await Books.findById(bookid);
      if(!book) return res.send('no book exists');
      await Books.deleteOne({_id:bookid});
      await Comments.deleteMany({bookID:book._id});
      return res.send('delete successful');
    });
  
};
