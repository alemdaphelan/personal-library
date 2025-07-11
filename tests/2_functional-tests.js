/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const {checkGetResponse,checkValidBook,checkValidId,checkValidComment,checkToDelete} = require('../helper/testHelper');
const mongoose = require('mongoose');
chai.use(chaiHttp);
const expect = chai.expect;
suite('Functional Tests', function() {
  suite('Routing tests', function() {

    let testID;
    suite('POST /api/books with title => create book object/expect book object', function() {
      test('Test POST /api/books with title', function(done) {
        const testBook = {title: "Alem"};
        chai.request(server)
            .post('/api/books')
            .send(testBook)
            .end(async(err,res) =>{
              if(err) return done(err);
              assert.isNotNull(1);
              await checkValidBook(res,testBook);
              testID = res.body._id;
              done();
            });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        const testBook = {title:""};
        chai.request(server)
            .post('/api/books')
            .send(testBook)
            .end(async(err,res) => {
              if(err) done(err);
              assert.isNotNull(1);
              await checkValidBook(res,testBook);
              done();
            })
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
            .get('/api/books')
            .end((err,res) =>{
              if(err) done(err);
              assert.isNotNull(1);
              checkGetResponse(res);
              done();
            });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        const fakeID =new mongoose.Types.ObjectId();
        chai.request(server)
            .get('/api/books/' + fakeID)
            .end(async (err,res)=>{
              if(err) done(err);
              assert.isNotNull(1);
              await checkValidId(res,fakeID);
              done();
            });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
            .get(`/api/books/` + testID)
            .end((err,res) =>{
              if(err) done(err);
              assert.isNotNull(1);
              checkValidId(res,testID);
              done();
            })
      });
      
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
            .post('/api/books/' + testID)
            .send({comment:"haha"})
            .end(async (err,res) =>{
              if(err) done(err);
              assert.isNotNull(1);
              const filter = {bookID: testID, text: "haha"};
              await checkValidComment(res,filter);
              done();
            })
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
            .post('/api/books/' + testID)
            .send({comment:""})
            .end(async (err,res) =>{
              if(err) done(err);
              assert.isNotNull(1);
              const filter = {bookID:testID,text:""};
              await checkValidComment(res,filter);
              done();
            })
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        const fakeID = new mongoose.Types.ObjectId();
        chai.request(server)
            .post('/api/books' + fakeID)
            .send({comment:"alolo"})
            .end(async(err,res) =>{
              if(err) done(err);
              assert.isNotNull(1);
              const filter = {bookID: fakeID, text:"alolo"};
              checkValidComment(res,filter);
              done();
            })
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
            .delete('/api/books/' + testID)
            .end(async (err,res) =>{
              if(err) done(err);
              assert.isNotNull(1);
              await checkToDelete(res,testID);
              done();
            })
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        const fakeID = new mongoose.Types.ObjectId();
        chai.request(server)
            .delete('/api/books/' + fakeID)
            .end(async (err,res) =>{
              if(err) done(err);
              assert.isNotNull(1);
              await checkToDelete(res,fakeID);
              done();
            })
      });

    });

  });

});
