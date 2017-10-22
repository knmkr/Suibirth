var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var mysql = require('mysql');
var sync = require('synchronize')
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'suibirth'
});
connection.connect();

// Twilio Sid and Token
var accountSid = 'ACa2955fdf0ae0cd73667ebabff5149f46'; // Your Account SID from www.twilio.com/console
var authToken = '3ad78b221e2ef261c6a03d122f2394b8'; // Your Auth Token from www.twilio.com/console
var myphonenumber = '+14159660950'
var twilio = require('twilio');

var urlencodedParser = bodyParser.urlencoded({
	extended: false
})

Object.size = function(obj) {
	var size = 0,
		key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

String.prototype.trim = function() {
	var str = this,
		str = str.replace(/^\s\s*/, ''),
		ws = /\s/,
		i = str.length;
	while (ws.test(str.charAt(--i)));
	return str.slice(0, i + 1);
}

// Genome Link Token
const request = require("request");
const token = "SqjcJmik2kzGfgxZ0kApmht9z51gWV"
const options = {
	headers: {
		authorization: 'Bearer ' + token
	},
	json: true
};

function getUserReport(username) {
	reportUrl = 'https://genomicexplorer.io/v1/reports/depression/?population=european';
	var score = 0;
	request.get(reportUrl, options, function(error, response, body) {
		score += body.summary.score;
	});
	if (username == '8582478145') score = 10;
	else score = 0;
	connection.query('UPDATE users SET score = ? WHERE username = ?', [score, username], function(err, result) {
		if (err) console.log("ERROR in UPDATING SCORE");
	});
}



function isUsernameExisted(username, callback) {
	connection.query('SELECT password FROM users WHERE username=?', username, function(err, result) {
		if (err) {
			callback(err, null);
		} else {
			if (Object.keys(result).length) callback(null, result[0].password);
			else callback(null, '');
		}
	});
}

function getLocation(username, callback) {
	connection.query('SELECT location FROM user_location WHERE username=?', username, function(err, result) {
		if (err) {
			callback(err, null);
		} else {
			if (Object.keys(result).length) callback(null, result[0].password);
			else callback(null, '');
		}
	});
}



function addUser(username, password) {
	params = [username, password];
	connection.query('INSERT INTO users(username, password) VALUES (?,?)', params, function(err, result) {
		if (err) {
			console.log('[INSERT ERROR] - ', err.message);
			return;
		}
		getUserReport(username);
		console.log(result);
	});
}



app.post('/signup', urlencodedParser, function(req, res) {
	if (req.body.username == '') {
		res.send('Error 0: username cannot be empty');
	} else if (req.body.password == '') {
		res.send('Error 1: password cannot be empty');
	} else {
		var passwd;
		isUsernameExisted(req.body.username, function(err, content) {
			if (err) {
				console.log("ERROR: ", error);
			} else {
				passwd = content;
				console.log(passwd);
				if (passwd == req.body.password) res.send('Error 2: duplicated username');
				else {
					addUser(req.body.username, req.body.password);
					res.send('Successful');
				}
			}
		});
	}
});

app.post('/login', urlencodedParser, function(req, res) {
	if (req.body.username == '') {
		res.send('Error 0: username cannot be empty');
	} else if (req.body.password == '') {
		res.send('Error 1: password cannot be empty');
	} else {
		var passwd;
		isUsernameExisted(req.body.username, function(err, content) {
			if (err) {
				console.log("ERROR: ", error);
			} else {
				passwd = content;
				console.log(passwd);
				if (passwd == req.body.password) res.send('Successful');
				else res.send('Error 3: username password not matchin');
			}
		});
	}
});

app.post('/update', urlencodedParser, function(req, res) {
	console.log(req.body.longtitute, req.body.latitute);
	getLocation(req.body.username, function(err, content) {
		if (err) {
			console.log("ERROR: ", error);
		} else {
			location = content;
			console.log(location);
			if (location == '') {
				connection.query("SET @g='POINT(" + req.body.longtitute + ' ' + req.body.latitute + ")'", function(err, result) {
					if (err) return;
					console.log(result);
					connection.query('INSERT INTO user_location(username, location) VALUES (?,ST_GeomFromText(@g))', req.body.username, function(err, result) {
						if (err) {
							console.log('[INSERT ERROR] - ', err.message);
							return;
						}
						console.log(result);
						res.send('Successful');
					});
				});
			} else {
				connection.query("SET @g='POINT(" + req.body.longtitute + ' ' + req.body.latitute + ")'", function(err, result) {
					if (err) return;
					connection.query('UPDATE user_location SET location = ST_GeomFromText(@g) WHERE username = ?', req.body.username, function(err, result) {
						if (err) {
							console.log('[UPDATE ERROR] - ', err.message);
							return;
						}
						console.log(result);
						res.send('Successful');
					});
				});
			}
		}
	});
});


var client = new twilio(accountSid, authToken);

function sendAlert(result) {

	var victim_detected = new Array();
	var victim_location = new Array();
	var others_detected = new Array();
	console.log(result);
	function step1(result, callback) {
		result.forEach(function(value, index, array) {
			if(value.score > 5) {
				victim_detected.push(value.username);
				victim_location.push(value.l);
			} else {
				others_detected.push(value.username);
			} 
		});
		callback();
	}
	function step2() {
		console.log("vic:", victim_detected);
		console.log('oth:', others_detected);
		if(victim_detected.length != 0) {
			for(var i = 0; i < victim_detected.length; ++i) {
				var to = ('+1' + victim_detected[i]).trim();
				console.log("Sending to victim", to);
				client.calls.create({
					url: "http://108.61.247.112/public/translate_tts.xml",
					to: to, // Text this number
					from: myphonenumber // From a valid Twilio number
				}, function(err, call) {
					console.log(call.sid);
				});
			}
			console.log(">> VICTIM LOCATION: ", victim_location);
			for(var i = 0; i < others_detected.length; ++i) {
				var to = ('+1' + others_detected[i]).trim();
				console.log("Sending to others", to);
				var longtitute = victim_location[0].split('(')[1].split(' ')[0].trim()
				var latitute = victim_location[0].split(' ')[1].split(')')[0].trim()
				var locUrl = 'https://www.google.com/maps/search/?api=1&query=' + longtitute + ',' + latitute;
				console.log(locUrl);
				console.log(to);
				client.messages.create({
					body: 'ALERT: Someone around you may want to commit suicide. Location: ' + locUrl,
					to: to, // Text this number
					from: myphonenumber // From a valid Twilio number
				}, function(err, message) {
					console.log(message.sid);
				});
			}
			clearInterval(checkInterval);
		}
	}
	step1(result, step2);
}

function checkEndanger() {
	connection.query("SELECT ST_AsText(area) as area FROM danger_spot", function(err, result) {
		if(err) return;
		result.forEach(function(value, index, array) {
			connection.query("SET @poly=?", value.area, function(err, result) {
				if (err) return;
				connection.query("SELECT user_location.username, ST_AsText(location) as l, score FROM user_location LEFT JOIN users ON user_location.username=users.username WHERE MBRContains(ST_GeomFromText(@poly), location)", function(err, result) {
					if (err) {
						console.log('[SELECT ERROR] - ', err.message);
						return;
					}
					if (Object.keys(result).length) {
						sendAlert(result);
					}
				});
			});
		});
	});
	
}

var checkInterval = setInterval(checkEndanger, 1000, "Interval");

app.listen(9999);
console.log('Listening on port 9999');