const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  //res.clearCookie('AuthCookie');
  req.session.destroy();
  return res.redirect('/');
});

module.exports = router;
