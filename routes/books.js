const e = require('express');
const express = require('express'); // Use for testing
const router = express.Router();
const data = require('../data');
const booksData = data.books;
const userData = data.users;
const listsData = data.lists;

router.get('/', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticated to view this information.'});
  }

  try {
    let book = await booksData.getAll();
    let lists = await listsData.getAll();

    console.log(lists)
    
    for (elem of book) {
      for(pair of elem.ratings) {
        pair[0] = (await userData.get(pair[0])).name
      }
    }

    res.render("../views/books", {body : book, lists : lists})

  } catch (e) {
    console.log(e);
    res.status(404).json({ error: e });
  }
});

router.post('/', async (req, res) => {;
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticate to view this information.'});
  }

  try {
    let searchTerm = req.body.searchTerm;
    if(!searchTerm) {
      let book = await booksData.getAll();

      for (elem of book) {
        for(pair of elem.ratings) {
          pair[0] = (await userData.get(pair[0])).name
        }
      }

      res.render("../views/books", {body: book, errorMessage: "You must enter a search term!"})
    } else {
      let bookList = await booksData.search(searchTerm.trim())
      res.render("../views/books", {body: bookList})
    }

  } catch (e){
    console.log(e);
    res.status(404).json({ error: e });
  }
  // let book = req.body;
  // if(!book){
  //   res.status(400).json({ error: 'You must provide a book' });
  //   return;
  // }
  // if (!book.title) {
  //   res.status(400).json({ error: 'You must provide a title' });
  //   return;
  // }
  // if (!book.isbn) {
  //   res.status(400).json({ error: 'You must provide an isbn' });
  //   return;
  // }
  // if (!book.authors) {
  //   res.status(400).json({ error: 'You must provide author(s)'});
  //   return;
  // }
  
  // if(Object.keys(book).length !== 3){
  //   res.status(400).json({ error: 'Too many inputs' });
  //   return;
  // }
  // try {
  //   const newbook = await booksData.create(book.title,book.ibsn,book.authors);
  //   res.json(newbook);
  // } catch (e) {
  //     res.status(400).json({ error: e });
  // }
});

// router.get('/:id', async (req, res) => {
//   if (!req.params.id) {
//     res.status(400).json({ error: 'You must Supply an ID' });
//     return;
//   }
//   try {
//     let book = await booksData.get(req.params.id);
//     res.json(book);
//   } catch (e) {
//     console.log(e)
//     res.status(404).json({ error: 'book not found' });
//   }
// });

// router.put('/:id', async (req, res) => {
//   if (!req.params.id) {
//     res.status(400).json({ error: 'You must Supply an ID' });
//     return;
//   }
//   const updatedData = req.body;
//   if (!updatedData.title || !updatedData.author|| !updatedData.genre || !updatedData.datePublished || !updatedData.summary) {
//     res.status(400).json({ error: 'You must supply all fields' });
//     return;
//   }
//   try {
//     await booksData.get(req.params.id);
//   } catch (e) {
//     res.status(404).json({ error: 'book not found' });
//     return;
//   }

//   try {
//     const updatedPost = await booksData.update(req.params.id, updatedData);
//     res.json(updatedPost);
//   } catch (e) {
//     res.status(400).json({ error: e });
//   }
// });

// router.patch('/:id', async (req, res) => {
//   const requestBody = req.body;
//   let updatedObject = {};
//   if(!req.params.id){
//     res.status(400).json({ error: 'You must supply an id' });
//     return; 
//   }
//   if(!requestBody.title && !requestBody.author && !requestBody.genre && !requestBody.summary && !requestBody.datePublished){
//     res.status(400).json({ error: 'You must supply at least one field' });
//     return; 
//   }
//   try {
//     const oldPost = await booksData.get(req.params.id);
//     if (requestBody.title){
//       if(requestBody.title !== oldPost.title){
//         updatedObject.title = requestBody.title;
//       }
//       else{
//         updatedObject.title = oldPost.title;
//       }
//     }
//     if (requestBody.genre){
//       if(requestBody.genre !== oldPost.genre){
//         updatedObject.genre = requestBody.genre;
//       }
//       else{
//         updatedObject.genre = oldPost.genre;
//       }
//     }
//     if (requestBody.author){
//       if(requestBody.author !== oldPost.author){
//         updatedObject.author = requestBody.author;
//       }
//       else{
//         updatedObject.author = oldPost.author;
//       }
//     }
//     if (requestBody.datePublished){
//       if(requestBody.datePublished !== oldPost.datePublished){
//         updatedObject.datePublished = requestBody.datePublished;
//       }
//       else{
//         updatedObject.datePublished = oldPost.datePublished;
//       }
//     }
//     if (requestBody.summary){
//       if(requestBody.summary !== oldPost.summary){
//         updatedObject.summary = requestBody.summary;
//       }
//       else{
//         updatedObject.summary = oldPost.summary;
//       }
//     }
//     updatedObject.reviews = oldPost.review;
//     updatedObject._id = oldPost._id;
      
//   } catch (e) {
//     res.status(404).json({ error: 'Book not found' });
//     return;
//   }
//   if (Object.keys(updatedObject).length !== 0) {
//     try {
//       const updatedPost = await booksData.update(
//         req.params.id,
//         updatedObject
//       );
//       res.json(updatedPost);
//     } catch (e) {
//       res.status(400).json({ error: e });
//     }
//   } else {
//     res.status(400).json({
//         error: 'No fields have been changed from their initial values, so no update has occurred'
//       });
//   }
// });

// router.delete('/:id', async (req, res) => {
//   if (!req.params.id) {
//     res.status(400).json({ error: 'You must supply ID to delete' });
//     return;
//   }
  
//   try {
//     await booksData.get(req.params.id);
//   } catch (e) {
//     res.status(404).json({ error: 'Book not found' });
//     return;
//   }
//   try {
//     const book1 = await booksData.remove(req.params.id);;
//     res.json(book1);
//   } catch (e) {
//     res.status(400).json({ error: e });
//   }
// });

module.exports = router;
