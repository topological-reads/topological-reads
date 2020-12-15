const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const usersData = require('../data/users');
//const usersData = data.users;

const usersList = require('../users');

function isNonEmptyString (element) {
    if (typeof element == 'string') {
        return element.trim().length > 0;
    }
    return false;
}

router.post('/', async (req, res) => {
    
    console.log(req.body.username, req.body.password)
    if(!isNonEmptyString(req.body.username) || !isNonEmptyString(req.body.password)){
        return res.status(404).render('../views/error', {errorMessage :'You need to sumbit usernames and passwords as strings that are not empty.'});
    }
    
    const { username, password } = req.body;
    let userObject;

    try{
        userObject = await usersData.getByName(req.body.username)
    } catch {
        return res.status(401).render('../views/login', {errorMessage :'User or Password are invalid.'})
    }
    
    let match = await bcrypt.compare(password, userObject.password);

    if (match) {
        userObject.password
        req.session.user = userObject
        return res.redirect('/private');
	} else {
        return res.status(401).render('../views/login', {errorMessage :'User or Password are invalid.'});
	}    
  });

module.exports = router;
