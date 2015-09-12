var express = require('express');
var fortune = require('./lib/fortune.js');
var handlebars = require('express3-handlebars').create({
	defaultLayout: 'main'
});
var app = express();
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

app.get('/', function(req, res) {
	res.render('home');
});

app.get('/headers', function(req, res) {
	res.set('Content-Type','text/plain');
	var s='';
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

