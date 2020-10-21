require([
    "modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api", 
    "shim!vendor/owl.carousel[jquery=jQuery]>jQuery"], function ($, Hypr, Backbone, api) {
	 
	$(document).ready(function () {
		var promosViewed = decodeURIComponent($.cookie("promosViewed") || '').split(';;;');
		if (promosViewed.length < 2)
			promosViewed = [];
		//console.log(promosViewed);
		if(promosViewed.length >= 2) {
			$("#homepage-brands-listing").before('<div id="promos-viewed-links" style="background: #B2CFD9; border: 3px solid #2086A8; border-radius: 10px; padding: 10px; margin-top: 5px; margin-bottom: 5px;"><p style="font-weight: bold; font-size: 20px; margin: 0px 0px;">PRODUCTS VIEWED FROM EMAIL</p></div>');
		for(var i = 0; i < promosViewed.length; i = i + 2) {
			$('#promos-viewed-links').append('<div><strong>SKU '+ promosViewed[i] +':</strong> <a href="/p/' + promosViewed[i] + '">'+promosViewed[i+1]+'</a></div>');
			}
		}

        var slideCount = $('.viewport_gallery_slide').length;
        var slideContent = $('.viewport_gallery_slide').html();
        //var owlDsk = $('#home_gallery .slides');
        runSlideShow();
        
        
        setInterval(function () {
            if($('.viewport_gallery_slide').length > 0 ){
                if( slideCount != $('.viewport_gallery_slide').length ){
                    runSlideShow();            
                }else if(slideContent !=  $('.viewport_gallery_slide').html()){
                    runSlideShow();            
                }  
            }else{
                slideCount = $('.viewport_gallery_slide').length;
            }
        }, 1000);
        
        
        function runSlideShow(){
            var owlDsk = $('#home_gallery .slides');
            owlDsk.owlCarousel({
                center:true,
                loop:true,
                margin:10,
                nav:true,
                dots: true,
                
                items:1,
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
                },
                enableResizeTime: 500
            });
        }

        var getRenderProductContext=function (substituteModel) {
            var model = (substituteModel || this.model).toJSON({ helpers: true });
            return {
                Model: model,
                model: model
            };
        };
	});

	});






