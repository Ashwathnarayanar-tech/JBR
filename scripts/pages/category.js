define(['modules/jquery-mozu', "modules/views-collections","shim!vendor/owl.carousel[jquery=jQuery]>jQuery"], 
    function($, CollectionViewFactory) {

    $(document).ready(function() {
        
        window.facetingViews = CollectionViewFactory.createFacetedCollectionViews({
            $body: $('[data-mz-category]'),
            $facets: $('[data-mz-facets]'),
            data: require.mozuData('facetedproducts') 
        });
        
        
        /*var isCarousalLoaded = false;
        setInterval(function(){
            if(!isCarousalLoaded){
                var xx = $('.recommended-product').find('.MB_CAT2');
                if(xx.length>0){
                    var x= xx.children()[0];
                    x.innerHTML = '<h3 style="padding-left: 9%;width: 100%;">Jelly Belly Also Recommends</h3>';
                    isCarousalLoaded = true;
                    mybuyscarousal();
                }
            }
        }, 1000);*/
        
        /*function mybuyscarousal(){
            if($(window).width() < 800){
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
        } */
            var width = $( window ).width();
            if(width > 1024){ 
                $(document).on({
                    mouseenter: function () {
                        if(!$(this).parent().parent().parent().hasClass('mz-productlist-list')){
                        $(this).parent().find('.img-overlay').show();
                        $(".gridder-expanded-content .img-overlay").hide();
                         }
                    },
                    mouseleave: function () {
                        $('.img-overlay').hide();
                    }
                }, ".mz-productlisting-image, .img-overlay");
            }
            
    });
    
    
    require(["modules/paging-controls","modules/add-to-cart-plp"]);
});





