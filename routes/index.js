var express = require('express');
var router = express.Router();

var multer = require('multer');
var uploading = multer({ 
  dest: './public/uploads',
  limits: { fileSize: 10000000, files:1 }
});

var exec = require('child_process').exec;
var fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Google MAP API Example' });
});

/* POST for uploading a .gpx file into map */
router.post('/uploads', uploading.single('gpx'), function(req, res) {
  console.log(req.body);
  console.log(req.file);
  // res.status(204).end();

  // make a directory to store the lat/lng coord in js array format
  var cmd = 'mkdir ' + req.file.filename;
  exec(cmd, function(err, stdout, stderr) {
    if (err) { console.log("ERROR: " + err); }
    if (stderr) { console.log("STDERR: " + stderr); }
    console.log(stdout);
  }); 

  // now, use perl script to generate js-arry of lat/lng coordinates
  cmd = 'perl coords.pl ' + req.file.path + ' > ' + req.file.filename + '/' + req.file.filename;
  // cmd = 'perl coords.pl ' + req.file.path;
  exec(cmd, function(err, stdout, stderr) {
    if (err || stderr) { 
      console.log("err: " + err); 
      console.log("stderr: " + stderr);
      var err_msg = "Not a valid file format.";
      res.render('index', { title: 'Google Map API - Error', error: err_msg });
    }
    res.render('index', { title: 'Google MAP API Example - Upload', path: req.file.filename });
  });

});

/* GET for populating gps lat/lng data */
router.get('/gps', function(req, res) {
  // load coordinates
  if (req.query.filename) {
    var file_path = req.query.filename + "/" + req.query.filename;
    var data = fs.readFile(file_path, function(err, data) {
      if (err) { console.log(err); }
      res.send(data); 
    });
        
  }
  else {
    var data = fs.readFileSync('default_coord.js');
    res.send(data);
  }
});

module.exports = router;





















