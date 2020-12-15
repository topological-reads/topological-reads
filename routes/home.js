const express = require('express');
const data = require('../data');
const { ObjectID } = require('mongodb');
const router = express.Router();
const usersData = data.users;
const bookData = data.books;

router.get('/', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticate to view this information.'});
  }

  try {
    let user = await usersData.get(ObjectID(req.session.user._id));

    let readBooks = []

    for(book of user.read) {
      readBooks.push(await bookData.get(book))
    }

    return res.render('../views/home', {user : user, readBooks: readBooks});
  } catch (e) {
    console.log(e)
    return res.status(404).json({ error: 'user not found' });
  }
});

module.exports = router;
