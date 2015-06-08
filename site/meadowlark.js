var express = require("express");

var app = express();

var fortune = require('./lib/fortune.js');

// set up handlebars view engine
var handlebars = require("express3-handlebars").create({ defaultLayout: "main" });
app.engine('handlebars', handlebars.engine);
app.set("view engine", 'handlebars');

app.set("port", process.env.PORT || 4000);

// serve static contents
app.use(express.static(__dirname + "/public"));

// configure page testing query param
app.use(function(req, res, next){
  res.locals.showTests = app.get("env") !== "production" && req.query.test === '1';
  next();
});

app.get("/", function(req, res){
  res.render("home");
});

app.get('/about', function(req, res){
  res.render("about", { fortune: fortune.getFortune(), pageTestScript: '/qa/tests-about.js' });
});

app.get("/tours/hood-river", function(req, res){
  res.render('tours/hood-river');
});

app.get("/tours/oregon-coast", function(req, res){
  res.render('tours/oregon-coast');
});

app.get("/tours/request-group-rate", function(req, res){
  res.render('tours/request-group-rate');
});

// custom 404 page
app.use(function(req, res){
  res.status(404);
  res.render("404");
});


// custom 500 page
app.use(function(err, req, res, next){
  console.log(err.stack);
  res.status(500);
  res.render("500");
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost: ' + app.get('port') + '; press ctrl-c to quit');
});