const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.session.user){
    return res.status(404).render('../views/error', {errorMessage :'You are not authenticate to view this information.'});
  }

  return res.render('../views/private', {user : req.session.user});
});

module.exports = router;
