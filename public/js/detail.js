$(function() {

$('#join').on('click',function(){
  var circleId = String($("input").attr("name"));
  console.log(circleId);
  $.ajax({
        url: '/detail/join',
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({circle_id: circleId})
      });
});

});
