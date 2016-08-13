var express = require('express');
var router = express.Router();
var Circle = require('../models/circle.js');
var User = require('../models/user.js');

var mongodb = require('mongodb');
var mongoose = require('mongoose');


router.get('/', function(req,res){
  Circle.find({},function(err,docs){
    res.render('index',{
      circle: docs.reverse()
    });
  });
});

// router.get('/detail/:id',function(req,res){
//   console.log()
//   Circle.findOne({_id: mongodb.ObjectId(req.params.id)},function(err,docs){
//     if(err){console.log("ERROR");}
//     console.log(docs);
//     res.render('detail',{
//       detail: docs
//     });
//   });
// });






router.get('/detail/:id',function(req,res){
  Circle.findOne({_id: mongodb.ObjectId(req.params.id)})
  .populate('member','username')
  .exec(function (err, item) {
        res.render('detail',{
            status: 'success',
            detail: item.circlename,
            member: item.member
        });
    });
});


router.post('/list',ensureAuthenticated, function(req,res){
  var circlename = req.body.circlename;
  // res.render('list');

  req.checkBody('circlename','CircleName is required').notEmpty();

  var errors = req.validationErrors();

  if(errors){
    res.render('index',{
      errors: errors
    });
  } else {
    var newCircle = new Circle({
      circlename: circlename,
      introduction: "",
      member: req.user
    });
    Circle.createCircle(newCircle, function(err,circle){
      if(err) throw err;
      console.log(circle);
    });
    req.flash('success_msg', 'You created new Circle');
    res.redirect('/');
  }
})

function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('error_msg','You are not logged in');
    res.redirect('/users/login');
  }
}

// function ensureAuthenticated(req, res, next){
// 	if(req.isAuthenticated()){
// 		return next();
// 	} else {
// 		//req.flash('error_msg','You are not logged in');
// 		res.redirect('/users/login');
// 	}
// }

module.exports = router;
