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
    console.log(err)
  });

  const scriptPath = 'public/python/run.py'
  const process = spawn('python', [scriptPath, filename])

  var bmi;
  process.stdout.on('data', function (data) {
    console.log('Pipe data from python script ...');
    bmi = data.toString();
    console.log(bmi)
    return res.send(bmi)
  });

  process.stderr.on('data', function (data) {
    console.error(data.toString());
  })

  process.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    fs.unlink('./' + filename, function(err) {
      console.log(err)
    });
  });
})


module.exports = router;
