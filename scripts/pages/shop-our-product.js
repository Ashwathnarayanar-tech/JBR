require([
    "modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api", 
    "shim!vendor/owl.carousel[jquery=jQuery]>jQuery"], function ($, Hypr, Backbone, api) {
	 
	$(document).ready(function () {
        
        var slideCount = $('.viewport_gallery_slide').length;
        var slideContent = $('.viewport_gallery_slide').html();
        
        runSlideShow();
        
        setInterval(function () {
            if($('.viewport_gallery_slide').length > 0 ){
                if( slideCount != $('.viewport_gallery_slide').length ){
                    runSlideShow();            
                }else if(slideContent !=  $('.viewport_gallery_slide').html()){
                    runSlideShow();            
                }  
            }else{
                slideCount  = $('.viewport_gallery_slide').length;
            }
        }, 1000);
        
        var isCarousalLoaded = false;
        setInterval(function(){
            if(!isCarousalLoaded){
                var xx = $('.recommended-product').find('.MB_HCAT2');
                if(xx.length>0){
                    var x= xx.children()[0];
                    x.innerHTML = '<h3 style="padding-left: 9%;width: 100%;">Jelly Belly Also Recommends</h3>';
                    isCarousalLoaded = true;
                    mybuyscarousal();
                }
            }
        }, 1000);
        
       /* console.log(document.getElementById('jb-pr-inline-iframe').contentWindow.document.body.innerHTML);
        setTimeout(function() { console.log($("#jb-pr-inline-iframe").contents()); },2000);
        $('#powerReview-inline-SEO').html($.trim($("#jb-pr-inline").contents().find('body').html()));*/
        // $( window ).resize(function() {
        //     mybuyscarousal(); 
        // });  
        
        function mybuyscarousal(){
            if($(window).width() < 768){
                var owlMBRP = $('.MB_PRODUCTSLOT').parent();
                console.log(owlMBRP);
                
                            owlMBRP.owlCarousel({
                                    center          :true,
                                    loop            :true,
                                    nav             :true,
                                    margin          :2,
                                    dots            :false,
                                    responsive:{
                                        0:{
                                            items:1
                                        },
                                        400:{
                                            items:1
                                        },
                                        600:{
                                            items:1
                                        },
                                        800:{
                                            items:1
                                        }
                                    }
                                });
                
             }
        }
        function runSlideShow(){
            var owlDsk = $('#shop_our_product_gallery .slides');
            
            owlDsk.owlCarousel({
                center:true,
                loop:true,
                margin:10,
                nav:true,
                responsiveClass:true,
                responsive:{
                    0:{
                        items:1
                    },
                    600:{
                        items:1
                    },
                    1000:{
                        items:1
                    }
                }
            });
        }
	});

	});



