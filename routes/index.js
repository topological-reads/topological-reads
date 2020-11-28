const booksRoutes = require('./books'); 
const authorsRoutes = require('./authors'); 
const forumsRoutes = require('./forums'); 
const groupsRoutes = require('./groups'); 
const listsRoutes = require('./lists'); 
const tagsRoutes = require('./tags'); 
const threadsRoutes = require('./threads'); 
const usersRoutes = require('./users'); 

const constructorMethod = (app) => {
  app.use('/books', booksRoutes);
  app.use('/authors', authorsRoutes);
  //app.use('/forums', forumsRoutes);
  //app.use('/groups', groupsRoutes);
  //app.use('/lists', listsRoutes);
  app.use('/tags', tagsRoutes);
  //app.use('/threads', threadsRoutes);
  app.use('/users', usersRoutes);
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

module.exports = constructorMethod;