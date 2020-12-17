const { ObjectID } = require('mongodb'); // Edit
const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const books = mongoCollections.books;
const groupData = mongoCollections.groups;
const listData = mongoCollections.lists;

const bcrypt = require('bcryptjs');
const saltRounds = 10;

module.exports = {
    async create(name, email, read, reading, groups, lists, listsFollowing, 
      usersFollowing, password, invitations){ 
        if(!name || typeof(name) !== 'string' || name.trim() === ""){
            throw "ERROR: Invalid name input";
        }
        let users_list = await this.getAll();
        for(let i = 0; i < users_list.length; i++){
          if(users_list[i].name === name){
            throw `ERROR: User with name ${name} is already in the system`
          }
          if(users_list[i].email === email){
            throw `ERROR: User with email ${email} is already in the system`
          }
        }
        name = name.toLowerCase();
        if(!email || typeof(email) !== 'string' || email.trim() === ""){
            throw "ERROR: Invalid email input";
        }
        
        if(!read || !Array.isArray(read)){
            throw "ERROR: Invalid read input";
        }

        if(!reading || !Array.isArray(reading)){
          throw "ERROR: Invalid reading input";
      }

        const userCollection = await users();
        const bookCollection = await books();
        const groupCollection = await groupData();
        const listsCollection = await listData();

        for(elem of read) {
          if(!ObjectID.isValid(elem)) {
            throw `ERROR: ObjectID ${elem.toString()} in read list is invalid`;
          }
          const book1 = await bookCollection.findOne({ _id: elem});
          if (book1 === null) {
            throw `ERROR: read element ${elem} has a book ID that is not in the db`;
          }
        }

        for(elem of reading) {
          if(!ObjectID.isValid(elem)) {
            throw `ERROR: ObjectID ${elem.toString()} in reading list is invalid`;
          }
          const book1 = await bookCollection.findOne({ _id: elem});
          if (book1 === null) {
            throw `ERROR: reading element ${elem} has a book ID that is not in the db`;
          }
        }

        if(!groups || !Array.isArray(groups)){
          throw "ERROR: Invalid group input";
        }

        for(elem of groups) {
          if(!ObjectID.isValid(elem)) {
            throw `ERROR: ObjectID ${elem.toString()} in groups list is invalid`;
          }
          const group1 = await groupCollection.findOne({ _id: elem });
          if (group1 === null) {
            throw `ERROR: groups element ${elem} has a group ID that is not in the db`;
          }
        }

        if(!lists || !Array.isArray(lists)){
          throw "ERROR: Invalid list input";
        }

        for(elem of lists) {
          if(!ObjectID.isValid(elem)) {
            throw `ERROR: ObjectID ${elem.toString()} in reading list is invalid`;
          }
          const lists1 = await listsCollection.findOne({ _id: elem });
          if (lists1 === null) {
            throw `ERROR: lists element ${elem} has an ID that is not in the db`;
          }
        }

        if(!listsFollowing || !Array.isArray(listsFollowing)){
          throw "ERROR: Invalid listsFollowing input";
        }

        for(elem of listsFollowing) {
          if(!ObjectID.isValid(elem)) {
            throw `ERROR: ObjectID ${elem.toString()} in listsFollowing is invalid`;
          }
          const lists1 = await listsCollection.findOne({ _id: elem });
          if (lists1 === null) {
            throw `ERROR: listsFollowing element ${elem} has an ID that is not in the db`;
          }
        }

        if(!usersFollowing || !Array.isArray(usersFollowing)){
          throw "ERROR: Invalid usersFollowing input";
        }

        for(elem of usersFollowing) {
          if(!ObjectID.isValid(elem)) {
            throw `ERROR: ObjectID ${elem.toString()} in usersFollowing list is invalid`;
          }
          const user1 = await userCollection.findOne({ _id: elem });
          if (user1 === null) {
            throw `ERROR: usersFollowing element ${elem} has an ID that is not in the db`;
          }
        }

        if(!password || typeof(password) !== 'string' || password.trim() === ""){
          throw "ERROR: Invalid password input";
        }

        if(!invitations || !Array.isArray(invitations)){
          throw "ERROR: Invalid invitations input";
        }

        for(elem of invitations) {
          if(!ObjectID.isValid(elem)) {
            throw `ERROR: ObjectID ${elem.toString()} in invitations list is invalid`;
          }
          const group1 = await groupCollection.findOne({ _id: elem });
          if (group1 === null) {
            throw `ERROR: invitations element ${elem} has an ID that is not in the db`;
          }
        }

        let hashedPass = await bcrypt.hash(password, saltRounds)

        let newuser = {
          name: name.trim(),
          email: email.trim(),
          read: read,
          reading: reading,
          groups: groups,
          lists: lists,
          listsFollowing: listsFollowing,
          usersFollowing : usersFollowing,
          password: hashedPass,
          invitations: invitations
        };
        const insertInfo = await userCollection.insertOne(newuser);
        if (insertInfo.insertedCount === 0) throw 'Could not add user';
        const newId = insertInfo.insertedId;
        let user2 = await this.get(newId);
        return user2;
      },

      async getAll() {
        const userCollection = await users();
        const userList = await userCollection.find({}).toArray();
        if(userList === []){
          throw 'ERROR: There are no users in this database'
        }
        return userList
      },

      async get(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'object') throw 'ERROR: id is not an object';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id'
        const userCollection = await users();
        const user1 = await userCollection.findOne({ _id: id});
        if (user1 === null) throw 'ERROR: No user with that id';
        return user1;
      },

      async getByName(name) {
        if (!name) throw 'ERROR: You must provide a name to search for';
        // if (typeof(name) !== 'object') throw 'ERROR: name is not an object';
        //if(!ObjectID.isValid(name)) throw 'ERROR: Invalid object name'
        const userCollection = await users();
        const user1 = await userCollection.findOne({name});
        if (user1 === null) throw 'ERROR: No user with that name';
        return user1;
      },

      async remove(id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (typeof(id) !== 'object') throw 'ERROR: id is not a string';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid object id';
        const userCollection = await users();
        const deletionInfo = await userCollection.removeOne({ _id: id});
        if (deletionInfo.deletedCount === 0) {
         throw `Could not delete user with id of ${id}`;
        }
        return {userId: id, deleted: true};
      },


      //handles id and book_id as strings
      async addBook(id, book_id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!book_id) throw 'ERROR: You must provide an book_id to add';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid id';
        if(!ObjectID.isValid(book_id)) throw 'ERROR: Invalid book_id id';

        const userCollection = await users();
        const user = await this.get(ObjectID(id));

        if(!user.read.some(function (book) {
          return book.equals(ObjectID(book_id))
        })) {
          const updatedUser = await userCollection.updateOne(
            {_id: ObjectID(id)},
            {$push: {read: ObjectID(book_id)}}
          );
          if (!updatedUser.matchedCount && !updatedUser.modifiedCount){
            throw 'addBook failed';
          }
        }
        return this.get(ObjectID(id));
      },

      //handles id and book_id as strings
      async addReading(id, book_id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!book_id) throw 'ERROR: You must provide an book_id to add';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid id';
        if(!ObjectID.isValid(book_id)) throw 'ERROR: Invalid book_id id';

        const userCollection = await users();
        const user = await this.get(ObjectID(id));
        if(!user.reading.some(function (book) {
          return book.equals(ObjectID(book_id))
        })) {
          const updatedUser = await userCollection.updateOne(
            {_id: ObjectID(id)},
            {$push: {reading: ObjectID(book_id)}}
          );
          if (!updatedUser.matchedCount && !updatedUser.modifiedCount){
            throw 'addreading failed';
          }
        }
        return this.get(ObjectID(id));
      },

      //handles id and book_id as strings
      async removeReading(id, book_id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!book_id) throw 'ERROR: You must provide an book_id to add';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid id';
        if(!ObjectID.isValid(book_id)) throw 'ERROR: Invalid book_id id';

        const userCollection = await users();
        const updatedUser = await userCollection.updateOne(
          {_id: ObjectID(id)},
          {$pull: {reading: ObjectID(book_id)}}
        );
        if (!updatedUser.matchedCount && !updatedUser.modifiedCount){
          throw 'removeReading failed';
        }
        return this.get(ObjectID(id));
      },

      //handles id and book_id as strings
      async followUser(id, user_id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!user_id) throw 'ERROR: You must provide an book_id to add';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid id';
        if(!ObjectID.isValid(user_id)) throw 'ERROR: Invalid book_id id';

        const userCollection = await users();
        const updatedUser = await userCollection.updateOne(
          {_id: ObjectID(id)},
          {$push: {usersFollowing: ObjectID(user_id)}}
        );
        if (!updatedUser.matchedCount && !updatedUser.modifiedCount){
          throw 'addBook failed';
        }
        return this.get(ObjectID(id));
      },

      //handles id and list_id as strings
      async addList(id, list_id) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!list_id) throw 'ERROR: You must provide an book_id to add';
        if(!ObjectID.isValid(id)) throw 'ERROR: Invalid id';
        if(!ObjectID.isValid(list_id)) throw 'ERROR: Invalid book_id id';

        const userCollection = await users();
        const updatedUser = await userCollection.updateOne(
          {_id: ObjectID(id)},
          {$push: {lists: ObjectID(list_id)}}
        );
        if (!updatedUser.matchedCount && !updatedUser.modifiedCount){
          throw 'addList failed';
        }
        return this.get(ObjectID(id));
      },

      async update(id, user) {
        if (!id) throw 'ERROR: You must provide an id to search for';
        if (!user) throw 'ERROR: You must provide an user to update';
        if (typeof(id) !== 'object' ) throw 'ERROR: Invalid ID input';
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
          {_id: id},
          { $set: updatedUser }
        );
        if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount){
          throw 'Update failed';
        }
        return await this.get(id);
      },
};