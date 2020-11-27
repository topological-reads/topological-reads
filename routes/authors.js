const express = require('express'); // Use for testing
const router = express.Router();
const data = require('../data');
const authorsData = data.authors;

router.get('/', async (req, res) => {
  try {
    const authors = await authorsData.getAll();
    res.json(authors);
  } catch (e) {
    console.log(e);
    res.status(404).json({ error: 'Authors not found' });
  }
});

router.post('/', async (req, res) => {
  let author = req.body;
  if(!author){
    res.status(400).json({ error: 'You must provide an author' });
    return;
  }
  if (!author.name) {
    res.status(400).json({ error: 'You must provide an author name' });
    return;
  }

  if(Object.keys(author).length !== 1){
    res.status(400).json({ error: 'Too many inputs' });
    return;
  }
  try {
    const newAuthor = await authorsData.create(author.name);
    res.json(newAuthor);
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
    let author = await authorsData.get(req.params.id);
    res.json(author);
  } catch (e) {
    console.log(e)
    res.status(404).json({ error: 'Author not found' });
  }
});

router.put('/:id', async (req, res) => {
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
    await authorsData.get(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'Author not found' });
    return;
  }

  try {
    const updatedPost = await authorsData.update(req.params.id, updatedData);
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
  if(!requestBody.name){
    res.status(400).json({ error: 'You must supply at least one field' });
    return; 
  }
  try {
    const oldPost = await authorsData.get(req.params.id);
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
    res.status(404).json({ error: 'Author not found' });
    return;
  }
  if (Object.keys(updatedObject).length !== 0) {
    try {
      const updatedPost = await authorsData.update(
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
    await authorsData.get(req.params.id);
  } catch (e) {
    res.status(404).json({ error: 'Author not found' });
    return;
  }
  try {
    const author1 = await authorsData.remove(req.params.id);;
    res.json(author1);
  } catch (e) {
    res.status(400).json({ error: e });
  }
});

module.exports = router;