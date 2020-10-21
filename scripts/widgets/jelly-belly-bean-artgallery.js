
require([
    "modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api",
    "shim!vendor/owl.carousel[jquery=jQuery]>jQuery"], function ($, Hypr, Backbone, api) {
     

    $(document).ready(function(){
        updateView();
        function updateView(){
            console.log('update view');
            $('.jelly-belly-bean-art-gallery-thumps .gallery-carousel-group').owlCarousel({
                loop:true,
                nav:true,
                margin:5,
                dots:true,
                responsive:{
                    0:{
                        items:1
                    },
                    300:{
                        items:4
                    },
                    600:{
                        items:6
                    },
                    1000:{
                        items:8
                    }
                }
            });  
            
            $('[maingalleryid]').click(function(e){
                $('[maingalleryid]').removeClass('active');
                $(e.target).addClass('active');
                var mainbanner = e.target.getAttribute('maingalleryid');
                $('.gallery-item').each(function(k,v){
                    if(v.style.display !== "none"){
                        $(v).fadeOut(500,function(){
                            $('[mainbanner="'+mainbanner+'"]').fadeIn(100);                        
                        });
                    }
                });
                $('[maincarousal]').each(function(k1,v1){
                    if(v1.style.display !== "none"){
                        $(v1).fadeOut(500,function(){
                            $('[maincarousal="'+mainbanner+'"]').fadeIn(100);                        
                        });
                    }
                });
            });
            
            $(document).on('click','[subgallerydetailsid]',function(e){
                var subgallerydetailsid = e.target.getAttribute('subgallerydetailsid');
                $('.gallery-item').each(function(k,v){
                    if(v.style.display !== "none"){
                        $(v).fadeOut(500,function(){
                            $('[subgallerydetails="'+subgallerydetailsid+'"]').fadeIn(100);                        
                        });
                    }
                });
            });
            
            $('.artgallery-loader').fadeOut(2000);
        }
    });

});


