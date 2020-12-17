const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const usersData = require('../data/users');


function isNonEmptyString (element) {
    if (typeof element == 'string') {
        return element.trim().length > 0;
    }
    return false;
}

router.post('/', async (req, res) => {
    req.body.username = req.body.username.toLowerCase();
    if(!isNonEmptyString(req.body.username) || !isNonEmptyString(req.body.password)){
        return res.status(404).render('../views/login', {errorMessage :'You need to submit usernames and passwords as strings that are not empty.'});
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
        return res.redirect('/home');
	} else {
        return res.status(401).render('../views/login', {errorMessage :'User or Password are invalid.'});
	}    
  });

  router.post('/signup', async (req, res) => {
    req.body.username = req.body.username.toLowerCase();
    if(!isNonEmptyString(req.body.username) || !isNonEmptyString(req.body.password || !isNonEmptyString(req.body.email) || !isNonEmptyString(req.body.confirmPassword))){
        return res.status(404).render('../views/login', {errorMessage :'You need to submit inputs as strings that are not empty.'});
    }
    if(req.body.password !== req.body.confirmPassword){
        return res.status(404).render('../views/login', {errorMessage :'Passwords do not match.'});
    }

    let userObject;

    try{
        new_user = await usersData.create(req.body.username,req.body.email, [],[],[],[],[],[],req.body.password,[]);
        userObject = await usersData.getByName(req.body.username);
        req.session.user = userObject
        return res.redirect('/home');
    } catch {
        return res.status(401).render('../views/login', {errorMessage :'Unable to make account'})
    }  
  });
module.exports = router;
