const e = require('express');
const express = require('express'); // Use for testing
const router = express.Router();
const data = require('../data');
const tagsData = data.tags;
const groupsData = data.groups;
const listsData = data.lists
router.get('/', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    const tags = await tagsData.getAll();
    const groups = await groupsData.getAll();
    const lists = await listsData.getAll();
    let g = []
    let l = []
    for(group of groups){
      if(!group.private){
        let name = group.name
        g.push({id: group._id, name: name})
      }
    }
    for(list of lists){
      let name = list.name
      l.push({id: list._id, name: name})
    }
    if(g === [] && l === []){
      res.render("../views/tags", {body : tags})
    }
    if(g === []){
      res.render("../views/tags", {body : tags, lists: l})
    }
    if(l === []){
      res.render("../views/tags", {body : tags, lists: l})
    }
    else{
      res.render("../views/tags", {body : tags, groups: g, lists: l})
    } 
  } catch (e) {
    console.log(e);
    return res.status(404).render('../views/error', {errorMessage :'Tags not found.', other: true});
  }
});

router.post('/', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  let tag = req.body;
  if(!tag){
    return res.status(404).render('../views/error', {errorMessage :'You must provide a tag.', other: true});
  }
  if (!tag.name) {
    return res.status(404).render('../views/error', {errorMessage :'You must provide a tag name', other: true});
  }

  if(Object.keys(tag).length !== 1){
    return res.status(404).render('../views/error', { errorMessage: 'Too many inputs', other: true});
  }
  try {
    const newTag = await tagsData.create(tag.name);
    res.json(newTag);
  } catch (e) {
      return res.status(404).render('../views/error', { errorMessage: e, other: true});
  }
});

router.post('/search', async (req, res) => {;
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  if(!req.body.searchTerm) {
    return res.status(404).render('../views/error', {errorMessage :'Must enter a term term.', other: true});
  } 
  else {
    let searchTerm = req.body.searchTerm;
    const tags = await tagsData.getAll();
    const groups = await groupsData.getAll();
    const lists = await listsData.getAll();
    let g = []
    let l = []
    for(tag of tags){
      if(tag.name === searchTerm){
        for(group of groups){
          if(!group.private){
            let name = group.name
            if(group.tags.includes(tag.name)){
              g.push({id: group._id, name: name})
            }
          }
        }
        for(list of lists){
          let name = list.name;
          if(list.tags.includes(tag._id)){
            l.push({id: list._id, name: name})
          }
        }
        if(g === [] && l === []){
          return res.render("../views/tags", {body : tags})
        }
        if(g === []){
          return res.render("../views/tags", {body : tags, lists: l})
        }
        if(l === []){
          return res.render("../views/tags", {body : tags, lists: l})
        }
        else{
          return res.render("../views/tags", {body : tags, groups: g, lists: l})
        }
      }
      else{
        return res.status(404).render('../views/error', {errorMessage : `No tag of ${searchTerm} found`, other: true});
      }
    }
      
    }
});

router.get('/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(404).render('../views/error', { errorMessage: 'You must supply an ID', other: true});
  }
  try {
    let tag = await tagsData.get(req.params.id);
    res.json(tag);
  } catch (e) {
    console.log(e)
    return res.status(404).render('../views/error', { errorMessage: "Tag not found", other: true});
  }
});

router.put('/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(404).render('../views/error', { errorMessage: "You must supply an ID", other: true});
  }
  const updatedData = req.body;
  if (!updatedData.name) {
    return res.status(404).render('../views/error', { errorMessage: "You must supply all fields", other: true});
  }
  try {
    await tagsData.get(req.params.id);
  } catch (e) {
    return res.status(404).render('../views/error', { errorMessage: "Tag not found", other: true});
  }

  try {
    const updatedPost = await tagsData.update(req.params.id, updatedData);
    res.json(updatedPost);
  } catch (e) {
    return res.status(404).render('../views/error', { errorMessage: e, other: true});
  }
});

router.patch('/:id', async (req, res) => {
  const requestBody = req.body;
  let updatedObject = {};
  if(!req.params.id){
    return res.status(404).render('../views/error', { errorMessage: 'You must supply an ID', other: true});
    return; 
  }
  if(!requestBody.name){
    return res.status(404).render('../views/error', { errorMessage: 'You must supply at least one field', other: true});
  }
  try {
    const oldPost = await tagsData.get(req.params.id);
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
    return res.status(404).render('../views/error', { errorMessage: "Tag not found", other: true});
  }
  if (Object.keys(updatedObject).length !== 0) {
    try {
      const updatedPost = await tagsData.update(
        req.params.id,
        updatedObject
      );
      res.json(updatedPost);
    } catch (e) {
      res.status(400).json({ error: e });
    }
  } else {
    return res.status(404).render('../views/error', { errorMessage: 'No fields have been changed from their initial values, so no update has occurred', other: true});
  }
});

router.delete('/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(404).render('../views/error', { errorMessage: 'You must supply an ID to delete', other: true});
  }
  
  try {
    await tagsData.get(req.params.id);
  } catch (e) {
    return res.status(404).render('../views/error', { errorMessage: 'Tag not found', other: true});
  }
  try {
    const tag1 = await tagsData.remove(req.params.id);;
    res.json(tag1);
  } catch (e) {
    return res.status(404).render('../views/error', { errorMessage: 'No fields have been changed from their initial values, so no update has occurred', other: true});
  }
});

module.exports = router;