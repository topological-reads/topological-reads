const dbConnection = require('../config/mongoConnection');
const data = require('../data/');
const books = data.books;
const authors = data.authors;

async function main() {
  const db = await dbConnection();
  await db.dropDatabase();

  console.log("Making book 1")
  const book1 = await books.create("The Shining",{authorFirstName: "Stephen", authorLastName: "King"},["Novel", "Horror fiction", "Gothic fiction", "Psychological horror", "Occult Fiction"], "1/28/1977", "Jack Torrance’s new job at the Overlook Hotel is the perfect chance for a fresh start. As the off-season caretaker at the atmospheric old hotel, he’ll have plenty of time to spend reconnecting with his family and working on his writing. But as the harsh winter weather sets in, the idyllic location feels ever more remote . . . and more sinister. And the only one to notice the strange and terrible forces gathering around the Overlook is Danny Torrance, a uniquely gifted five-year-old..")
  const id = book1._id.toString();
  console.log(book1);
  console.log("Making book 2")
  const book2 = await books.create("The Great Gatsby",{authorFirstName: "F Scott", authorLastName: "Fitzgerald"},["Novel","Fiction"], "1/1/1920","A green light, and a man holding parties... but why?")
  const id2 = book2._id.toString();
  console.log(book2);
  
  console.log("Making author 1")
  const author1 = await authors.create("F. Scott Fitzgerald")
  const id3 = author1._id.toString();
  console.log(author1);
  console.log("Making author 2")
  const author2 = await authors.create("J.D. Salinger")
  const id4 = author2._id.toString();
  console.log(author2);
/*
  console.log("books: getAll()")
  const book_get = await books.getAll();
  console.log(book_get);

  console.log("books: getAll(id)")
  const book_getOne = await books.get(id);
  console.log(book_getOne);

  console.log("books: update");
  const book_update = await books.update(id, {
    "title": "The Shining UPDATED",
    "author": {authorFirstName: "Patrick", authorLastName: "Hill"},
    "genre": ["Novel", "Horror fiction", "Gothic fiction", "Psychological horror", "Occult Fiction"],
    "datePublished": "1/28/1977",
    "summary": "Jack Torrance’s new job at the Overlook Hotel is the perfect chance for a fresh start. As the off-season caretaker at the atmospheric old hotel, he’ll have plenty of time to spend reconnecting with his family and working on his writing. But as the harsh winter weather sets in, the idyllic location feels ever more remote . . . and more sinister. And the only one to notice the strange and terrible forces gathering around the Overlook is Danny Torrance, a uniquely gifted five-year-old.."});
  console.log(book_update);
  
  console.log("Create review a");
  let a = await reviews.create("This book scared me to death!!","scaredycat",id,5,"10/7/2020","This book was creepy!!! It had me at the edge of my seat.  One of Stephan King's best work!");
  console.log(a);
  console.log("Create review b");
  let b = await reviews.create("This was not scary at all :(","mememaster",id,1,"10/8/2020","Not scary at all, super overrated book");
  console.log(b);

  console.log("books: remove");
  const book_rem = await books.remove(id);
  console.log(book_rem);
  //console.log(await reviews.getAll(id));

  console.log("Create c");
  let c = await reviews.create("This book was so funny!","scaredycat",id2,5,"10/7/2020","The best book I ever read, highly recommend this. Way better than the movie.");
  console.log(c);

  console.log("Create d");
  let d = await reviews.create("Boring","mememaster",id2,1,"10/8/2020", "Not one of my favorites");
  let e = await reviews.create("Boring","mememaster",id2,1,"10/8/2020", "Not one of my favorites");
  console.log(e);

  console.log("Getter");
  let getter = await reviews.get(id2,c._id);
  console.log(getter);
  
  console.log("getAll")
  let getAll = await reviews.getAll(id2);
  console.log(getAll);
  //console.log(a);
  //console.log(c);
  //console.log(getter);
  console.log("Review remove")
  let remover = await reviews.remove(id2,c._id);
  console.log(remover);
  console.log(await books.get(id2));
  */
  console.log('Done seeding database');
  await db.serverConfig.close();
}

main();