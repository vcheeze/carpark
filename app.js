//Set up requirements
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var Request = require('request');
var _=require('underscore');

//Create an 'express' object
var app = express();

//Some Middleware - log requests to the terminal console
app.use(logger('dev'));

//Set up the views directory
app.set("views", __dirname + '/views');
//Set EJS as templating language WITH html as an extension
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
//Add connection to the public folder for css & js files
app.use(express.static(__dirname + '/public'));
// Enable json body parsing of application/json
app.use(bodyParser.json());


/*================== ROUTES ==================*/
// CORS enable routes
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});


// Landing page route
app.get("/", function(req, res) {
	res.render("index");
});


// Documentation route
app.get("/about", function(req, res) {
	res.render("about");
});


app.get("/api", function(req,res) {
	console.log('Making a DB request for all entries');
});


//SAVE an object to the db
app.post("/save", function(req,res) {
	console.log("A POST!!!");
	//Get the data from the body: the body is the data that is sent from the client to the server
	// var data = req.body;
	// console.log(data);
	// //Send the data to the db
	// var carsRef = ref.child("cars");
	// carsRef.set(data);
});


// Everything else
app.get("*", function(req, res) {
	res.send("This ain't workin' man. Check the URL and try again.");
});
/*============================================*/

// Start the server
app.listen(3000);
console.log('Express started on port 3000');