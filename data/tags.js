const { ObjectID } = require('mongodb'); // Edit
const mongoCollections = require('../config/mongoCollections');
const tags = mongoCollections.tags;

module.exports = {
    async create(tag){
        let tags_list = await this.getAll();
        for(const t of tags_list){
          if(t.tag === tag){
            throw 'ERROR: Tag already exists'
          }
        }
        if(!tag || typeof(tag) !== 'string' || tag.trim() === ""){
            throw "ERROR: Invalid tag input"
        }
        tag = tag.trim();
        const tagCollection = await tags();
        let newtag = {
          name: tag,
        };
        const insertInfo = await tagCollection.insertOne(newtag);
        if (insertInfo.insertedCount === 0) throw 'Could not add tag';
        const newId = insertInfo.insertedId;
        let tag1 = await this.get(newId.toString());
        return tag1;
      },

      async getAll() {
        const tagCollection = await tags();
        const tagList = await tagCollection.find({}).toArray();
        let ans = [];
        for (let i = 0; i < tagList.length; i++){
          tagList[i]._id = tagList[i]._id.toString();
          ans.push({"_id": tagList[i]._id, "name": tagList[i].name})
        }
        if(ans === []){
          throw "ERROR: No tags added yet!"
        }
        return ans;
      },

      async get(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'string') throw 'ERROR: id is not a string';
        if (id === '') throw 'ERROR: id is not a valid string';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id'
        const tagCollection = await tags();
        const tag1 = await tagCollection.findOne({ _id: ObjectID(id) });
        if (tag1 === null) throw 'ERROR: No book with that id';
        tag1._id = tag1._id.toString();
        return tag1;
      },

      async remove(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'string') throw 'ERROR: id is not a string';
        if (id === "") throw "ERROR: Invalid object id"
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        const tagCollection = await tags();
        const deletionInfo = await tagCollection.removeOne({ _id: ObjectID(id) });
        //if (deletionInfo.deletedCount === 0) {
        //  throw `Could not delete user with id of ${id}`;
        //}
        return {tagId: id, deleted: true};
      },

      async update(id, tag) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!tag) throw 'ERROR: You must provide an tag to update';
        if (typeof(id) !== 'string' || id === "") throw 'ERROR: Invalid ID input';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        if(typeof(tag) != 'object') throw 'ERROR: Invalid tag';
        if(tag.name === 'undefined'){
            throw "ERROR: Book does not have any updatable components";
        }
        let updatedTag = {};
        if(tag.name){
          if(typeof(tag.name) !== 'string' || tag.name.trim() === ""){
            throw "ERROR: Invalid input for title"
          }
          tag.name = tag.name.trim();
          updatedTag.name = tag.name;
        }
  
        const tagCollection = await tags();
        const updatedInfo = await tagCollection.updateOne(
          {_id: ObjectID(id)},
          { $set: updatedTag }
        );
        //if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
        // throw 'Update failed';
  
        return await this.get(id);
      },
};