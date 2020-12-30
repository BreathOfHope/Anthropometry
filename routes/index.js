// Developed by: Abhishek Babu

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

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
