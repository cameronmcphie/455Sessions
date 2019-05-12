'use strict'

// Import express
const  express = require('express');

// Import client sessions
const sessions = require('client-sessions');

// The body parser
const bodyParser = require("body-parser");

// Import mysql2
const mysql = require('mysql2/promise');
// Needed mysql2 Promise Wrapper  
//const bluebird = require('bluebird');

// Instantiate an express app
var app = express();

// Set the view engine
app.set('view engine', 'ejs');


// A list of authorized users
var authorizedUsers = [['mikhail', 'helloworld'], ["hernan", "1234567890"], ["KittyKat", "gimmetuna"], ["admin", "test"]];  

/**
// Add middleware for handling sessions
app.use(sessions({
  
  // The cookie name
  cookieName: 'mySession',
  
  // The secret key that will be used for deriving
  // cryptographic keys for encrypting and digitally
  // signing the cookie
  secret: '0GBlJZ9EKBt2Zbi2flRPvztczCewBxXK',
  
  // How long the session will stay valid in ms
  duration: 24 * 60 * 60 * 1000,   

  // If expiresIn < activeDuration, the session will be extended by active
  activeDuration: 1000 * 60 * 5 
}));
**/

// Needed to parse the request body
// Note that in version 4 of express, express.bodyParser() was
// deprecated in favor of a separate 'body-parser' module.
app.use(bodyParser.urlencoded({ extended: true })); 

// The session settings middleware	
app.use(sessions({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

// create database Sessions; Run first in mysql
// const connection = mysql.createConnection({
	// host: 'localhost',
	// user: 'root',
	// database: 'Sessions'
// });

// From https://medium.com/dailyjs/how-to-prevent-your-node-js-process-from-crashing-5d40247b8ab2
// For taking care of unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
	console.log('Unhandled Rejection at:', reason.stack || reason)
  })

async function a() {
	const connection = await mysql.createConnection({
		host: 'localhost',
		user: 'root',
		database: 'Sessions'});
	
	await connection.execute('DROP TABLE IF EXISTS Users');
	await connection.execute('DROP TABLE IF EXISTS Journal');
	await connection.execute('CREATE TABLE IF NOT EXISTS Users' +
			'(user_id INT AUTO_INCREMENT,'+
			'username VARCHAR(255) NOT NULL,'+
			'password VARCHAR(255) NOT NULL,'+
			'PRIMARY KEY (user_id));');
	await connection.execute('CREATE TABLE IF NOT EXISTS Journal' +
		'(journal_id INT NOT NULL,' +
		'content VARCHAR(255) NOT NULL,' +
		'users_user_id INT NOT NULL,' +
		'PRIMARY KEY (journal_id));');

	for (let i = 0; i < authorizedUsers.length; i++) {
	await connection.execute('INSERT INTO Users (username,password) VALUES (?,?)',
	[authorizedUsers[i][0], authorizedUsers[i][1]]);
}
} 
a();

// The default page
// @param req - the request
// @param res - the response
app.get("/", function(req, res){
	
	// Is this user logged in?
	if(req.session.username)
	{
		// Yes!
		res.redirect('/dashboard');
	}
	else
	{
		// No!
		res.render('loginpage');
	}

});

// The login page
// @param req - the request
// @param res - the response
app.get('/dashboard', function(req, res){
	
	// Is this user logged in? Then show the dashboard
	if(req.session.username)
	{
		res.render('dashboard', {username: req.session.username});
	}
	//Not logged in! Redirect to the mainpage
	else
	{
		res.redirect('/');
	}

});

// The login script
// @param req - the request
// @param res - the response
app.post('/login', function(req, res){
	
	// Get the username and password data from the form
	var userName = req.body.username;
	var password = req.body.password;
	
	// The correct password
	var correctPass = undefined;
	
	// Is this a valid user?
	// for(let index = 0; index < authorizedUsers.length; index++)	
	// {
		
	// 	// A valid user?
	// 	if(authorizedUsers[index][0] === userName)
	// 	{
	// 		// The user is found! Grab the password!
	// 		correctPass = authorizedUsers[index][1];
	// 		console.log("Got it!");
	// 		break;
	// 	}
	// }

	// connection.execute('select * from Users where username=?',
	// [userName],
	// function(err, results, fields) {
	// 	// console.log(err);
	// 	// console.log(results[0]['username']);

	// 	if(results[0]['username'] === userName) {
	// 		correctPass = results[0]['username'];
	// 		console.log("Got it!");

	// 	}
	// 	else {
	// 		res.send("Wrong!");
	// 	}
		
	// });

	async function a() {
		const connection = await mysql.createConnection({
			host: 'localhost',
			user: 'root',
			database: 'Sessions'});
		var [row, fields] = await connection.execute('select * from Users where username=?', [userName]);
		if (row.username === undefined) {
			res.send("Wrong!")
		}
		else if(row[0]['username'] === userName) {
			correctPass = row[0]['username'];
			console.log("Got it!");
		}
		else {
			res.send("Wrong!");
		}
	}
	a();
	
	// Check if the username was found and the password is correct
	if(correctPass && correctPass === password)
	{
		// Set the session
		req.session.username = userName;

		res.redirect('/dashboard');
	}
	else
	{
		//res.send("Wrong!");
	}
});


// The logout function
// @param req - the request
// @param res - the response
app.get('/logout', function(req, res){

	// Kill the session
	req.session.reset();
	
	res.redirect('/');
});

app.listen(3000);


