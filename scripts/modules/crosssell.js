require([
    "modules/jquery-mozu", "underscore",
    "hyprlive", "modules/backbone-mozu",
  "shim!vendor/owl.carousel[jquery=jQuery]>jQuery"
  
    ],function ($,_,Hypr, Backbone) {
        $(document).ready(function(){
            
            
            var length = $('.crosssell li').length;
            console.log(length);
            var pro=$('.crosssell li');
            var cross=[]; 
            for(var i=0;i<length;i++){
                var j = Math.floor(Math.random() * length);    
                    if(cross.indexOf(j) === -1 ){
                    if(cross.length<9){
                        cross.push(j);
                    }
                }    
            }
            for(var k=0;k<cross.length;k++){
                var code=pro[cross[k]].getAttribute('data-mz-product');
                $('.crosssell li').find('[data-mz-product= '+code+']').parent().remove();
            }
            if( $('.crosssell li').length > 0){
                $('.crosssell-carousel').show();
                var myVarco = setInterval(function(){ 
                   //carousel(); 
                },500);
                setTimeout(function(){  
                    clearInterval(myVarco);  
               },1000);  
            }else{
                $('.crosssell-carousel').hide(); 
            }  
             
               
 //            function carousel(){                
 //                var owlArtThump = $(document).find('.crosssell-carousel').find('.mz-productlist-carousel ul'); 
 //                owlArtThump.trigger('destroy.owl.carousel');  
 //                owlArtThump.html(owlArtThump.find('.owl-stage-outer').html()).removeClass('owl-loaded'); 
 //                owlArtThump.owlCarousel({
 //                    loop:true,
 //                    nav:true,
 //                    margin:2,
 //                    dots:false,
 //                    responsiveClass:true,
 //                    responsive:{
 //                        0:{
 //                            items:1
 //                        },
 //                        400:{
 //                            items:3
 //                        },
 //                        600:{
 //                            items:4
 //                        },
 //                        1000:{
 //                            items:5
 //                        }
 //                    }
 //                });
 //            }
            function carousel(){        
                var ele = ".top-seller .crosssell-carousel";
                var owl3 = $(ele+" .mz-productlist-carousel ul");
                   
                var counter = 0; 
                  
                var myVar = setInterval(function(){ 
                        counter++; 
                        owl3.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
                        owl3.find('.owl-stage-outer').children().unwrap();
                        // owl3.trigger('destroy.owl.carousel');  
                        // owl3.html(owl3.find('.owl-stage-outer').html()).removeClass('owl-loaded');
                        owl3.owlCarousel({  
                            //center: true,
                        //     loop: false,
                        //     nav:true,
                        //     navText:false,
                        //     responsive:{
                        //       0 : { 
                        //           items: 1 
                        //       },  
                        //       480 : {   
                        //           items: 3 
                        //       },
                        //       1025 : {
                        //           items: 4
                        //     }
                        //   }  
                        loop: false, 
                        margin: 2,
                        dots: true,
                        autoPlay: false,  
                        pagination: false,  
                        nav: false,     
                        navText:false,
                        responsive: {    
                            0: {
                                items: 1
                            },
                            400: {
                                items: 3
                            },
                            600: {
                                items: 3
                            },
                            800: {
                                items: 4 
                            }
                        }
                      });  
                      if($(document).find('.top-seller .crosssell-carousel .owl-item').length < 5 && $(window).width() > 375 ){  
                        $(document).find('.top-seller .crosssell-carousel').find('.owl-prev').hide(); 
                        $(document).find('.top-seller .crosssell-carousel').find('.owl-next').hide(); 
                      } 
                },1000);    
                  
                setTimeout(function(){  
                    clearInterval(myVar);  
                    if($(document).find('.top-seller .crosssell-carousel .owl-item').length < 5 && $(window).width() > 375 ){  
                        $(document).find('.top-seller .crosssell-carousel').find('.owl-prev').hide(); 
                        $(document).find('.top-seller .crosssell-carousel').find('.owl-next').hide(); 
                    } 
                },10000); 
            }
        });
    });    






