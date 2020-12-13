const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const bookData = require('./project546_book_seed.json');
const books = data.books;
const authors = data.authors;
const tags = data.tags;
const users = data.users;
const lists = data.lists;

async function main() {
  const db = await dbConnection();
  await db.dropDatabase();

  
  console.log("Making author 1")
  const author1 = await authors.create("F. Scott Fitzgerald")
  const author1_id1 = author1._id;
  console.log(author1);
  console.log("Making author 2")
  const author2 = await authors.create("J.D. Salinger")
  const author2_id = author2._id;
  console.log(author2);

  console.log("Making book 1")
  const book1 = await books.create("The Shining", "1111111111111", "F. Scott Fitzgerald", 
    1.5, [], "A book")
  const book1_id = book1._id;
  console.log(book1);

  console.log("Making user 1")
  const user1 = await users.create("Nicole","nicole.crockett79@gmail.com",[book1_id], 
    [], [], [], [], "password", [])
  const user1_id = user1._id
  console.log(user1);
  const user_getAll = await users.getAll();
  console.log(user_getAll);


  console.log("Making book 2")
  const book2 = await books.create("The Great Gatsby","1111111111112", "J.D. Salinger", 
    4.76, [[user1_id, 5]], "A great book")
  console.log(book2);
  const book2_id = book2._id

  console.log("Making tag 1")
  const tag1 = await tags.create("Spoopy")
  let tag1_id = tag1._id;
  console.log(tag1);

  console.log("Making tag 2")
  const tag2 = await tags.create("Scary")
  let tag2_id = tag2._id;
  console.log(tag2);

  console.log("Making list 1")
  const list1 = await lists.create("Our first list!", [book1_id, book2_id], [[book1_id, book2_id]], [user1_id], [tag1_id, tag2_id])
  console.log(list1);

  console.log("books: getAll()")
  const book_get = await books.getAll();
  console.log(book_get);

  console.log("books: get(id)")
  const book_getOne = await books.get(book1_id);
  console.log(book_getOne);

  console.log("books: update");

  for(obj of bookData) {
    await books.create(obj.title, (obj.isbn !== "" ? obj.isbn : "N/A"), 
      (obj.author ? obj.author : "N/A"), Number(obj.averageRating), [], obj.description)
    
  }

  console.log('Done seeding database');
  //await db.serverConfig.close();
}

main();