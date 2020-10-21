define(['modules/jquery-mozu',
        "modules/api", 
        "hyprlive", 
        'shim!vendor/jquery.hoverIntent[jquery=jQuery]>jQuery'], function ($,api,Hypr) {
    $(document).ready(function () {
        $('[data-mz-contextify]').each(function () {
            var $this = $(this),
            config = $this.data();
            $this.find(config.mzContextify).each(function () {
                var $item = $(this);
                if (config.mzContextifyAttr === "class") {
                    $item.addClass(config.mzContextifyVal);
                } else {
                    $item.prop(config.mzContextifyAttr, config.mzContextifyVal);
                }
            });
        });
        if($(window).width() > 767 && $(window).width() <= 1024){
            $(document).find('.mz-pageheader-desktop').addClass('dvs-iPad');    
        } 
    });
    

    //menu slide down
    function Menuslide(){
        $('.menu-container').slideDown();
        $('.mz-sitenav-sub').hide();
        $('body').click(function(){ 
            $('.menu-container').hide();
            $(document).find('.menu-item-border').removeClass('addBorder');
        });
    }

    // mouse Over Menu 
    function mouseOverMenu(){
        var width = windowWidth();
        var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window.safari || (typeof safari !== 'undefined' && safari.pushNotification));
        var isFireFox = typeof InstallTrigger !== 'undefined';
        if(width>767){
            if(isFireFox || isSafari)
                $(document).find('.mz-sitenav-sub').addClass('fdflex');
            // $(this).css("color","#00a3e0");
            $(this).children().removeClass('arrow_right');
            $(this).addClass('back');
            $(this).children().addClass('arrow_hover');
            $('.mz-sitenav-sub').css({'display': 'none'});
            $(document).find('.mz-sitenav-sub').removeClass('dflex');
            $(document).find('.mz-sitenav-sub').removeClass('ffdflex');
            if($(this).siblings('.mz-sitenav-sub').find("li").length){
                $(this).siblings('.mz-sitenav-sub').css({'display':'block'});
                $(document).find('.menu-item-border').addClass('addBorder');
                if($(this).siblings('.mz-sitenav-sub').height() > $('.mz-sitenav-list').height()){
                     $(document).find('.mz-sitenav-sub').removeClass('dflex');
                     if(isFireFox || isSafari)
                        $(this).siblings('.mz-sitenav-sub').addClass('ffdflex');
                     else
                        $(this).siblings('.mz-sitenav-sub').addClass('dflex');
                }else{
                    if(isFireFox || isSafari)
                        $(document).find('.mz-sitenav-sub').removeClass('ffdflex');
                    else
                        $(document).find('.mz-sitenav-sub').removeClass('dflex');
                }
            }else{
                $(document).find('.menu-item-border').removeClass('addBorder');
            }
        } 
    }

    // mouse over submenu
    function mouseOverSubMenu(){
        var width = windowWidth();
        if(width>767){
            // $(this).css("color","#00a3e0");
            $(this).children().removeClass('arrow_right');
            $(this).addClass('back');
            $(this).children().addClass('arrow_hover');
        } 
    }

    // window width   
    function windowWidth(){
        var width= $( window ).width();
        return width;
    }

    //mouse leave Menu
    function mouseLeaveMenu(){
        var width = windowWidth();
        if(width>767){
            // $(this).css("color","#3f3f3f");
            $(this).removeClass('back');
            $(this).children().addClass('arrow_right');
            $(this).children().removeClass('arrow_hover');
        } 
    }   


    $(document).ready(function(){
        $('.menu,.menu span').on('mouseover' , Menuslide );
        $('.main-link').on("mouseover",mouseOverMenu );
        $('.main-link').on("mouseleave",mouseLeaveMenu );
        $('.sub-link').on('mouseover',mouseOverSubMenu);
        $('.sub-link').on("mouseleave",mouseLeaveMenu );

        $(".main-link").on("click",function(){
            $(".mobile_megamenu .mz-sitenav-list").css("overflow-x","initial");
            //$('.main-link').off('click');         
        });

        //mouse out
        $('.mz-sitenav-sub').mouseout(function(){
            var width= $( window ).width();
            if(width > 767){
                var current= $(this).parent().find('.main-link');
                current.removeClass('back');
                //current.css("color","#000");
            }
        });


        //mouse over
        $('.mz-sitenav-sub').mouseover(function(){
            var width= $( window ).width();
            if(width > 767){
                var current= $(this).parent().find('.main-link');
                current.addClass('back');
                // current.css("color","#00a3e0");
            }
        });

        //mobile menu
        $('#jb-mobile-menu').click(function(){
            $('.mz-sitenav-list').slideDown();
            $(".mobile_megamenu .mz-sitenav-list").css("overflow-x","scroll");
        });

        $('.close').on('click',function(){
            $('.mz-sitenav-list').slideUp();
            $('.mz-sitenav-list').animate({
                left: "0"
            }, 1000);
            $('.mz-sitenav-sub').animate({
                left: "100%"
            }, 1000);
            $('.mz-sitenav-sub').hide();
            $('.mz-sitenav-sub-sub').animate({
                left: "100%"
            }, 1000);
            $('.mz-sitenav-sub-sub').hide();
            $(".mz-homepage").css("overflow","scroll");
        });

        $('.main-link').on('click',function(e){
            var width = $( window ).width();
            if(width < 767){
                if(!$(e.target).hasClass('visited')){
                    var subMenu=$(this).parent().find('.mz-sitenav-sub');
                    if(subMenu.length>0){
                        e.preventDefault();
                        $(document).find('.main-link').filter(':visible').removeClass('visited');
                        $(e.target).addClass('visited');                    
                        subMenu.addClass('selected');
                        subMenu.show(); 
                        var menu= $('.mz-sitenav-list'); 
                        if(menu.find('selected')){
                            menu.animate({
                                left: "-100%"
                            }, 1000);
                            menu.css({
                                'display': 'block'
                            });
                        }
                    }else{
                        $(this).unbind('click');
                    }
                }
            }
        });

        $('.sub-link').on('click',function(e){
            var width=$( window ).width();
            var original;
            if(width< 767){
                if(!$(e.target).hasClass('visited')){
                    var subMenu = $(this).parent().find('.mz-sitenav-sub-sub');
                    var length= subMenu.find('li').length;
                    if(length>0){
                        e.preventDefault();
                        $(document).find('.sub-link').filter(':visible').removeClass('visited');
                        $(e.target).addClass('visited');
                        subMenu.addClass('selected');
                        subMenu.show();
                        var menu = subMenu.parent().parent();
                        if (menu.find('.selected')) {
                            menu.animate({
                                left: "0"
                            }, 1000);
                        }
                    } else {
                        $(this).unbind('click');
                    }
                }
            }
        });

        $('.sublinkName').on('click', function() {
            if ($('.mz-sitenav-sub').find('.selected')) {
                $('.mz-sitenav-sub').animate({
                    left: "100%"
                }, 1000);
                $('.mz-sitenav-sub').find('.selected').hide();
                $('.mz-sitenav-sub').find('.selected').removeClass('selected');
            }
        });

        $('.mainmenu').on('click', function() {
            if ($('.mz-sitenav-list').find('.selected')) {
                $('.mz-sitenav-list').animate({
                    left: "0"
                }, 1000);
                $('.mz-sitenav-list').find('.selected').hide();
                $('.mz-sitenav-list').find('.selected').removeClass('selected');
                $(".mz-homepage").css("overflow","scroll");
                $(".mobile_megamenu .mz-sitenav-list").css("overflow-x","scroll");
            }
        }); 

        if($.cookie('userData') && $.cookie('userData') !== ''){
            $(document).find('.desktop-useremail').html(decodeURIComponent($.cookie('userData')));
            $(document).find('.mobile-usermail').html(decodeURIComponent($.cookie('userData')));
        }

        // show search iPad
        function showsearchbox(){
            $(document).find('.megamenu').addClass('onsearch');
            $(document).find('.usermail-cointainer').css("visibility", "hidden");
            $(document).find('.desktop-contact').css("visibility", "hidden");
            $(document).find('.rapid-button.ipad-ROF').css("visibility", "hidden");
            $(document).find('.ipad-search-icon-cointainer').hide();
            $(".jb-serach-box-with-label").css('display','inline-block'); 
            $(".jb-serach-box-with-label .mz-searchbox").animate({ left: "14px" }, 500); 
            $(document).find('.mz-searchbox-field.tt-input').focus();   
        }

        // hide search iPad
        function hidesearchbox(){ 
            $(document).find('.megamenu').removeClass('onsearch');
            $(document).find('.usermail-cointainer').css("visibility", "visible");
            $(document).find('.desktop-contact').css("visibility", "visible");
            $(document).find('.rapid-button.ipad-ROF').css("visibility", "visible"); 
            $(document).find('.ipad-search-icon-cointainer').show();
            $(".jb-serach-box-with-label .mz-searchbox").animate({ left: "0px" }, 500);    
            $(".jb-serach-box-with-label").hide();
        } 

        $(document).on('click touchstart', '.ipad-search-icon-cointainer', function(){
            showsearchbox();   
        });

        $(document).on('click touchstart', function(e){
            if($(window).width() > 767 && $(window).width() < 1025){
                if(!($(e.target).hasClass('jb-serach-box-with-label') || $(e.target).parents().hasClass('jb-serach-box-with-label') || $(e.target).hasClass('ipad-search-icon') || $(e.target).parents().hasClass('ipad-search-icon'))){
                    hidesearchbox();
                }
            }
        }); 
    });
});






