const { ObjectID } = require('mongodb'); // Edit
const mongoCollections = require('../config/mongoCollections');
const books = mongoCollections.books;
const auths = mongoCollections.authors;

module.exports = {
    async create(title, isbn, authors){ // add in ratings and average rating
        if(!title || typeof(title) !== 'string' || title.trim() === ""){
            throw "ERROR: Invalid title input"
        }
        if(!isbn || typeof(isbn) !== 'string' || isbn.trim() === "" || isbn.length != 13){
            throw "ERROR: Invalid isbn input"
        }
        let nums = ['1','2','3','4','5','6','7','8','9','0']
        for(let i = 0; i < isbn.length; i++){
            if (!nums.includes(isbn[i])){
                throw "ERROR: Invalid isbn input"
            }
        }
        const bookCollection = await books();
        const authorCollection = await auths();
        if(!authors || !Array.isArray(authors)){
            throw "ERROR: Invalid author input"
        }
        const authorList = await authorCollection.find({}).toArray();
        //for(let i = 0; i < authors.length; i++){
        //    let inList = false;
        //    if (!ObjectID.isValid(authors[i])){
        //        throw "ERROR: Not all authors are valid IDs"
        //    }
        //    for (let j = 0; j < authorList.length; i++){
        //        if(authorList[j]._id === authors[i]){
        //            inList = true;
        //        }
        //    }
        //    if(!inList){
        //        throw "ERROR: Not all authors are valid IDs"
        //    }
        //}
        title = title.trim();
        isbn = isbn.trim();
        let newbook = {
          title: title,
          isbn: isbn,
          authors: authors
        };
        const insertInfo = await bookCollection.insertOne(newbook);
        if (insertInfo.insertedCount === 0) throw 'Could not add book';
        const newId = insertInfo.insertedId;
        let book1 = await this.get(newId.toString());
        return book1;
      },

      async getAll() {
        const bookCollection = await books();
        const bookList = await bookCollection.find({}).toArray();
        let ans = [];
        for (let i = 0; i < bookList.length; i++){
          bookList[i]._id = bookList[i]._id.toString();
          ans.push({"_id": bookList[i]._id, "title": bookList[i].title})
        }
        return ans;
      },

      async get(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'string') throw 'ERROR: id is not a string';
        if (id === '') throw 'ERROR: id is not a valid string';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id'
        const bookCollection = await books();
        const book1 = await bookCollection.findOne({ _id: ObjectID(id) });
        if (book1 === null) throw 'ERROR: No book with that id';
        book1._id = book1._id.toString();
        return book1;
      },

      async remove(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'string') throw 'ERROR: id is not a string';
        if (id === "") throw "ERROR: Invalid object id"
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        const bookCollection = await books();
        const deletionInfo = await bookCollection.removeOne({ _id: ObjectID(id) });
        //if (deletionInfo.deletedCount === 0) {
        //  throw `Could not delete book with id of ${id}`;
        //}
        return {bookId: id, deleted: true};
      },

      async update(id, book) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!book) throw 'ERROR: You must provide an book to update';
        if (typeof(id) !== 'string' || id === "") throw 'ERROR: Invalid ID input';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        if(typeof(book) != 'object') throw 'ERROR: Invalid book';
        if(book.name === 'undefined'){
            throw "ERROR: Book does not have any updatable components";
        }
        let updatedBook = {};
        if(book.name){
          if(typeof(book.name) !== 'string' || book.name.trim() === ""){
            throw "ERROR: Invalid input for title"
          }
          book.name = book.name.trim();
          updatedBook.name = book.name;
        }
  
        const bookCollection = await books();
        const updatedInfo = await bookCollection.updateOne(
          {_id: ObjectID(id)},
          { $set: updatedBook }
        );
        //if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
        // throw 'Update failed';
  
        return await this.get(id);
      },
};