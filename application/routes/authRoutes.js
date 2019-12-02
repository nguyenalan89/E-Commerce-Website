const express = require ('express');
const authRouter = express.Router();
const db = require('../model/db.js');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { validationResult } = require('express-validator')
const { validateReg } = require('../model/validator.js');

// parser to parse request body form-data
let parser = bodyparser.urlencoded({extended: false});

authRouter.use(parser);

// get login page
authRouter.get('/login', (req, res) => {
    res.render("login", {page: 'login'});
});

// post to login page, use passport middleware for authentication
authRouter.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/dashboard/',
		failureRedirect: '/auth/login',
		failureFlash: false,
	}) (req, res, next);
});

// logout, redirect to homepage
authRouter.get('/logout', (req, res) => {
	req.logout();
	res.redirect('/');
});

// get register page
authRouter.get('/register', (req, res) => {
    res.render("register", {page: 'register'});
});

// post to register page
authRouter.post('/register', validateReg() ,parser, (req, res) => {

	console.log("post to register page!");

	// render register page again but with errors
	const err = validationResult(req).array({ onlyFirstError: true });
	
	if (err.length !== 0) {
		res.render("register", {
			page: "register",
		  	err: err,
		 	body: req.body,
		});
		return;
	  }
	
	const {name,email,password,password2,phone,terms} = req.body;
	console.log(name + ' ' + email + ' ' + password + ' ' + password2 + ' ' + phone + ' ' + terms );

	const hash = bcrypt.hashSync(password, 10); // hash password

	let data = {
		name: name,
		password: hash,
		email: email,
		phone: phone,
		role: 'user',
	};

	db.query("INSERT INTO user SET ?", data, (err, result) => {
		if (err) {
			console.log(err);
			res.redirect('auth/register');
		} else {
			console.log("user id: " + result.insertId);
			res.redirect('/auth/login');
		}
	})

});

module.exports = authRouter;