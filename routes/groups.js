const express = require(`express`);
const router = express.Router();
const groups = require(`../data/groups`);
const lists = require(`../data/lists`);
const users = require(`../data/users`);

router.get('/', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    const allGroups = await groups.getAllPublic();
    res.render('../views/groups', {body: allGroups});
  } catch (e) {
    res.status(404).json({ error: `Error: Could not get Public Group data` })
  }
})

router.get('/:id', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    let listArr = []
    let isOwner = false;
    let isAdmin = false;
    const thisGroup = await groups.read(req.params.id);
    if (thisGroup.owner.toString() === req.session.user._id) {
      isOwner = true;
    }
    for (let admin of thisGroup.admins) {
      if (req.session.user._id === admin.toString()) {
        isAdmin = true;
      }
    }
    for (let list in thisGroup.lists) {
      listArr.push(await lists.get(list));

    }
    return res.render('../views/group', {body: thisGroup, list: listArr, owner: isOwner, admin: isAdmin});
  } catch (e) {
    return res.status(404).json({ error: `Error: Could not get group: ${req.params.id} info. ${e}` });
  }
})

router.post('/:name', async (req, res) => {
  let private = req.query.private ? req.query.private : false;
  let tags = req.query.tags ? req.query.tags : [];
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    const addGroup = await groups.create(req.params.name, req.session.user, private, tags);
    return res.render('../views/group', addGroup);
  } catch (e) {
    return res.status(404).json({ error: `Group Error: ${req.params.name} could not be created`});
  }
})

router.post('/addAdmin/:groupId', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    const member = await users.getByName(req.body.adminName);
    const addAdmin = await groups.addAdmin(req.params.groupId, member._id, req.session.user._id);
    return res.status(200);
  } catch (e) {
    return res.status(404).json({ error: `Issue adding member: ${member.name} to admin list. ${e}`});
  }
})

router.post('/deleteAdmin/:groupId', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    const admin = await users.getByName(req.body.adminName);
    const deleteAdmin = await groups.deleteAdmin(req.params.groupId, admin._id, req.session.user._id);
    return res.status(200);
  } catch (e) {
    return res.status(404).json({ error: `Issue adding member: ${member.name} to admin list. ${e}`});
  }
})

router.post('/addMember/:groupId', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    const group = await groups.read(req.params.groupId);
    if (group.private) {
      const member = await users.getByName(req.body.memberName);
      const inviteMember = await groups.invitePrivateMember(req.params.groupId, member._id, req.session.user._id);
      return res.status(200);
    } else {
      const member = await users.getByName(req.body.memberName);
      const addMember = await groups.addPublicMember(req.params.groupId, member._id);
      return res.status(200);
    }
  } catch (e) {
    return res.status(404).json({ error: `Issue adding member: ${member.name} to admin list. ${e}`});
  }
})

router.post('/deleteMember/:groupId', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    const member = await users.getByName(req.body.memberName);
    const deleteMember = await groups.deleteMember(req.params.groupId, member._id, req.session.user._id);
    return res.status(200);
  } catch (e) {
    return res.status(404).json({ error: `Issue adding member: ${member.name} to admin list. ${e}`});
  }
})

module.exports = router;