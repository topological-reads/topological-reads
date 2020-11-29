const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const books = data.books;
const authors = data.authors;
const tags = data.tags;
const users = data.users;

async function main() {
  const db = await dbConnection();
  await db.dropDatabase();

  
  console.log("Making author 1")
  const author1 = await authors.create("F. Scott Fitzgerald")
  const id3 = author1._id;
  console.log(author1);
  console.log("Making author 2")
  const author2 = await authors.create("J.D. Salinger")
  const id4 = author2._id;
  console.log(author2);

  console.log("Making book 1")
  const book1 = await books.create("The Shining","1111111111111",[id3])
  //const id = book1._id.toString();
  console.log(book1);
  console.log("Making book 2")
  const book2 = await books.create("The Great Gatsby","1111111111112",[id4])
  const id = book2._id;
  console.log(book2);

  console.log("Making user 1")
  const user1 = await users.create("Nicole","nicole.crockett79@gmail.com",[id])
  //const id = book1._id.toString();
  console.log(user1);
  const user_getAll = await users.getAll();
  console.log(user_getAll);

  console.log("Making tag 1")
  const tag1 = await tags.create("Spoopy")
  console.log(tag1);
  console.log("Making tag 2")
  const tag2 = await tags.create("Scary")
  console.log(tag2);

  console.log("books: getAll()")
  const book_get = await books.getAll();
  console.log(book_get);

  console.log("books: get(id)")
  const book_getOne = await books.get(id);
  console.log(book_getOne);
  
  // CHECK UPDATE LATER
  //const book_update = await books.update(id, {
  //  "title": "The Great Gatsby UPDATED"})
  //console.log(book_update);
  
  console.log("books: remove(id)")
  const book_remove = await books.remove(id);
  console.log(book_remove);

  console.log("books: update");
  console.log('Done seeding database');
  await db.serverConfig.close();
}

main();