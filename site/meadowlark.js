var express = require("express");

var app = express();

var fortune = require('./lib/fortune.js');

// set up handlebars view engine
var handlebars = require("express3-handlebars").create(
  {
    defaultLayout: "main",
    helpers: {
      section: function(name, options){
        if(!this._sections) this._sections = {};
          this._sections[name] = options.fn(this);
          return null;
        }
      }
  }
);
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

// weather datas
function getWeatherData(){
  return {
    locations:
      [
        {
          name: 'Portland',
          forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
          iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
          weather: 'Overcast',
          temp: '54.1 F (12.3 C)',
        },
        {
          name: 'Bend',
          forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
          iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
          weather: 'Partly Cloudy',
          temp: '55.0 F (12.8 C)',
        },
        {
          name: 'Manzanita',
          forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
          iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
          weather: 'Light Rain',
          temp: '55.0 F (12.8 C)',
        },
      ],
    };
}

// add a middleware to inject this data into the res.locals.partials
app.use(function(req, res, next){
  if(!res.locals.partials) res.locals.partials = {}
  res.locals.partials.weather = getWeatherData();
  next();
});

// app.get("/headers", function(req, res){
//   res.set("Content-Type", "text/plain");
//   var s = '';
//   for(var name in req.headers) {
//     s+= name + ": " + req.headers[name] + "\n";
//   }
//   res.send(s);
// });

app.get("/", function(req, res){
  res.render("home");
});

app.get('/about', function(req, res){
  res.render("about", { fortune: fortune.getFortune(), pageTestScript: '/qa/tests-about.js' });
});

app.get("/jquery-test", function(req, res){
  res.render('jquery-test');
});

app.get("/nursery", function(req, res){
  res.render('nursery-rhymes');
});

app.get('/data/nursery-rhyme', function(req, res){
  res.json({
    animal: 'squirrel',
    bodyPart: 'tail',
    adjective: 'bushy',
    noun: 'heck',
  });
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