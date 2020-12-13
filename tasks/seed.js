const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const bookData = require('./project546_book_seed.json');
const books = data.books;
const authors = data.authors;
const tags = data.tags;
const users = data.users;
const groups = data.groups;
const threads = data.threads;
const forums = data.forums;
const { ObjectID } = require(`mongodb`)

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
  const book1 = await books.create("The Shining", "1111111111111", "F. Scott Fitzgerald", 
    1.5, [], "A book")
  const id = book1._id;
  console.log(book1);

  console.log("Making user 1")
  const user1 = await users.create("Nicole","nicole.crockett79@gmail.com",[id], 
    [], [], [], [], "password", [])
  const user1_id = user1._id
  console.log(user1);
  const user_getAll = await users.getAll();
  console.log(user_getAll);


  console.log("Making book 2")
  const book2 = await books.create("The Great Gatsby","1111111111112", "J.D. Salinger", 
    4.76, [[user1_id, 5]], "A great book")
  console.log(book2);

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

  console.log("books: update");

  for(obj of bookData) {
    await books.create(obj.title, (obj.isbn !== "" ? obj.isbn : "N/A"), 
      (obj.author ? obj.author : "N/A"), Number(obj.averageRating), [], obj.description)
    
  }

  console.log(`Create a group!:`)
  const group_create = await groups.create(`Horror Movie Fanatics`, user1_id, false, [`Spoopy`]);
  const test_create = await groups.create(`Test Run`, user1_id, false, [`Scary, Spooky`]);
  console.log(`Horror Movie Fanatics:`, group_create);
  console.log(`Test Group:`, test_create);

  console.log(`Read Test Group:`);
  const read_test = await groups.read(test_create._id);
  console.log(`Test Group Read:`, read_test)

  console.log('Adjust group to add invitee:')
  let updatedGroup = read_test;
  updatedGroup.invitees = [new ObjectID()];
  const update_test = await groups.update(read_test._id, updatedGroup);
  console.log(`Updated Test:`, update_test);

  console.log(`Adjust the new forum:`);
  console.log(`read read_test._id: ${read_test._id}`);
  const test_forum = await forums.read(read_test.forum);
  console.log(`Test!: `, test_forum);
  const update_forum = await forums.update(test_forum._id, {group: test_forum.group, threads: []});
  console.log(`Updated Forum: `, update_forum)

  const inserted_thread = await threads.create(update_forum._id, user1_id, `The Shining was so scary to me!`);
  console.log(`Create a thread for test forum:`, inserted_thread);
  
  const deleted_thread = await threads.delete(inserted_thread._id);
  console.log(`Deleting Test Thread:`, deleted_thread);
  const deleted_group = await groups.delete(update_forum.group);
  console.log(`Test Forum deleted: `, deleted_group);

  console.log('Done seeding database');
  //await db.serverConfig.close();
}

main();