define(['modules/jquery-mozu', "modules/views-collections"], function($, CollectionViewFactory) {

   $(document).ready(function() {

        window.facetingViews = CollectionViewFactory.createFacetedCollectionViews({
            $body: $('[data-mz-search]'),
            $facets: $('[data-mz-facets]'),
            data: require.mozuData('facetedproducts')
        });
        
        
        
        var isCarousalLoaded = false;
        /*setInterval(function(){
            if(!isCarousalLoaded){
                var xx = $('.recommended-product').find('.MB_KS2');
                if(xx.length>0){
                    var x= xx.children()[0];
                    x.innerHTML = '<h3 style="padding-left: 15px;width: 100%;">Jelly Belly Also Recommends</h3>';
                    isCarousalLoaded = true;
                   // mybuyscarousal();
                }
            }
        }, 1000);*/
       /* console.log(document.getElementById('jb-pr-inline-iframe').contentWindow.document.body.innerHTML);
        setTimeout(function() { console.log($("#jb-pr-inline-iframe").contents()); },2000);
        $('#powerReview-inline-SEO').html($.trim($("#jb-pr-inline").contents().find('body').html()));*/
/*
        function mybuyscarousal(){
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
        }  */
        
         var width = $( window ).width();
            if(width > 767){
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






