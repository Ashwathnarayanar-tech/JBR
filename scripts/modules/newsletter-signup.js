define(["modules/jquery-mozu", "hyprlive","vendor/jquery.mask"], function ($, Hypr) {

    var JB = {};
    JB.NewsletterSignup = {};
    JB.NewsletterSignup.BY = '2014';
    JB.NewsletterSignup.BM = '01';
    JB.NewsletterSignup.BD = '01';
    JB.NewsletterSignup.listener = '';
    JB.IsFirstTime  = true;

    
    JB.NewsletterSignup.emailFormFooterLinkClicked = function () {
        var coupon = Hypr.getThemeSetting("signup-coupon");
        var template = Hypr.getTemplate('modules/newsletterSignup').render({model:coupon});
        $('.emailPopup').remove();
        $('<div>', { 'class': 'emailPopup' }).appendTo(document.body);
        $('.emailPopup').append(template);
        if($.cookie('JBnewsletterSignup')){
            JB.IsFirstTime = false;
        }
        $.cookie('JBnewsletterSignup', 'true', { expires: 365, path: '/' });
        $('.emailPopup').delay(Hypr.getThemeSetting('newsletterDelay') * 1000).show('slow');
        $('input[name="BirthDate"]').mask("99/99/9999");
        if($(window).width() < 768)
        $("html, body").animate({scrollTop:  0 }, 1000);
        if(window.innerWidth<769){
            $("#page-wrapper").css({"display":"none"});   
            $(".jb-footer-dpzone").css({"display":"none"});
        }
        JB.NewsletterSignup.listener = JB.NewsletterSignup.listenToResponse();
    };
    
	JB.NewsletterSignup.emailFormFooterLinkClickedNoDelay = function () {
        var coupon = Hypr.getThemeSetting("signup-coupon");
        var template = Hypr.getTemplate('modules/newsletterSignup').render({model:coupon});
        $('.emailPopup').remove();
        $('<div>', { 'class': 'emailPopup' }).appendTo(document.body);
        $('.emailPopup').append(template);
        if($.cookie('JBnewsletterSignup')){
            JB.IsFirstTime = false;
        }
        $.cookie('JBnewsletterSignup', 'true', { expires: 365, path: '/' });
        $('.emailPopup').show('slow' );
        $('input[name="BirthDate"]').mask("99/99/9999");
        if($(window).width() < 768)
        $("html, body").animate({scrollTop:  0 }, 1000);
        if(window.innerWidth<769){
            $("#page-wrapper").css({"display":"none"});   
            $(".jb-footer-dpzone").css({"display":"none"});
			
			$(".emailSignUpContainer").css({
                "margin-top":"50px",
                "width":"65%",
                "height": "500px",
                "overflow":"scroll"
            });
			$(".header2").css({
                "font-size":"16px"
                });
            $(".header1").css({
                "font-size":"20px"
                });
            $(".header3").css({
                "font-size":"17px"
                });
            $(".surrounder").css({"overlay":"0.5"});
        }
        JB.NewsletterSignup.listener = JB.NewsletterSignup.listenToResponse();
    };
	
    JB.NewsletterSignup.closePopup = function (event) {
        if (event !== undefined)
            event.preventDefault();
        $.cookie('newsletterSignup', 'true', { expires: 365, path: '/' });
        $('.emailPopup').hide();
        if(window.innerWidth<769){    
            $("#page-wrapper").css({"display":"block"});
            $(".jb-footer-dpzone").css({"display":"block"});
        }
        clearInterval(JB.NewsletterSignup.listener);
    };  
    
    JB.NewsletterSignup.changeBY =function (e){
        var xxx = $('select[name="BirthYear"]')[0];
        JB.NewsletterSignup.BY = xxx.options[xxx.selectedIndex].value;
        $('[name="BirthDate"]').val(JB.NewsletterSignup.BD+'/'+JB.NewsletterSignup.BM+'/'+JB.NewsletterSignup.BY);
    };
    
    JB.NewsletterSignup.changeBD =function (e){
        var xxx = $('select[name="BirthDay"]')[0];
        JB.NewsletterSignup.BD = xxx.options[xxx.selectedIndex].value;
        $('[name="BirthDate"]').val(JB.NewsletterSignup.BD+'/'+JB.NewsletterSignup.BM+'/'+JB.NewsletterSignup.BY);
    };
    
    JB.NewsletterSignup.changeBM =function (e){
        var xxx = $('select[name="BirthMonth"]')[0];
        JB.NewsletterSignup.BM = xxx.options[xxx.selectedIndex].value;
        $('[name="BirthDate"]').val(JB.NewsletterSignup.BD+'/'+JB.NewsletterSignup.BM+'/'+JB.NewsletterSignup.BY);
    };
    
    JB.NewsletterSignup.hideMessages = function(e){
        $('#ve-div-success').css("visibility", "hidden");
        $('#ve-div-subscribed').css("visibility", "hidden");
        $('#ve-div-err').css("visibility", "hidden");
    };
    
    JB.NewsletterSignup.listenToResponse = function(){
        return setInterval(function(){
            if($('#ve-div-success').css("visibility") === "visible"){
                $('#ve-div-success').css("visibility", "hidden");
                $('.successContainer').show();
            }else if($('#ve-div-subscribed').css("visibility") === "visible"){
                $('#ve-div-subscribed').css("visibility", "hidden");
                $('.errorContainer').show();
            }else if($('#ve-div-err').css("visibility") === "visible"){
                $('#ve-div-err').css("visibility", "hidden");
            }
        },2000);
    };

	JB.NewsletterSignup.closePopupShaded = function() {
        // if it's mobile, allow click on shaded area (outside popup window) to close. otherwise ignore
        if($(window).width() < 768) {
            JB.NewsletterSignup.closePopup();
        }
    };
        
    $(function () {
        $(document)
        .on('click', 'a.noThankYou', JB.NewsletterSignup.closePopup)
        .on('click', 'a.no-thanks', JB.NewsletterSignup.closePopup)
        .on('click', '#emailSignupFooter', JB.NewsletterSignup.emailFormFooterLinkClickedNoDelay) 
        .on('change', 'select[name="BirthYear"]', JB.NewsletterSignup.changeBY)
        .on('change', 'select[name="BirthDay"]', JB.NewsletterSignup.changeBD)
        .on('change', 'select[name="BirthMonth"]', JB.NewsletterSignup.changeBM)
        .on('click', '.emailSubmitButton', JB.NewsletterSignup.hideMessages)
        .on('click', '#tryagain', JB.NewsletterSignup.emailFormFooterLinkClicked)
		.on('click', '.surrounder', JB.NewsletterSignup.closePopupShaded);
    });
    
	// used for testing only, makes popup display very time
	// JB.NewsletterSignup.emailFormFooterLinkClickedNoDelay();
	
    return {JB:JB};
    
    
    
});

