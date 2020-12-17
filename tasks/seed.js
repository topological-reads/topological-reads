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
  
  // console.log("Making author 1")
  const author1 = await authors.create("F. Scott Fitzgerald")
  const author1_id1 = author1._id;
  // console.log(author1);
  // console.log("Making author 2")
  const author2 = await authors.create("J.D. Salinger")
  const author2_id = author2._id;
  // console.log(author2);

  // console.log("Making book 1")
  const book1 = await books.create("The Shining", "1111111111111", "F. Scott Fitzgerald", 
    1.5, [], "A book")
  const book1_id = book1._id;
  // console.log(book1);

  // console.log("Making user 1")
  const user1 = await users.create("Nicole","nicole.crockett79@gmail.com",[book1_id], [],
    [], [], [], [], "password", [])
  const user1_id = user1._id
  console.log(user1);

  const user5 = await users.create(`Chris`, `example@gmail.com`, [book1_id], [],
    [], [], [], [], `password`, []);
    console.log(`User 2: Chris -> `, user5);

  console.log("Making user 2")
  const user2 = await users.create("test","test@test.com",[book1_id], [],
    [], [], [], [], "test", [])

  console.log("Making user 3")
  const user3 = await users.create("test2","test2@test.com",[book1_id], [],
    [], [], [], [], "test", [])

  console.log("Making user 4")
  const user4 = await users.create("test3","test3@test.com",[book1_id], [],
    [], [], [], [], "test", [])

  const user_getAll = await users.getAll();
  // console.log(user_getAll);


  // console.log("Making book 2")
  const book2 = await books.create("The Great Gatsby","1111111111112", "J.D. Salinger", 
    4.76, [[user1_id, 5]], "A great book")
  // console.log(book2);
  const book2_id = book2._id

  // console.log("Making tag 1")
  const tag1 = await tags.create("Spoopy")
  let tag1_id = tag1._id;
  // console.log(tag1);

  // console.log("Making tag 2")
  const tag2 = await tags.create("Scary")
  let tag2_id = tag2._id;
  // console.log(tag2);

  // console.log("Making list 1")
  //const list1 = await lists.create("Our first list!", [book1_id, book2_id], [[book1_id, book2_id]], [user1_id], [tag1_id, tag2_id])
  // console.log(list1);

  //await users.addList(user1_id, list1._id)

  // console.log("books: getAll()")
  const book_get = await books.getAll();
  // console.log(book_get);

  // console.log("books: get(id)")
  const book_getOne = await books.get(book1_id);
  // console.log(book_getOne);

  // console.log("books: update");

  for(obj of bookData) {
    await books.create(obj.title, (obj.isbn !== "" ? obj.isbn : "N/A"), 
      (obj.author ? obj.author : "N/A"), Number(obj.averageRating), [], obj.description)
    
  }
  // console.log(`Create a group!:`)
  const group_create = await groups.create(`Horror Movie Fanatics`, user1_id, false, [`Spoopy`]);
  const test_create = await groups.create(`Test Run`, user1_id, true, [`Scary, Spooky`]);
  // console.log(`Horror Movie Fanatics:`, group_create);
  // console.log(`Test Group:`, test_create);

  // console.log(`Read Test Group:`);
  const read_test = await groups.read(test_create._id);
  // console.log(`Test Group Read:`, read_test)

  // console.log('Adjust group to add invitee:')
  let updatedGroup = read_test;
  updatedGroup.invitees = [new ObjectID()];
  const update_test = await groups.update(read_test._id, updatedGroup);
  // console.log(`Updated Test:`, update_test);

  // console.log(`Adjust the new forum:`);
  // console.log(`read read_test._id: ${read_test._id}`);
  const test_forum = await forums.read(read_test.forum);
  // console.log(`Test!: `, test_forum);
  const update_forum = await forums.update(test_forum._id, {group: test_forum.group, threads: []});
  // console.log(`Updated Forum: `, update_forum)

  const inserted_thread = await threads.create(update_forum._id, user1_id, `The Shining was so scary to me!`);
  // console.log(`Create a thread for test forum:`, inserted_thread);

  const deleted_thread = await threads.delete(inserted_thread._id);
  console.log(`Deleting Test Thread:`, deleted_thread);
  // const deleted_group = await groups.delete(update_forum.group);
  // console.log(`Test Forum deleted: `, deleted_group);

  const allPublic = await groups.getAllPublic();
  console.log(`Get All Public Groups: `, allPublic);

  const readPublicData = await groups.addPublicMember(group_create._id, new ObjectID());
  console.log(`Add a public member: `, readPublicData);

  const inviteMember = await groups.invitePrivateMember(update_test._id, user5._id, user1._id);
  console.log(`Invite Chris to Private Test Group: `, inviteMember);

  const inviteResponse = await groups.inviteResponse(update_test._id, user5._id, true);
  console.log(`Chris accepts the invite: `, inviteResponse);

  const addAdmin = await groups.addAdmin(update_test._id, user5._id, user1._id);
  console.log(`Chris becomes an Admin: `, addAdmin);

  const deleteAdmin = await groups.deleteAdmin(update_test._id, user5._id, user1._id);
  console.log(`Chris shouldn't be an admin!:`, deleteAdmin);

  // const deleteMember = await groups.deleteMember(update_test._id, user5._id, user1._id);
  // console.log(`You know... Chris shouldn't even be a member!... :( :`, deleteMember);

  console.log('Done seeding database');

  //await db.serverConfig.close();
}

main();