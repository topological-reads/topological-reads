const { ObjectID } = require('mongodb'); // Edit
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const books = mongoCollections.books;

module.exports = {
    async create(name, email, read){ // add in everything after groups
        if(!name || typeof(name) !== 'string' || name.trim() === ""){
            throw "ERROR: Invalid name input"
        }
        if(!email || typeof(email) !== 'string' || email.trim() === ""){
            throw "ERROR: Invalid email input"
        }
        const userCollection = await users();
        const bookCollection = await books();
        if(!read || !Array.isArray(read)){
            throw "ERROR: Invalid book input"
        }
        const bookList = await bookCollection.find({}).toArray();
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
        name = name.trim();
        email = email.trim();
        let newuser = {
          name: name,
          email: email,
          read: read
        };
        const insertInfo = await userCollection.insertOne(newuser);
        if (insertInfo.insertedCount === 0) throw 'Could not add user';
        const newId = insertInfo.insertedId;
        let user1 = await this.get(newId.toString());
        return user1;
      },

      async getAll() {
        const userCollection = await users();
        const userList = await userCollection.find({}).toArray();
        let ans = [];
        for (let i = 0; i < userList.length; i++){
          userList[i]._id = userList[i]._id.toString();
          ans.push({"_id": userList[i]._id, "name": userList[i].name})
        }
        return ans;
      },

      async get(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'string') throw 'ERROR: id is not a string';
        if (id === '') throw 'ERROR: id is not a valid string';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id'
        const userCollection = await users();
        const user1 = await userCollection.findOne({ _id: ObjectID(id) });
        if (user1 === null) throw 'ERROR: No user with that id';
        user1._id = user1._id.toString();
        return user1;
      },

      async remove(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'string') throw 'ERROR: id is not a string';
        if (id === "") throw "ERROR: Invalid object id"
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        const userCollection = await users();
        const deletionInfo = await userCollection.removeOne({ _id: ObjectID(id) });
        //if (deletionInfo.deletedCount === 0) {
        //  throw `Could not delete user with id of ${id}`;
        //}
        return {userId: id, deleted: true};
      },

      async update(id, user) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!user) throw 'ERROR: You must provide an user to update';
        if (typeof(id) !== 'string' || id === "") throw 'ERROR: Invalid ID input';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        if(typeof(user) != 'object') throw 'ERROR: Invalid user';
        if(user.name === 'undefined'){
            throw "ERROR: user does not have any updatable components";
        }
        let updatedUser = {};
        if(user.name){
          if(typeof(user.name) !== 'string' || user.name.trim() === ""){
            throw "ERROR: Invalid input for title"
          }
          user.name = user.name.trim();
          updatedUser.name = user.name;
        }
  
        const userCollection = await users();
        const updatedInfo = await userCollection.updateOne(
          {_id: ObjectID(id)},
          { $set: updatedUser }
        );
        //if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
        // throw 'Update failed';
  
        return await this.get(id);
      },
};