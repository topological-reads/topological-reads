const { ObjectID } = require('mongodb'); // Edit
const mongoCollections = require('../config/mongoCollections');
const authors = mongoCollections.authors;

module.exports = {
    async create(author){
        if(!author || typeof(author) !== 'string' || author.trim() === ""){
            throw "ERROR: Invalid author input"
        }
        author = author.trim();
        const authorCollection = await authors();
        let newAuthor = {
          name: author,
        };
        const insertInfo = await authorCollection.insertOne(newAuthor);
        if (insertInfo.insertedCount === 0) throw 'Could not add author';
        const newId = insertInfo.insertedId;
        let author1 = await this.get(newId);
        return author1;
      },

      async getAll() {
        const authorCollection = await authors();
        const authorList = await authorCollection.find({}).toArray();
        return authorList;
      },

      async get(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'object') throw 'ERROR: id is not an object';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id'
        const authorCollection = await authors();
        const author1 = await authorCollection.findOne({ _id: id});
        if (author1 === null) throw 'ERROR: No book with that id';
        return author1;
      }
};