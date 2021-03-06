var express = require("express");

var app = express();

var fortune = require('./lib/fortune.js');

app.use(require('body-parser')());

var formidable = require('formidable');

var credentials = require('./credentials.js');

var nodemailer = require('nodemailer');
var mailTransport = nodemailer.createTransport('SMTP', {
  service: 'Gmail',
  auth: {
    user: credentials.gmail.user,
    pass: credentials.gmail.password
   }
});

// mailtransport demo
mailTransport.sendMail(
  {
    from: '"Meadowlark Travel"<info@meadowlarktravel.com>',
    to: 'romano.lucas@gmail.com',
    subject: 'Your Meadowlark Travel Tour',
    text: 'Thank you for booking your trip with Meadowlark Travel!'
  },function(err){
    if(err){
      console.log('Unable to send email: ' + err);
    }
  }
);

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

// FUNCTIONS

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
//-------------------------

// serve static contents
app.use(express.static(__dirname + "/public"));

// cookie handling
app.use(require('cookie-parser')(credentials.cookieSecret))

// sessions (memory)
app.use(require('express-session')());

app.use(function(req, res, next){
  res.cookie("normal_sample", 'Hello you!');
  res.cookie("signed_sample", 'Hello world!', { signed: true});
  req.session.userName = "Lucas";
  next();
});

// MIDDLEWARES
// configure page testing query param
app.use(function(req, res, next){
  res.locals.showTests = app.get("env") !== "production" && req.query.test === '1';
  next();
});

// add a middleware to inject this data into the res.locals.partials
app.use(function(req, res, next){
  if(!res.locals.partials) res.locals.partials = {}
  res.locals.partials.weather = getWeatherData();
  next();
});

// manage flash messages
app.use(function(req, res, next){
  // if there's a flash message, transfer
  // it to the context, then clear it
  res.locals.flash = req.session.flash;
  delete req.session.flash;
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

// Some middleware samples
// app.use(function(req, res, next){
//   console.log("processing request for ", req.url, " ....");
//   next();
// });

// app.use(function(req, res, next){
//   console.log("terminating request...");
//   res.send("thanks for playing");
// });

// app.use(function(req, res, next){
//   console.log('whoops, i\'ll never get called!');
// });

app.get("/", function(req, res){
  res.render("home");
});

app.get('/newsletter', function(req, res){
  res.render("newsletter", { csrf: 'CSRF token goes here' });
});

app.get('/about', function(req, res){
  console.log("signed cookie is ", req.signedCookies.signed_sample);
  console.log("classic cookie is ", req.cookies.normal_sample);
  res.render("about", { fortune: fortune.getFortune(), pageTestScript: '/qa/tests-about.js' });
});

app.get('/thank-you', function(req, res){
  res.render("thank-you");
});

app.post('/process', function(req, res){
  console.log('Form (from querystring): ', req.query.form);
  console.log('CSRF token (from hidden form field): ', req.body._csrf);
  console.log('Name (from visible form field): ', req.body.name);
  console.log('Email (from visible form field): ', req.body.email);

  if(req.xhr || req.accepts('html, json') === 'json'){
    res.json({ success: true });
  }
  else{
    res.redirect(303, "/thank-you");
  }

});

app.get('/contest/vacation-photo', function(req, res){
  var now = new Date();
  res.render('contest/vacation-photo', { year: now.getFullYear(), month: now.getMonth()});
})

app.post('/contest/vacation-photo/:year/:month', function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files){
    if(err) return res.redirect(303, '/error');
    console.log('received fields:');
    console.log(fields);
    console.log('received files:');
    console.log(files);
    res.redirect(303, '/thank-you');
    });
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