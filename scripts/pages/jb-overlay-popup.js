require([
    "modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api"],function ($, Hypr, Backbone, api) {

    $(document).ready(function(){

            // if(!('ontouchstart' in window)){
            //     if($.cookie('discount-offer') != 'shown'){
            //       //  position_offer();
            //     }
            //     $( window ).resize(function() {
            //         if($.cookie('discount-offer') != 'shown'){
            //           // position_offer();
            //         }
            //     });
                
            //     $('#jb-dicount-offer-close').click(function(){
                    
            //         $.cookie('discount-offer','shown');
            //         $('#jb-l-overlay-popup').css('height','0%');
            //         $('#jb-discount-offer').css('height','0px');
            //     });
            // }
            
            function position_offer(){
                var change = $(window).width()/2 -  $('#jb-discount-offer').width()/2;
                $('#jb-discount-offer').css('left',change+'px');
                $('#jb-l-overlay-popup').css('height','100%');
                $('#jb-discount-offer').css('height','494px');
            }

    });

});


