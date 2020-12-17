const { ObjectID } = require('mongodb');
const express = require(`express`);
const router = express.Router();
const groups = require(`../data/groups`);
const lists = require(`../data/lists`);
const users = require(`../data/users`);
const forums = require(`../data/forums`);
const threads = require(`../data/threads`);

router.get('/', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    const allGroups = await groups.getAllPublic();
    res.render('../views/groups', {body: allGroups});
  } catch (e) {
    res.status(404).render('../views/error', { errorMessage: `Error: Could not get Public Group data`, other: true })
  }
})

router.get('/:id', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    const thisGroup = await groups.read(req.params.id);
    const groupForum = await forums.read(thisGroup.forum);
    const info = await getInfo(req, thisGroup, groupForum);
    return res.render('../views/group', {body: thisGroup, list: info.listArr, owner: info.isOwner, admin: info.isAdmin, threads: info.threadArr});
  } catch (e) {
    return res.status(404).render('../views/error', { errorMessage: `Error: Could not get group: ${req.params.id} info. ${e}`, other: true });
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
    const groupForum = await forums.read(addGroup.forum);
    const info = await getInfo(req, addGroup, groupForum)
    return res.render('../views/group', { body: addGroup, list: info.listArr, owner: info.isOwner, admin: info.isAdmin, threads: info.threadArr });
  } catch (e) {
    return res.status(404).render('../views/error', { errorMessage: `Group Error: ${req.params.name} could not be created`, other: true});
  }
})

router.post('/addAdmin/:groupId', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    const member = await users.getByName(req.body.adminName);
    const addAdmin = await groups.addAdmin(req.params.groupId, member._id, req.session.user._id);
    const groupForum = await forums.read(addAdmin.forum);
    const info = await getInfo(req, addAdmin, groupForum)
    return res.status(200).render('../views/group', { body: addAdmin, list: info.listArr, owner: info.isOwner, admin: info.isAdmin, threads: info.threadArr, message: `Admin added correctly!` });
  } catch (e) {
    return res.status(404).render('../views/error', { errorMessage: `Issue adding member to admin list. ${e}`, other: true});
  }
})

router.post('/deleteAdmin/:groupId', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    const admin = await users.getByName(req.body.adminName);
    const deleteAdmin = await groups.deleteAdmin(req.params.groupId, admin._id, req.session.user._id);
    const groupForum = await forums.read(deleteAdmin.forum);
    const info = await getInfo(req, deleteAdmin, groupForum);
    return res.status(200).render('../views/group', { body: deleteAdmin, list: info.listArr, owner: info.isOwner, admin: info.isAdmin, threads: info.threadArr, message: `Admin deleted correctly!` });
  } catch (e) {
    return res.status(404).rendor('../views/error', { errorMessage: `Issue deleting admin from the admin list. ${e}`, other: true});
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
      const groupForum = await forums.read(inviteMember.forum);
      const info = await getInfo(req, inviteMember, groupForum)
      return res.status(200).render('../views/group', { body: inviteMember, list: info.listArr, owner: info.isOwner, admin: info.isAdmin, threads: info.threadArr,message: `User invited correctly!` });
    } else {
      const member = req.body.memberName ? await users.getByName(req.body.memberName) : await users.get(ObjectID(req.session.user._id));
      const addMember = await groups.addPublicMember(req.params.groupId, member._id);
      const groupForum = await forums.read(addMember.forum);
      const info = await getInfo(req, addMember, groupForum)
      return res.status(200).render('../views/group', { body: addMember, list: info.listArr, owner: info.isOwner, admin: info.isAdmin, threads: info.threadArr, message: `User added correctly!` });
    }
  } catch (e) {
    return res.status(404).render('../views/error', { errorMessage: `Issue adding member to member list. ${e}`, other: true});
  }
})

router.post('/deleteMember/:groupId', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }
  try {
    const member = await users.getByName(req.body.memberName);
    const deleteMember = await groups.deleteMember(req.params.groupId, member._id, req.session.user._id);
    const groupForum = await forums.read(deleteMember.forum);
    const info = await getInfo(req, deleteMember, groupForum)
    return res.status(200).render('../views/group', { body: deleteMember, list: info.listArr, owner: info.isOwner, admin: info.isAdmin, threads: info.threadArr, message: `Member deleted correctly!`});
  } catch (e) {
    return res.status(404).render('../views/error', { errorMessage: `Issue deleting member from the member list. ${e}`, other: true});
  }
})

router.post('/inviteResponse/:groupId/:inviteRes', async (req, res) => {
  try {
    let inviteRes = ( req.params.inviteRes === 'true')
    const response = await groups.inviteResponse(req.params.groupId, req.session.user._id, inviteRes);
    const groupForum = await forums.read(response.forum);
    const info = await getInfo(req, response, groupForum)
    if (inviteRes) {
      return res.status(200).render('../views/group', { body: response, list: info.listArr, owner: info.owner, admin: info.admin, threads: info.threadArr });
    } else {
      return res.redirect('/home');
    }
  } catch (e) {
    return res.status(404).render('../views/error', { errorMessage: `Issue while responding to an invitation. ${e}`, other: true});
  }
})


async function getInfo(req, thisGroup, groupForum) {
    let listArr = [];
    let threadArr = [];
    let isOwner = false;
    let isAdmin = false;
    if (thisGroup.owner.toString() === req.session.user._id) {
        isOwner = true;
      }
      for (let admin of thisGroup.admins) {
        if (req.session.user._id === admin.toString()) {
          isAdmin = true;
        }
      }
      for (let list of thisGroup.lists) {
        listArr.push(await lists.get(ObjectID(list)));
      }
      for (let thread of groupForum.threads) {
        threadArr.push(await threads.read(ObjectID(thread)))
      }
      return { isOwner: isOwner, isAdmin: isAdmin, listArr: listArr, threadArr: threadArr };
}

module.exports = router;