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


router.get('/detail/:id',ensureAuthenticated, function(req,res){
  Circle.findOne({_id: mongodb.ObjectId(req.params.id)})
  .populate('member','username')
  .exec(function (err, item) {
        res.render('detail',{
            status: 'success',
            detail: item,
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
      members: req.user._id
    });
    Circle.createCircle(newCircle, function(err,circle){
      if(err) throw err;
      console.log(circle);
    });
    req.flash('success_msg', 'You created new Circle');
    res.redirect('/');
  }
});

router.post('/detail/join',ensureAuthenticated, function(req,res) {
  // console.log(req.user._id);
  // console.log(req.body.circle_id);
  // Circle.update({_id:req.body.circle_id}, {$push: {member:req.user._id}}, function(err) {});
  // User.update({_id:req.user._id}, {$push: {join:req.body.circle_id}}, function(err) {});
  console.log(req.body.circle_id);
  console.log(req.user._id);

  // var join = {};
  //   join._id = req.body.circle_id;
      // ... set fields ...
  User.update({ _id: req.user._id }, { $push: { joins: req.body.circle_id } },{ upsert: false, multi: false }, function(err) {
    console.log(err);
  });

  // var member = {};
  //     member._id = req.user._id;
  Circle.update({ _id: req.body.circle_id }, { $push: { members: req.user._id } },{ upsert: false, multi: false }, function(err) {
    console.log(err);
  });
});



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
