const express = require('express');
const data = require('../data');
const { ObjectID } = require('mongodb');
const users = require('../data/users');
const { read } = require('../data/threads');
const router = express.Router();
const usersData = data.users;
const bookData = data.books;
const listData = data.lists;
const groupData = data.groups;


router.get('/', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticate to view this information.'});
  }

  try {
    let user = await usersData.get(ObjectID(req.session.user._id));

    let readBooks = [];
    // Added let so that we do not declare a global variable unnecessarily
    for(let book of user.read) {
      readBooks.push(await bookData.get(book))
    }

    let readingBooks = [];

    for(readingbook of user.reading) {
      readingBooks.push(await bookData.get(readingbook))
    }

    let followedUsers = [];

    for(let elem of user.usersFollowing) {
      followedUsers.push(await usersData.get(elem))
    }

    let listOfLists = [];
    
    for(let list of user.lists) {
      listOfLists.push(await listData.get(ObjectID(list)))
    }
    
    let memberGroups = await groupData.getGroupsWhereUserIsMember(ObjectID(req.session.user._id));

    return res.render('../views/home', {
      user : user, 
      readBooks: readBooks,
      readingBooks: readingBooks,
      followedUsers: followedUsers,
      myLists: listOfLists,
      memberGroups : memberGroups
    });
  } catch (e) {
    console.log(e)
    return res.status(404).json({ error: 'user not found' });
  }
});

module.exports = router;
