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
        const bookList = await bookCollection.find({}).toArray();
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
      }
};