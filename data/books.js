const { ObjectID } = require('mongodb'); // Edit
const mongoCollections = require('../config/mongoCollections');
const books = mongoCollections.books;

module.exports = {
    async create(title, author, genre, datePublished, summary){
        if(title === 'undefined' || datePublished === 'undefined'|| summary === 'undefined'){
          throw "ERROR: You either do not have a title, author, genre, date published, or summary"
        }
        if(typeof(title) !== 'string' || typeof(datePublished) != 'string' || typeof(summary) != 'string'){
          throw "ERROR: Invalid inputs for title, author, genre, date published, or summary"
        }
        if(title === "" || datePublished === "" || summary === ""){
          throw "ERROR: Invalid inputs for title, author, genre, date published, or summary"
        }
        if(!title.replace(/\s/g, '').length || !datePublished.replace(/\s/g, '').length || !summary.replace(/\s/g, '').length){
          throw "ERROR: Invalid inputs for title, author, genre, date published, or summary"
        }

        
        title = title.trim();
        datePublished = datePublished.trim();
        summary = summary.trim();
        
        let date = datePublished.split("/");
        if(date.length !== 3) throw "ERROR: Invalid date";
        if(Number.isNaN(Number(date[0])) || Number.isNaN(Number(date[1])) || Number.isNaN(Number(date[2]))) throw "ERROR: Invalid date";
        if(!Number.isInteger(Number(date[0])) || !Number.isInteger(Number(date[1])) || !Number.isInteger(Number(date[2]))) throw "ERROR: Invalid date";
        if(Number(date[0]) < 1 || Number(date[0]) > 12) throw "ERROR: Invalid date";
        if(Number(date[1]) < 1 || Number(date[1]) > 31) throw "ERROR: Invalid date";
        if(Number(date[2]) < 0 || Number(date[2]) > 2020) throw "ERROR: Invalid date";
        
        if(!Array.isArray(genre)){
          throw "ERROR: genre is not an array"
        }
        if(genre.length <= 0){
          throw "ERROR: genre is not a valid array"
        }
        let count = 0;
        let genre_arr = []
        for(let i = 0; i < genre.length; i++){
          if(typeof(genre[i]) === 'string' && genre[i] !== "" && genre[i].replace(/\s/g, '').length){
            count++;
            genre_arr.push(genre[i].trim())
          }
        }
        if(count === 0){
          throw "ERROR: Genre does not have any valid strings";
        }
        genre = genre_arr
        if(typeof(author) !== 'object'){
          throw "ERROR: Invalid input for author";
        }
        if(author.authorFirstName === 'undefined' || typeof(author.authorFirstName) !== 'string' || author.authorFirstName.trim() === ""){
          throw "ERROR: Invalid input for author.authorFirstName";
        }
        if(author.authorLastName === 'undefined' || typeof(author.authorLastName) !== 'string' || author.authorLastName.trim() === ""){
          throw "ERROR: Invalid input for author.authorLastName";
        }
        
        author.authorFirstName = author.authorFirstName.trim(); 
        author.authorLastName = author.authorLastName.trim();  

        const bookCollection = await books();
    
        let newBook = {
          title: title,
          author: author,
          genre: genre,
          datePublished: datePublished,
          summary: summary,
          reviews: [],
        };
    
        const insertInfo = await bookCollection.insertOne(newBook);
        if (insertInfo.insertedCount === 0) throw 'Could not add book';
    
        const newId = insertInfo.insertedId;
        let book = await this.get(newId.toString());
        return book;
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
        let review1 = await this.get(id);
        //let x = review1.reviews;
        //for(let i = 0; i < x.length; i++){
        //  await reviews.remove(id, x[i]);
        //}
        const deletionInfo = await bookCollection.removeOne({ _id: ObjectID(id) });
        //if (deletionInfo.deletedCount === 0) {
        //  throw `Could not delete user with id of ${id}`;
        //}
        return {bookId: id, deleted: true};
      },

      async update(id, book) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!book) throw 'ERROR: You must provide an book to update';
        if (typeof(id) !== 'string' || id === "") throw 'ERROR: Invalid ID input';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        if(typeof(book) != 'object') throw 'ERROR: Invalid book';
        if(book.title === 'undefined' && book.datePublished && 'undefined' && book.summary && 'undefined' && book.genre && 'undefined'  && book.author && 'undefined'){
          throw "ERROR: Book does not have any updatable components"
        }
        let updatedBook = {};
        if(book.title){
          if(typeof(book.title) !== 'string' || book.title.trim() === ""){
            throw "ERROR: Invalid input for title"
          }
          book.title = book.title.trim();
          updatedBook.title = book.title;
        }
        
        if(book.datePublished){
          if(typeof(book.datePublished) !== 'string' || book.datePublished.trim() === ""){
            throw "ERROR: Invalid input for datePublished"
          }
          book.datePublished = book.datePublished.trim();
          let date = book.datePublished.split("/");
          if(date.length !== 3) throw "ERROR: Invalid date";
          if(Number.isNaN(Number(date[0])) || Number.isNaN(Number(date[1])) || Number.isNaN(Number(date[2]))) throw "ERROR: Invalid date";
          if(!Number.isInteger(Number(date[0])) || !Number.isInteger(Number(date[1])) || !Number.isInteger(Number(date[2]))) throw "ERROR: Invalid date";
          if(Number(date[0]) < 1 || Number(date[0]) > 12) throw "ERROR: Invalid date";
          if(Number(date[1]) < 1 || Number(date[1]) > 31) throw "ERROR: Invalid date";
          if(Number(date[2]) < 0 || Number(date[2]) > 2020) throw "ERROR: Invalid date"; 
          updatedBook.datePublished = book.datePublished;      
        }
        if(book.summary){
          if(typeof(book.summary) !== 'string' || book.summary.trim() === ""){
            throw "ERROR: Invalid input for summary"
          }
          book.summary = book.summary.trim();
          updatedBook.summary = book.summary;
        }
        if(book.genre){
          if(!Array.isArray(book.genre)){
            throw "ERROR: Genre is not an array"
          }
          if(book.genre.length <= 0){
            throw "ERROR: Genre is not a valid array"
          }
          let count = 0;
          let genre_arr = []
          for(let i = 0; i < book.genre.length; i++){
            if(typeof(book.genre[i]) === 'string' && book.genre[i].trim() !== ""){
              count++;
              genre_arr.push(book.genre[i].trim())
            }
          }
          if(count === 0){
            throw "ERROR: Genre does not have any valid strings";
          }
          updatedBook.genre = genre_arr
        }
        if(book.author){
          if(typeof(book.author) !== 'object'){
            throw "ERROR: Invalid input for author";
          }
          if(book.author.authorFirstName === 'undefined' || typeof(book.author.authorFirstName) !== 'string' || book.author.authorFirstName.trim() === ""){
            throw "ERROR: Invalid input for author.authorFirstName";
          }
          if(book.author.authorLastName === 'undefined' || typeof(book.author.authorLastName) !== 'string' || book.author.authorLastName.trim() === ""){
            throw "ERROR: Invalid input for author.authorLastName";
          }
          book.author.authorFirstName = book.author.authorFirstName.trim(); 
          book.author.authorLastName = book.author.authorLastName.trim(); 
          updatedBook.author = book.author
        }
        let book1 = await this.get(id);
        //updatedBook.reviews = book1.reviews;
  
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