// Developed by: Abhishek Babu

var express = require('express');
var router = express.Router();

/* GET home page. */
var {google} = require('googleapis');
var key = require('../sublime-seat-300320-f720717e13a4.json');
router.get('/', function(req, res, next) {
  let jwtClient = new google.auth.JWT(
    key.client_email, null, key.private_key,
    ['https://www.googleapis.com/auth/analytics.readonly'], null);
  jwtClient.authorize(function (err, tokens) {
    if (err) {
      console.log(err);
      return;
    }
    let analytics = google.analytics('v3');
    queryData(res, analytics, jwtClient);
  });

  //res.render('index')
});

function queryData(res, analytics, jwtClient) {
  const viewID = 'ga:235009059';
  analytics.data.ga.get({
    'auth': jwtClient,
    'ids': viewID,
    'metrics': 'ga:sessions',
    'start-date': '2020-12-01',
    'end-date': 'today',
  }, function (err, response) {
    if (err) {
      console.log(err);
      return;
    }
    console.log(JSON.stringify(response, null, 4));
    num_sessions = response['data']['totalsForAllResults']['ga:sessions']
    res.render('index', {visits: num_sessions})
  })
}

/* POST to get bmi model result */
const {spawn} = require('child_process');
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
router.post('/', function(req, res) {
  var filename = uuidv4();
  var img_data = req.body.base64
  fs.writeFile(filename, img_data, 'base64', function(err) {
    if (err !== null) {
      console.log(err)
    }
  });

  const scriptPath = 'public/python/run.py'
  const process = spawn('python', [scriptPath, filename])

  var bmi;
  process.stdout.on('data', function (data) {
    bmi = data.toString();
    fs.unlink('./' + filename, function(err) {
      if (err !== null) {
        if (err.code !== 'ENOENT') {
          console.log(err)
        }
      }
    });
  });

  process.stderr.on('data', function (data) {
    if (!data.toString().includes("WARNING") && !data.toString().includes('Updating') && !data.toString().includes('Colocations') && !data.toString().includes('cpu_feature_guard')) {
      console.error(data.toString());
      fs.unlink('./' + filename, function(err) {
        if (err !== null) {
          if (err.code !== 'ENOENT') {
            console.log(err)
          }
        }
      });
    }
  })

  process.on('close', (code) => {
    fs.unlink('./' + filename, function(err) {
      if (err !== null) {
        if (err.code !== 'ENOENT') {
          console.log(err)
        }
      }
    });
    res.send(bmi)
  });
})


module.exports = router;
