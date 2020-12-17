const express = require('express'); // Use for testing
const router = express.Router();
const data = require('../data');
const listsData = data.lists;
const userData = data.users;
const { ObjectID } = require('mongodb'); // Edit

router.get('/', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticate to view this information.'});
  }
  try {
    const lists = await listsData.getAll();

    owners = [];

    for(elem of lists) {
      for(i=0; i<elem.owners.length; i++) {
        elem.owners[i] = await userData.get(ObjectID(elem.owners[i]))
      }
    }
    res.render("../views/lists", {body: lists, owners: owners});
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: 'Lists not found' });
  }
});

router.post('/followList/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ error: 'You must Supply an ID' });
  }
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticate to view this information.'});
  }
  try {
    //followUser function handles making strings into ObjectIDs
    await listsData.followList(req.session.user._id, req.params.id);
    return res.status(200)
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: e });
  }
});

router.post('/', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticate to view this information.'});
  }
  let list = req.body.listName;
  if(!list){
    res.status(400).render('../views/error', {other: true, errorMessage: "You must provide a list name!"});
    return;
  }
  try {
    let newList = await listsData.create(list,[],[],[ObjectID(req.session.user._id)],[]);
    await userData.addList(req.session.user._id, newList._id)

    res.redirect('/books')
  } catch (e) {
      res.status(400).json({ error: e });
  }
});

router.post('/fork/:id', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticate to view this information.'});
  }

  if (!req.params.id) {
    res.status(400).render('../views/error', {other: true, errorMessage: "You must provide a valid list id!"});
    return;
  }
  try {
    let currentList = await listsData.get(ObjectID(req.params.id));
    console.log(currentList);
    let newList = await listsData.create(currentList.name + `-${req.session.user.name}`, 
      currentList.items, currentList.order, [ObjectID(req.session.user._id)], currentList.tags);
    await userData.addList(req.session.user._id, newList._id);

    res.redirect(`/lists/${newList._id}`)
  } catch (e) {
      res.status(400).json({ error: e });
  }
});

router.get('/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'You must Supply an ID' });
    return;
  }
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticate to view this information.'});
  }

  try {
    let list = await listsData.get(ObjectID(req.params.id));
    res.render('../views/list', {body: list});
  } catch (e) {
    console.log(e)
    res.status(404).json({ error: 'list not found' });
  }
});

router.get('/ajax/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'You must Supply an ID' });
    return;
  }
  try {
    let list = await listsData.get(ObjectID(req.params.id));
    res.json(list);
  } catch (e) {
    console.log(e)
    res.status(404).json({ error: 'list not found' });
  }
});

router.put('/ajax/:id', async (req, res) => {
  if (!req.params.id) {
    res.status(400).json({ error: 'You must Supply an ID' });
    return;
  }
  const updatedData = req.body;
  if (!updatedData.name) {
    res.status(400).json({ error: 'You must supply all fields' });
    return;
  }
  try {
    await listsData.get(ObjectID(req.params.id));
  } catch (e) {
    res.status(404).json({ error: 'list not found' });
    return;
  }

  try {
    updatedData._id = ObjectID(updatedData._id)
    const updatedPost = await listsData.update(ObjectID(req.params.id), updatedData);
    res.json(updatedPost);
  } catch (e) {
    console.log(e)
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
  if(!requestBody.name){
    res.status(400).json({ error: 'You must supply at least one field' });
    return; 
  }
  try {
    const oldPost = await listsData.get(req.params.id);
    if (requestBody.name){
      if(requestBody.name !== oldPost.name){
        updatedObject.name = requestBody.name;
      }
      else{
        updatedObject.name = oldPost.name;
      }
    }
    updatedObject._id = oldPost._id;
      
  } catch (e) {
    res.status(404).json({ error: 'list not found' });
    return;
  }
  if (Object.keys(updatedObject).length !== 0) {
    try {
      const updatedPost = await listsData.update(
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
    await listsData.get(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'list not found' });
    return;
  }
  try {
    const list1 = await listsData.remove(req.params.id);;
    res.json(list1);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

module.exports = router;