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
        let author1 = await this.get(newId.toString());
        return author1;
      },

      async getAll() {
        const authorCollection = await authors();
        const authorList = await authorCollection.find({}).toArray();
        let ans = [];
        for (let i = 0; i < authorList.length; i++){
          authorList[i]._id = authorList[i]._id.toString();
          ans.push({"_id": authorList[i]._id, "name": authorList[i].name})
        }
        return ans;
      },

      async get(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'string') throw 'ERROR: id is not a string';
        if (id === '') throw 'ERROR: id is not a valid string';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id'
        const authorCollection = await authors();
        const author1 = await authorCollection.findOne({ _id: ObjectID(id) });
        if (author1 === null) throw 'ERROR: No book with that id';
        author1._id = author1._id.toString();
        return author1;
      },

      async remove(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'string') throw 'ERROR: id is not a string';
        if (id === "") throw "ERROR: Invalid object id"
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        const authorCollection = await authors();
        const deletionInfo = await authorCollection.removeOne({ _id: ObjectID(id) });
        //if (deletionInfo.deletedCount === 0) {
        //  throw `Could not delete user with id of ${id}`;
        //}
        return {authorId: id, deleted: true};
      },

      async update(id, author) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!author) throw 'ERROR: You must provide an author to update';
        if (typeof(id) !== 'string' || id === "") throw 'ERROR: Invalid ID input';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        if(typeof(author) != 'object') throw 'ERROR: Invalid author';
        if(author.name === 'undefined'){
            throw "ERROR: Book does not have any updatable components";
        }
        let updatedAuthor = {};
        if(author.name){
          if(typeof(author.name) !== 'string' || author.name.trim() === ""){
            throw "ERROR: Invalid input for title"
          }
          author.name = author.name.trim();
          updatedAuthor.name = author.name;
        }
  
        const authorCollection = await authors();
        const updatedInfo = await authorCollection.updateOne(
          {_id: ObjectID(id)},
          { $set: updatedAuthor }
        );
        //if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
        // throw 'Update failed';
  
        return await this.get(id);
      },
};