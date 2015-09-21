var express = require('express');
var fortune = require('./lib/fortune.js');
var handlebars = require('express3-handlebars').create({
	defaultLayout: 'main',
	helpers: {
		section: function(name, options) {
			if (!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});
var app = express();
var formidable = require('formidable'),
	jqupload = require('jquery-file-upload-middleware');
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);
app.disable('x-powered-by');
app.use(express.static(__dirname + '/public'));

app.use(function(req, res, next) {
	res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
	// console.error(req.query.toString() + res.locals.showTests);
	next();
});

// mocked weather data
function getWeatherData() {
	return {
		locations: [{
			name: 'Portland',
			forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
			iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
			weather: 'Overcast',
			temp: '54.1 F (12.3 C)',
		}, {
			name: 'Bend',
			forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
			iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
			weather: 'Partly Cloudy',
			temp: '55.0 F (12.8 C)',
		}, {
			name: 'Manzanita',
			forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
			iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
			weather: 'Light Rain',
			temp: '55.0 F (12.8 C)',
		}, ],
	};
}

// middleware to add weather data to context
app.use(function(req, res, next) {
	if (!res.locals.partials) res.locals.partials = {};
	res.locals.partials.weather = getWeatherData();
	next();
});

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
// app.use(
// 	function(req, res, next) {
// 		res.locals = {
// 			currency: {
// 				name: "united stateds dollars",
// 				abbrev: "USD",
// 			},
// 			tous: [{
// 				name: "hood river",
// 				price: '$99.95}'
// 			}, {
// 				name: 'Oregon cost',
// 				price: '$159.95'
// 			}, ],
// 			specialsUrl: '/january-specials',
// 			currencies: ['USD', 'GBP', 'BTC']
// 		};
// 		next();
// 	});

app.get('/', function(req, res) {
	res.render('home');
});

app.use('/upload',function(req,res,next){
	var now = Date.now();
	jqupload.fileHandler({
		uploadDir:function(){
			return __dirname + '/public/uploads/' + now;
		},
		uploadUrl:function(){
			return '/uploads/'+ now;
		}
	})(req,res,next);
});

app.get('/headers', function(req, res) {
	res.set('Content-Type', 'text/plain');
	var s = '';
	// for (var name in req.headers) s+=name+': ' + req.headers[name] + '\n';
	// 	res.send(s);
	console.log(req.ip);
	//res.json({name:"wujian",height:175});
	//res.redirect(303,'/about');
	res.attachment('http://www.tu123.cn/uploads/allimg/1304/02/1364Y495cR40-135J0.jpg');
});

app.get('/about', function(err, res) {
	res.render('about', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
});

app.get('/foo', function(req, res) {
	res.render('foo', {
		layout: 'microsite'
	});
});

app.get('/jquerytest', function(err, res) {
	res.render('jquerytest', {
		fortune: fortune.getFortune(),
		pageTestScript: '/qa/tests-about.js'
	});
});

app.get('/test', function(err, res) {
	res.render('test', {
		currency: {
			name: "united stateds dollars",
			abbrev: "USD",
		},
		tours: [{
			name: "hood river",
			price: '$99.95'
		}, {
			name: 'Oregon cost',
			price: '$159.95'
		}, ],
		specialsUrl: '/january-specials',
		currencies: ['USD', 'GBP', 'BTC']
	});
});

app.get('/nursery-rhyme', function(req, res) {
	res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', function(req, res) {
	res.json({
		animal: 'squirrel',
		hodyPart: 'tail',
		adjective: 'bushy',
		noun: 'heck',
	});
});

app.get('/newsletter', function(req, res) {
	res.render('newsletter', {
		_csrf: '3882838838383'
	});
});

app.get('/thank-you', function(req, res) {
	res.render('thank-you');
});

app.post('/process', function(req, res) {
	console.log('form(from querystring): ', req.query.form);
	console.log('CSRF token(from hidden form field):', req.body._csrf);
	console.log('Name (from visible form field):', req.body.name);
	console.log('Email (from visible form field):', req.body.email);
	//res.json({success:true});
	//res.redirect(303, 'thank-you' );
	//console.log(req.xhr);
	if (req.xhr || req.accepts('json,html') === 'json') {
		res.json({
			success: true
		});
	} else {
		res.redirect(303, '/thank-you');
	}
});

app.get('/contest/vacation-photo', function(req, res) {
	var now = new Date();
	res.render('contest/vacation-photo', {
		year: now.getFullYear(),
		month: now.getMonth()
	});
});
app.post('/contest/vacation-photo/:year/:month', function(req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {
		if (err) return res.redirect(303, '/error');
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303, '/thank-you');
	});
});

var autoViews = {};
var fs = require('fs');
app.use(function(req,res,next){
	var path = req.path.toLowerCase();
	if(autoViews[path]) return res.render(autoViews[path]);
	if(fs.existsSync(__dirname + '/views' + path+'.handlebars')){
		autoViews[path] = path.replace(/^\//,'');
	}
	next();
});

app.use(function(req, res, next) {
	res.status(404);
	res.render('404');
});



app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

app.listen(app.get('port'), function() {
	console.log('Express started on http://localhost:' +
		app.get('port') + ';press Ctrl-C to terminate.');
});