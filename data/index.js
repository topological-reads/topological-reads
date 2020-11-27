const bookData = require('./books');
const authorData = require('./authors');
const userData = require('./users');
const forumData = require('./forums');
const groupData = require('./groups');
const listData = require('./lists');
const tagData = require('./tags');
const threadData = require('./threads');
module.exports = {
  books: bookData,
  authors: authorData,
  users: userData,
  forums: forumData,
  groups: groupData,
  lists: listData,
  tags: tagData,
  threads: threadData,
};