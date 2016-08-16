$(function() {

  if($('#join').hasClass("active")){
    $('#join').attr('value', '退会する');
  }

$('#join').on('click',function(){
  var circleId = String($("input").attr("name"));

  $.ajax({
        url: '/detail/join',
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({circle_id: circleId, active: $(this).hasClass("active")})
      });


    if($(this).hasClass("active")){
      $(this).removeClass("active");
      $('#join').attr('value', 'JOIN');
    } else {
      $(this).addClass("active");
      $('#join').attr('value', '退会する');
    }

    });

$('.goEdit').on('click',function(){
  var circleId = String($("input").attr("name"));
  $.ajax({
    url: '/detail/edit/'+ $("input").attr("name"),
    type: 'GET'
  });
});
});
