const booksRoutes = require('./books'); 
const authorsRoutes = require('./authors'); 

const constructorMethod = (app) => {
  app.use('/books', booksRoutes);
  app.use('/authors', authorsRoutes);
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

module.exports = constructorMethod;