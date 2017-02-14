var express = require('express');
var router = express.Router();
var request_promise = require('request-promise');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

router.get('/', function(req, res, next) {
  res.render('index', {'query': ''});
});

router.post('/', function(req, res, next) {
  var resultSet = Array();
  var query = req.body.query;
  request_promise({
    uri: 'http://www.google.pl/search?q=' + query,
    encoding: null,
    transform: function (body) {
      return cheerio.load(
        iconv.decode(new Buffer(body), "ISO-8859-2")
      );
    }
  }).then(function ($) {
    $('div.g').each(function(i, element){
      resultSet.push({
        header: $(element).find('h3.r').text(),
        description: $(element).find('span.st').text(),
      });
    });
  }).catch(function (err) {
    console.log(err);
  }).finally(function () {
    res.render('index', {
      'query' : query,
      'result': resultSet,
    });
  });
});

module.exports = router;
