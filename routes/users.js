const express = require('express'); // Use for testing
const router = express.Router();
const data = require('../data');
const usersData = data.users;
const { ObjectID } = require('mongodb');
router.get('/', async (req, res) => {
  try {
    const user = await usersData.getAll();
    console.log(user);
    res.json(user);
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: 'User not found' });
  }
});

router.post('/addBook/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ error: 'You must Supply an ID' });
  }

  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticate to view this information.'});
  }
  try {
    //addBook function handles making strings into ObjectIDs
    const addUser = await usersData.addBook(req.session.user._id, req.params.id);
    return res.status(200)
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: e });
  }

});

router.post('/', async (req, res) => {
  let user = req.body;
  if(!user){
    res.status(400).json({ error: 'You must provide a user' });
    return;
  }
  if (!user.name) {
    res.status(400).json({ error: 'You must provide a name' });
    return;
  }
  if (!user.email) {
    res.status(400).json({ error: 'You must provide an email' });
    return;
  }
  if (!user.read) {
    res.status(400).json({ error: 'You must provide books read'});
    return;
  }
  
  if(Object.keys(user).length !== 3){
    res.status(400).json({ error: 'Too many inputs' });
    return;
  }
  try {
    const newuser = await usersData.create(user.name,user.email,user.read);
    res.json(newuser);
  } catch (e) {
      res.status(400).json({ error: e });
  }
});

router.get('/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'You must Supply an ID' });
    return;
  }
  try {
    let user = await usersData.get(req.params.id);
    res.json(user);
  } catch (e) {
    console.log(e)
    res.status(404).json({ error: 'user not found' });
  }
});

router.put('/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'You must Supply an ID' });
    return;
  }
  const updatedData = req.body;
  if (!updatedData.title || !updatedData.author|| !updatedData.genre || !updatedData.datePublished || !updatedData.summary) {
    res.status(400).json({ error: 'You must supply all fields' });
    return;
  }
  try {
    await usersData.get(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'user not found' });
    return;
  }

  try {
    const updatedPost = await usersData.update(req.params.id, updatedData);
    res.json(updatedPost);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

router.patch('/:id', async (req, res) => {
  const requestBody = req.body;
  let updatedObject = {};
  if(!req.params.id){
    res.status(400).json({ error: 'You must supply an id' });
    return; 
  }
  if(!requestBody.title && !requestBody.author && !requestBody.genre && !requestBody.summary && !requestBody.datePublished){
    res.status(400).json({ error: 'You must supply at least one field' });
    return; 
  }
  try {
    const oldPost = await usersData.get(req.params.id);
    if (requestBody.title){
      if(requestBody.title !== oldPost.title){
        updatedObject.title = requestBody.title;
      }
      else{
        updatedObject.title = oldPost.title;
      }
    }
    if (requestBody.genre){
      if(requestBody.genre !== oldPost.genre){
        updatedObject.genre = requestBody.genre;
      }
      else{
        updatedObject.genre = oldPost.genre;
      }
    }
    if (requestBody.author){
      if(requestBody.author !== oldPost.author){
        updatedObject.author = requestBody.author;
      }
      else{
        updatedObject.author = oldPost.author;
      }
    }
    if (requestBody.datePublished){
      if(requestBody.datePublished !== oldPost.datePublished){
        updatedObject.datePublished = requestBody.datePublished;
      }
      else{
        updatedObject.datePublished = oldPost.datePublished;
      }
    }
    if (requestBody.summary){
      if(requestBody.summary !== oldPost.summary){
        updatedObject.summary = requestBody.summary;
      }
      else{
        updatedObject.summary = oldPost.summary;
      }
    }
    updatedObject.reviews = oldPost.review;
    updatedObject._id = oldPost._id;
      
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  if (Object.keys(updatedObject).length !== 0) {
    try {
      const updatedPost = await usersData.update(
        req.params.id,
        updatedObject
      );
      res.json(updatedPost);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  } else {
    res.status(400).json({
        error: 'No fields have been changed from their initial values, so no update has occurred'
      });
  }
});

router.delete('/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'You must supply ID to delete' });
    return;
  }
  
  try {
    await usersData.get(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  try {
    const user1 = await usersData.remove(req.params.id);;
    res.json(user1);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

module.exports = router;
