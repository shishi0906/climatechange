$(document).ready(function(){
	$('#short-intro').hide();
    $('#title-main').hide().delay(0).fadeIn(10000,function(){
    	$('#title-main').animate({top:'15%'},2000);
    	// $('#short-intro').fadeIn(2000);
    	$('#short-intro').fadeIn(0).animate({'margin-top':'30%'},3000);
    })
});
