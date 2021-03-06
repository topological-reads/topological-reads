const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const bookData = require('./project546_book_seed.json');
const groups = data.groups;
const threads = data.threads;
const forums = data.forums;
const { ObjectID } = require(`mongodb`);
const books = data.books;
const authors = data.authors;
const tags = data.tags;
const users = data.users;
const lists = data.lists;

async function main() {
  const db = await dbConnection();
  await db.dropDatabase();
  
  const author1 = await authors.create("F. Scott Fitzgerald")
  const author1_id1 = author1._id;
  const author2 = await authors.create("J.D. Salinger")
  const author2_id = author2._id;
  const book1 = await books.create("The Shining", "1111111111111", "F. Scott Fitzgerald", 
    1.5, [], "A book")
  const book1_id = book1._id;
  const user1 = await users.create("Nicole","nicole.crockett79@gmail.com",[book1_id], [],
    [], [], [], [], "password", [])
  const user1_id = user1._id

  const user5 = await users.create(`Chris`, `example@gmail.com`, [book1_id], [],
    [], [], [], [], `Bilbo123`, []);

  const user2 = await users.create("John Smith","test@test.com",[book1_id], [],
    [], [], [], [], "helloworld", [])

  const user3 = await users.create("Doe Rae","test2@test.com",[book1_id], [],
    [], [], [], [], "goodbye$", [])

  const user4 = await users.create("Sunny","test3@test.com",[book1_id], [],
    [], [], [], [], "goodmorning", [])

  const user_getAll = await users.getAll();
  const book2 = await books.create("The Great Gatsby","1111111111112", "J.D. Salinger", 
    4.76, [[user1_id, 5]], "A great book")
  const book2_id = book2._id

  const tag1 = await tags.create("Spoopy")
  let tag1_id = tag1._id;

  const tag2 = await tags.create("Scary")
  let tag2_id = tag2._id;


  const book_get = await books.getAll();

  const book_getOne = await books.get(book1_id);

  for(obj of bookData) {
    await books.create(obj.title, (obj.isbn !== "" ? obj.isbn : "N/A"), 
      (obj.author ? obj.author : "N/A"), Number(obj.averageRating), [], obj.description)
    
  }
  const group_create = await groups.create(`Horror Movie Fanatics`, user1_id, false, [`Spoopy`]);
  const test_create = await groups.create(`Test Run`, user1_id, true, [`Scary`, `Spooky`]);
  const harry_create = await groups.create(`Harry Potter Fans`, user2._id, false, [`Fantasy`, `Thriller`]);
  const tolkien_create = await groups.create(`The Hobbitlings`, user5._id, true, [`Fantasy`, `Adventure`]);

  const read_test = await groups.read(test_create._id);

  const test_forum = await forums.read(read_test.forum);
  const update_forum = await forums.update(test_forum._id, {group: test_forum.group, threads: []});

  const inserted_thread = await threads.create(update_forum._id, user1_id, `The Shining was so scary to me!`);
  const harry_thread = await threads.create(harry_create.forum, user3._id, `Harry Potter is Immortal.  Convince me otherwise.`);
  const tolkien_thread = await threads.create(tolkien_create.forum, user5._id, `The Silmarillion should be the first J.R.R. Tolkien book read.`);

  const allPublic = await groups.getAllPublic();

  const readPublicData = await groups.addPublicMember(group_create._id, new ObjectID());

  const inviteMember = await groups.invitePrivateMember(test_create._id, user5._id, user1._id);

  const inviteResponse = await groups.inviteResponse(test_create._id, user5._id, true);

  const addAdmin = await groups.addAdmin(test_create._id, user5._id, user1._id);

  const deleteAdmin = await groups.deleteAdmin(test_create._id, user5._id, user1._id);

  console.log('Done seeding database');

  //await db.serverConfig.close();
}

main();