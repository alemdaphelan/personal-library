const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const {checkValidText} = require('./bookHelper');

const Books = require('../models/book');
const Comments = require('../models/comment');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);
const expect = chai.expect;

const checkEqual = (obj,filter) =>{
    for(const key in filter) {
        let actual = filter[key];
        let expect = obj[key];

        if(actual?.toString() && expect?.toString() && actual?.toString() === expect?.toString()) continue;
        expect(actual).to.equal(expect);
    }
}

const checkValidBook = async(res,filter) =>{
    const requiredProperty = ['_id','title'];
    if(!filter.title || !checkValidText(filter.title)){
        return expect(res.text).to.equal('missing required field title');
    }
    expect(Object.keys(res.body)).to.include.members(requiredProperty);
    checkEqual(res.body,filter);
    
    const found = await Books.findById(res.body._id);
    expect(found).to.not.be.null;
    checkEqual(found.toObject(), filter);
}

const checkSingleBook = (book) =>{
    const requiredField = [
        'comments',
        '_id',
        'title',
        'commentcount'
    ]
    expect(Object.keys(book)).to.include.members(requiredField);
    expect(book.comments).to.be.an('array');
}

const checkValidId = async (res,id) =>{
    expect(res).to.have.status(200);
    if(!mongoose.Types.ObjectId.isValid(id)) return expect(res.text).to.equal('no book exists');
    const found = await Books.findById(id);
    if(!found){
        return expect(res.text).to.equal('no book exists');
    }
    checkSingleBook(res.body);
}

const checkGetResponse = (res) =>{
    expect(res).to.have.status(200);
    expect(res.body).to.be.an('array');
    if(res.body.length > 0){
        res.body.forEach(book=>{
            checkSingleBook(book);
        });
    }
}

const checkValidComment = async (res,filter) =>{
    expect(res).to.have.status(200);
    if(!filter.text || !checkValidText(filter.text)) return expect(res.text).to.equal('missing required field comment');
    const found = await Books.findById(filter.bookID);
    if(!found) return expect(res.text).to.equal('no book exists');
    const comment = await Comments.findOne({bookID:filter.bookID,text:filter.text});
    expect(comment).to.not.be.null;
    checkSingleBook(res.body);
    checkEqual(comment.toObject(),filter);
}

const checkToDelete = async (res,id) =>{
    expect(res).to.have.status(200);
    if(res.text === 'no book exists'){
        const found = await Books.findById(id);
        expect(found).to.be.null;
    }
    else{
        expect(res.text).to.equal('delete successful');
        const found = await Books.findById(id);
        expect(found).to.be.null;
    }
} 

module.exports = {checkGetResponse,checkValidBook,checkValidId,checkValidComment,checkToDelete};