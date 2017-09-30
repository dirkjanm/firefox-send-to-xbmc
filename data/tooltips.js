$(document).on('focus','[data-toggle="tooltip"]',function(){
  var text = $(this).attr('data-title');
  var width = $(this).width();
  var height = $(this).height();
  var center = width / 2;

  $(this).after('<span class="tooltip"><span></span></span>');

  var tooltip = $('span.tooltip');
  tooltip.text(text)
  var tooltipWidth = tooltip.width();
  var tooltipCenter = tooltipWidth / 2 - center;

  tooltip.css({
    left: '-'+tooltipCenter+'px',
    bottom: '35px',
    opacity: 1
  });
  $('span.tooltip span').css({ left: (tooltipCenter + 4)+'px'});


  $(this).on('blur',function(){
    $('span.tooltip').css({ bottom: '20px' });
    $('span.tooltip').fadeOut(200, function(){
        $(this).remove();
    });
  });

});
