const booksRoutes = require('./books'); 

const constructorMethod = (app) => {
  app.use('/books', booksRoutes);
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

module.exports = constructorMethod;