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
  Circle.find({},function(err,docs){

  })
});

router.get('/detail/:id/chat',ensureAuthenticated, function(req,res){
  Circle.findOne({_id: req.params.id}, function(err,circle){
    res.render('chat',{
      circle: circle
  });
});
});

router.get('/detail/:id',ensureAuthenticated, function(req,res) {
  Circle.findOne({_id: req.params.id}, function(err,circle){
    var memberIds = circle.members;
    console.log(memberIds);
    var members = [];
//サークルに所属しているメンバーの取得
    var query = "{$or: [";
    for(var index in memberIds){
      query+="{_id:\""+memberIds[index]+"\"}";
      console.log(memberIds[index]);
      if(index<memberIds.length-1){
        query+=",";
      }
    }
    query += "]}";

    // console.log(query);
    // 2. クエリを使用して、データを取得
    User.find(query, function(err, res) {
      // 3. 取得したデータからユーザ名を取得
      for(var index in res){
        // console.log(res[index].username);
        members.push(res[index].username);
      }
      // console.log(members);
    });

//ユーザーがこのサークルにJOINしていた時としていない時

//ユーザーがJOINしていない時(JOINボタンを押した)
    if (memberIds.indexOf(req.user._id) >= 0){
      res.render('detail', {
        circlename: circle.circlename,
        members:　members,
        introduction: circle.introduction,
        circle: circle,
        active: "active"
      });
      //ユーザーがJOINしていた時(退会するを押した)
    } else {
      res.render('detail', {
        circlename: circle.circlename,
        members: members,
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
      members: [req.user._id]
    });


//サークルを作成したユーザーのjoinsにサークルidを追加する処理
    newCircle.save(function(err,circle){
        User.findOne({_id: req.user._id}, function(err,user){
            var joins = user.joins;
            joins.push(circle._id);
          console.log(joins);
          user.joins = joins;
            user.save();
        });
      });
    req.flash('success_msg', 'You created new Circle');
    res.redirect('/');
  }
});

router.post('/detail/join',ensureAuthenticated, function(req,res) {
//JOIN状態にはactiveをもたせておく
//退会するを押した場合(すでにJOINしていた)
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
//JOINを押した場合(まだJOINしていなかった場合)
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
