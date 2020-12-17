const { ObjectID } = require('mongodb');
const express = require(`express`);
const router = express.Router();
const threads = require(`../data/threads`);
const lists = require(`../data/lists`);
const groups = require(`../data/groups`);
const users = require(`../data/users`);
const forums = require(`../data/forums`);

router.get('/:threadId', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', { errorMessage :'You are not authenticated to view this information.' });
  }
  if (!ObjectID.isValid(req.params.threadId)) {
    return res.status(404).render('../views/error', { errorMessage: 'There was an invalid thread id used.', other: true });
  }
  try {
    const thisThread = await threads.read(ObjectID(req.params.threadId));
    const threadPoster = await users.get(thisThread.op);
    return res.render('../views/thread', {body: thisThread, op: threadPoster});
  } catch (e) {
    return res.status(404).render('../views/error', { errorMessage: 'There was an error while grabbing this thread.', other: true });
  }
})

router.post('/:forumId', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', { errorMessage :'You are not authenticated to view this information.' });
  }
  if (!ObjectID.isValid(req.params.forumId)) {
    return res.status(404).render('../views/error', { errorMessage: 'There was an invalid thread id used.', other: true });
  }
  if (!req.body.forumComment) {
    const groupForum = await forums.read(ObjectID(req.params.forumId));
    const thisGroup = await groups.read(groupForum.group);
    const info = await getInfo(req, thisGroup, groupForum)
    return res.render('../views/group', {body: thisGroup, list: info.listArr, owner: info.isOwner, admin: info.isAdmin, threads: info.threadArr, invalidThread: `Please input a value for thread!`});
  }
  try {
      const makeThread = await threads.create(ObjectID(req.params.forumId), ObjectID(req.session.user._id), req.body.forumComment);
      console.log(`Here?!`);
      const getPoster = await users.get(ObjectID(req.session.user._id));
      console.log(`Please??`)
      return res.status(200).render('../views/thread', { body: makeThread, op: getPoster });
  } catch (e) {
      return res.status(404).render('../views/error', { errorMessage: 'There was an issue creating thread.', other: true });
  }
})

router.post('/addComment/:threadId', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', { errorMessage :'You are not authenticated to view this information.' });
  }
  if (!ObjectID.isValid(req.params.threadId)) {
    return res.status(404).render('../views/error', { errorMessage: 'There was an invalid thread id used.', other: true });
  }
  let userOID = ObjectID(req.session.user._id)
  if (!req.body.threadComment) {
    const forumThread = await threads.read(ObjectID(req.params.threadId));
    const thisUser = await users.get(forumThread.op);
    return res.render('../views/group', {body: forumThread, op: thisUser, invalidComment: `Please type a phrase or word to comment!`});
  }
  try {
      const addComment = await threads.addComment(ObjectID(req.params.threadId), userOID, req.body.threadComment);
      const getPoster = await users.get(addComment.op);
      return res.status(200).render("../views/thread", { body: addComment, op: getPoster });
  } catch (e) {
    return res.status(404).render('../views/error', { errorMessage: 'There was an issue commenting on a thread.', other: true });
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

module.exports = router