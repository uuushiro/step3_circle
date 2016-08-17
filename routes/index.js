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

router.get('/mydetail', ensureAuthenticated,function(req,res){

});

router.get('/detail/:id/chat',ensureAuthenticated, function(req,res){
    res.render('chat');
});


router.get('/detail/:id',ensureAuthenticated, function(req,res) {
  Circle.findOne({_id: req.params.id}, function(err,circle){
    var members = circle.members;
    console.log(members);

    if (members.indexOf(req.user._id) >= 0){
      console.log(err);
      res.render('detail', {
        circlename: circle.circlename,
        members: circle.members,
        introduction: circle.introduction,
        circle: circle,
        active: "active"
      });
    } else {
      console.log(err);
      res.render('detail', {
        circlename: circle.circlename,
        members: circle.members,
        introduction: circle.introduction,
        circle: circle,
        active: ""
      });
    }
  });
});

router.get('/detail/edit/:id', ensureAuthenticated, function(req,res){
  Circle.findOne({_id: req.params.id}, function(err,circle){
    res.render('detail_edit', {
      circlename: circle.circlename,
      introduction: circle.introduction,
      circleId: circle._id
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
      introduction: "編集してサークル紹介文を追加してください。",
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
  // console.log(req.body.circle_id);
  // console.log(req.body.active);
  // console.log(req.user._id);

  if(req.body.active){

  User.findOne({_id: req.user._id}, function(err,user){
      var joins = user.joins;
      joins.some(function(v, i){
    if (v==req.body.circle_id) joins.splice(i,1);
});
    console.log(joins);
    user.joins = joins;
      user.save();
  });

  Circle.findOne({_id: req.body.circle_id}, function(err,circle){
      var members = circle.members;
      members.some(function(v, i){
    if (v==req.user._id) members.splice(i,1);
});
    console.log(members);
    circle.members = members;
      circle.save();
  });

} else {


  User.findOne({_id: req.user._id}, function(err,user){
      var joins = user.joins;
      joins.push(req.body.circle_id);
    console.log(joins);
    user.joins = joins;
      user.save();
  });

  Circle.findOne({_id: req.body.circle_id}, function(err,circle){
      var members = circle.members;
      members.push(req.user._id);
    console.log(members);
    circle.members = members;
      circle.save();
  });


    // User.update({ _id: req.user._id }, { $push: { joins: req.body.circle_id } },{ upsert: false, multi: false }, function(err) {
    //   console.log(err);
    // });
    //
    // Circle.update({ _id: req.body.circle_id }, { $push: { members: req.user._id } },{ upsert: false, multi: false }, function(err) {
    //   console.log(err);
    // });
}

});

router.post('/detail/edit/:id', ensureAuthenticated, function(req,res){
  Circle.findOne({_id: req.params.id}, function(err,circle){
      circle.circlename = req.body.circlename,
      circle.introduction = req.body.introduction
      circle.save();
  });
  res.redirect('/detail/'+req.params.id);
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
