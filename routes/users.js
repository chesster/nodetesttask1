var express = require('express');
var router = express.Router();
var requestPromise = require('request-promise');


router.get('/', function(req, res, next) {
  res.render('users', {'user_id': ''});
});

router.post('/', function(req, res, next) {
  var resultSet = Array();
  var userId = req.body.user_id;
  var transformFunction = function (body) {return JSON.parse(body)};
  var commentPromisses = Array();
  requestPromise({
    uri: 'https://jsonplaceholder.typicode.com/posts?userId=' + userId,
    encoding: null,
    transform: transformFunction
  }).then(function (userPosts) {
    userPosts.slice(0, 5).forEach(function(userPost){
      commentPromisses.push(requestPromise({
        uri: 'https://jsonplaceholder.typicode.com/comments?postId=' + userPost.id,
        encoding: null,
        transform: transformFunction
      }));
      resultSet[userPost.id] = userPost;
      resultSet[userPost.id].comments = [];
    });
  }).finally(function() {
    Promise.all(commentPromisses).then((results) => {
      results.forEach(function(comments){
        comments.forEach(function(comment){
          resultSet[comment.postId].comments.push(comment);
        });
      });
      res.render('users', {
        'userId' : userId,
        'result': resultSet.filter(function(n){ return n != undefined }),
      });
    });
  });
});

module.exports = router;
