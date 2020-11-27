const dbConnection = require('./mongoConnection'); // Done

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

/* Now, you can list your collections here: */
module.exports = {
  books: getCollectionFn('books'),
  authors: getCollectionFn('authors'),
  users: getCollectionFn('users'),
  forums: getCollectionFn('forums'),
  groups: getCollectionFn('groups'),
  lists: getCollectionFn('lists'),
  threads: getCollectionFn('threads'),
  tags: getCollectionFn('tags'),
};