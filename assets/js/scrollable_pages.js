$(document).ready(function () {
  $('div.top').click(function() {
  $('html, body').animate({
    scrollTop: $("div.middle").offset().top
  }, 1000)
}), 
  $('div.middle').click(function (){
    $('html, body').animate({
      scrollTop: $("div.bottom").offset().top
    }, 1000)
  }),
  $('div.bottom').click(function (){
    $('html, body').animate({
      scrollTop: $("div.top").offset().top
    }, 1000)
  })
});