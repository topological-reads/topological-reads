const { ObjectID } = require('mongodb'); 
const mongoCollections = require('../config/mongoCollections');
const books = mongoCollections.books;
const users = mongoCollections.users;

module.exports = {
    async create(title, isbn, author, averageRating, ratings, description){ 
        if(!title || typeof(title) !== 'string' || title.trim() === ""){
          throw "ERROR: Invalid title input";
        }
        let books_list = await this.getAll();
        for(let i = 0; i < books_list.length; i++){
          if(books_list[i].isbn === isbn && !isbn && isbn !== 'N/A' && isbn !== ''){
            throw "ERROR: ISBN already in database"
          }
        }
        if(!isbn || typeof(isbn) !== 'string' || isbn.trim() === ""){
          throw "ERROR: Invalid isbn input";
        }

        if(!author || typeof(author) !== 'string' || author.trim() === ""){
          throw "ERROR: Invalid author input";
        }

        if(!averageRating || typeof(averageRating) !== 'number') {
          throw "ERROR: invalid average rating input";
        }

        if(!ratings || !Array.isArray(ratings)) {
          throw "ERROR: Invalid rating input";
        }

        const userCollection = await users();

        for(elem of ratings) {
            if(!Array.isArray(elem) || elem.length != 2 
              || !ObjectID.isValid(elem[0]) || typeof(elem[1]) !== "number") {
                throw `ERROR: Invalid rating element ${elem}`;
            }
            const user1 = await userCollection.findOne({ _id: elem[0]});
            if (user1 === null) {
              throw `ERROR: rating element ${elem} has a user ID that is not in the db`;
            }
        }

        if(!description || typeof(description) !== 'string' || description.trim() === ""){
          throw "ERROR: Invalid title input";
        }

        const bookCollection = await books();

        let newbook = {
          title: title.trim(),
          isbn: isbn.trim(),
          author: author.trim(),
          averageRating: averageRating,
          ratings: ratings,
          summary: description.trim()
        };
        const insertInfo = await bookCollection.insertOne(newbook);
        if (insertInfo.insertedCount === 0) throw 'Could not add book';
        const newId = insertInfo.insertedId;
        let book1 = await this.get(newId);
        return book1;
      },

      async getAll() {
        const bookCollection = await books();
        const bookList = await bookCollection.find({}, {sort: "title"}).toArray();
        if(bookList === []){
          throw "ERROR: There are no books in this database";
        }
        return bookList;
      },

      async get(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'object') throw 'ERROR: id is not an object';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id'
        const bookCollection = await books();
        const book1 = await bookCollection.findOne({ _id: id});
        if (book1 === null) throw 'ERROR: No book with that id';
        return book1;
      },

      async search(searchTerm) {
        if (!searchTerm) throw 'ERROR: You must provide a term to search for';
        if (typeof(searchTerm) !== 'string') throw 'ERROR: searchTerm is not a string';
        const bookCollection = await books();

        const bookSearch = {
            $or:[
              {title: new RegExp(searchTerm, "i")},
              {author:new RegExp(searchTerm, "i")},
              {isbn: searchTerm}
            ]
        }

        const booksList = await bookCollection.find(bookSearch, {sort: "title"}).toArray();
        return booksList;
      },

      async remove(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'object') throw 'ERROR: id is not a string';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        const bookCollection = await books();
        const deletionInfo = await bookCollection.removeOne({ _id: id});
        if (deletionInfo.deletedCount === 0) {
         throw `Could not delete book with id of ${id}`;
        }
        return {bookId: id, deleted: true};
      },

      async update(id, book) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!book) throw 'ERROR: You must provide an book to update';
        if (typeof(id) !== 'object' ) throw 'ERROR: Invalid ID input';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        if(typeof(book) != 'object') throw 'ERROR: Invalid user';
        if(book.title === 'undefined'){
            throw "ERROR: book does not have any updatable components";
        }
        let updatedBook = {};
        if(book.title){
          if(typeof(book.title) !== 'string' || book.title.trim() === ""){
            throw "ERROR: Invalid input for title"
          }
          book.title = book.title.trim();
          updatedBook.title = book.title;
        }
        if(book.isbn){
          if(typeof(book.isbn) !== 'string' || book.isbn.trim() === ""){
            throw "ERROR: Invalid input for isbn"
          }
          book.isbn = book.isbn.trim();
          updatedBook.isbn = book.isbn;
        }
        if(book.author){
          if(typeof(book.author) !== 'string' || book.author.trim() === ""){
            throw "ERROR: Invalid input for author"
          }
          book.author = book.author.trim();
          updatedBook.author = book.author;
        }
        if(book.averageRating){
          if(typeof(book.averageRating) !== 'number'){
            throw "ERROR: Invalid input for averageRating"
          }
          updatedBook.averageRating = book.averageRating;
        }
        if(book.ratings){
          if(!Array.isArray(ratings)){
            throw "ERROR: Invalid input for ratings"
          }
          for(elem of book.ratings) {
            const userCollection1 = await users();
            if(!Array.isArray(elem) || elem.length != 2 
              || !ObjectID.isValid(elem[0]) || typeof(elem[1]) !== "number") {
                throw `ERROR: Invalid rating element ${elem}`;
            }
            const user1 = await userCollection1.findOne({ _id: elem[0]});
            if (user1 === null) {
              throw `ERROR: rating element ${elem} has a user ID that is not in the db`;
            }
        }
        updatedBook.ratings = book.ratings;
        }
        if(book.description){
          if(typeof(book.description) !== 'string' || book.description.trim() === ""){
            throw "ERROR: Invalid input for author"
          }
          book.description = book.description.trim();
          updatedBook.description = book.description;
        }
  
        const bookCollection = await books();
        const updatedInfo = await bookCollection.updateOne(
          {_id: id},
          { $set: updatedBook }
        );
        if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount){
          throw 'Update failed';
        }
        return await this.get(id);
      },
};