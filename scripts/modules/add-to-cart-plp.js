

require([
    "modules/jquery-mozu",
    "underscore", 
    "hyprlive", 
    "modules/backbone-mozu", 
    'modules/api', 
    'modules/models-faceting',
    'modules/models-product',
    "modules/alert-popup",
    'modules/models-cart',
    'modules/cart-monitor',
    'modules/minicart'],
    function ($, _, Hypr, Backbone,Api, FacetingModels, ProductModels, alertPopup, CartModels, CartMonitor,MiniCart) {
        
        
    
    $(document).ready(function(){
        $(document).on('click', '.jb-add-to-cart', function(e) {
			e.preventDefault();
			var productCode = $(e.target).data("mz-prcode"),
                $quantity = $(e.target).parents('.jb-quickviewdetails').find('.qty .qty-'+productCode).val();
            if(typeof $.cookie("isSubscriptionActive") === "undefined") {
                addItemtoCart($(e.target),productCode,$quantity);
            }
            else {
                alertPopup.AlertView.fillmessage("first-dailog","You have started building a Subscription. Do you want to add this item to your Subscription?", function(result) {
                    if(!result) {
                        alertPopup.AlertView.fillmessage("second-dailog","We can't mix Subscription and non-Subscription items at this time. Do you want to remove the Subscription item(s) from the cart?", function(result1) {
                            if(result1) {
                                console.log("will clear cart and subscription related cookie & update cart with selected item as non-Subscription");
                                var cartModel = CartModels.Cart.fromCurrent();
                                try {
                                    // empty cart
                                    cartModel.apiEmpty().then(function(res) {
                                    alertPopup.AlertView.closepopup();
                                        // remove subscription cookie
                                        $.removeCookie("isSubscriptionActive",{path:"/"});
                                        $.removeCookie("scheduleInfo",{path:"/"});

                                        addItemtoCart($(e.target),productCode,$quantity,'subs');
                                    });
                                }
                                catch(e){
                                    console.error(e);
                                }
                            }
                            else {
                                alertPopup.AlertView.closepopup();
                                console.log("do nothing, keep cart as it is!");
                            }
                        });
                    } else {
                        // add product as subscription
                        console.log("add product as subscription");
                        alertPopup.AlertView.closepopup();
                        addItemtoCart($(e.target),productCode,$quantity,'subs');
                    }
                });
            }
			
            
        });
        
        $(document).on('click', '.jb-subscribe', function(e) {
            e.preventDefault();
            var productCode = $(e.target).data("mz-prcode"),
                $quantity = $(e.target).parents('.jb-quickviewdetails').find('.qty .qty-'+productCode).val();
            if (typeof $.cookie("isSubscriptionActive") === "undefined") {
                alertPopup.AlertView.fillmessage("subscribe","You can subscribe to this item (and others) to get regular deliveries on your own schedule! Click below to start the process.", function(result) {
                    if(result) {
                        var prdCode = e.target.getAttribute("data-jb-pid");
                        window.location.href="/subscriptions?q="+prdCode;
                    } else {
                        alertPopup.AlertView.closepopup();
                    }
                });
            }
            else {
                alertPopup.AlertView.fillmessage("first-dailog","You have already started building a Subscription. Do you want to add this item to your Subscription?", function(firstChoice) {
                    if (!firstChoice) {
                        alertPopup.AlertView.fillmessage("second-dailog", "Proceeding will ignore your previously-started Subscription and allow you to set up a new Subscription.", function(secondChoice) {
                            if (secondChoice) {
                                var cartModel = CartModels.Cart.fromCurrent();
                                try {
                                    // empty cart
                                    cartModel.apiEmpty().then(function(res) {
                                        $.removeCookie("isSubscriptionActive",{path:"/"});
                                        $.removeCookie("scheduleInfo");
                                        var prdCode = e.target.getAttribute("data-jb-pid");
                                        window.location.href="/subscriptions?q="+prdCode;
                                    }); 
                                } catch(e) {
                                    console.error(e);
                                }
                            }
                            else {
                                alertPopup.AlertView.closepopup();
                            }
                        });
                    } else {
                        console.log("add product as subscription");
                        alertPopup.AlertView.closepopup();
                        // me.checkPriceQuantity().then(function(s){
                        //     console.log(s);
                        //     CartMonitor.update();
                        // });
                        
                        addItemtoCart($(e.target),productCode,$quantity,'subs');
                        // setTimeout(function() {
                        //     if($(".mz-messagebar").find(".is-showing.mz-errors").length > 0){
                        //         if($(".mz-messagebar").find(".is-showing.mz-errors>li").html().indexOf("Validation Error") > -1) {
                        //             return false;
                        //         }
                        //     } else {
                        //         var cartModel = CartModel.Cart.fromCurrent();
                        //         try {
                        //             cartModel.apiGet().then(function(cart) {
                        //                 console.info(cart.data);
                        //                 cartModel.apiCheckout().then(function(cartId) {
                        //                     console.log(cartId.data.id);
                        //                     window.location.href = "/checkout/" + cartId.data.id + "?checkoutsubsc=yes";
                        //                 },function(err) {
                        //                     console.warn(err);
                        //                 });
                        //             },function(e) {
                        //                 console.warn(e);
                        //             });
                        //         } catch (e) {
                        //             console.warn(e);
                        //         }
                        //     }
                        // }, 300);
                    }
                });
            }
        });
        
        function addItemtoCart($target,productCode,$quantity,isSubs) { 
            $('[data-mz-productlist],[data-mz-facets]').addClass('is-loading');
              //  var $target = (!isSubs) ? $(e.currentTarget) : $(e.target);
                $('[data-mz-message-bar]').hide();
               // $target.addClass('is-loading'); 
               
                var count = parseInt($quantity,10);
           // var $quantity = $(e.target.parentNode.parentNode).find('#quantity')[0].options[$(e.target.parentNode.parentNode).find('#quantity')[0].options.selectedIndex];
            //var count = parseInt($quantity.innerHTML,10);
             
                Api.get('product', productCode).then(function(sdkProduct) {
                    var PRODUCT = new ProductModels.Product(sdkProduct.data);
                    var variantOpt = sdkProduct.data.options;
                    
                    if(variantOpt !== undefined && variantOpt.length>0){  
                        var newValue = $target.parent().parent().find('[plp-giftcart-prize-change-action]')[0].value;
                        var ID =  $target.parent().parent().find('[plp-giftcart-prize-change-action]')[0].getAttribute('data-mz-product-option');
                        if(newValue != "Select gift amount" && newValue !== ''){
                            var option = PRODUCT.get('options').get(ID);
                            var oldValue = option.get('value');
                            if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                                option.set('value', newValue);
                            }
                            setTimeout(function(){
                                    addToCartAndUpdateMiniCart(PRODUCT,count);
                            },2000);
                        }else{
                            showErrorMessage("Please choose the Gift Card amount before adding it to your cart. <br> Thanks for choosing to give a Jelly Belly Gift Card!");
                            //$target.removeClass('is-loading');
                        }
                    }else{
                        var pro = PRODUCT;
                        var qntcheck = 0;
                        $.each(MiniCart.MiniCart.getRenderContext().model.items,function(k,v){
                            if(v.product.productCode == pro.get('productCode') && ((v.quantity + count) > 50)){ 
                                qntcheck = 1;
                            }
                        });
                        if(pro.get('price.price') === 0 && MiniCart.MiniCart.getRenderContext().model.items.length > 0 ){
                            //console.log(MiniCart);
                            var cartItems = MiniCart.MiniCart.getRenderContext().model.items;
                            var len = cartItems.length;
                            for(var i=0;i<len;i++){
                                if(cartItems[i].product.productCode === pro.get('productCode')){
                                    if(cartItems[i].product.price.price === pro.get('price.price')){
                                        $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                                        //$target.removeClass('is-loading');
                                        $('.zero-popup').show();
                                        return false;
                                    }
                                }
                            }
                            addToCartAndUpdateMiniCart(PRODUCT,count);
                        }else if(qntcheck){
                            $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                            //$target.removeClass('is-loading');
                            $(".items-per-order").show(); 
                            return false;    
                        }else{
                            addToCartAndUpdateMiniCart(PRODUCT,count);
                        }
                    }
                });
            
            
        }
        
        
        //Gift card option change functionality - set variation product code whle changing the option for product, and set it as main product.
        $(document).on('change','[plp-giftcart-prize-change-action]',function(e){
            var $optionEl = $(e.currentTarget);
            var newValue = $optionEl.val();
            var ax = $optionEl.parent().parent().find('.jb-add-to-cart');
            if(newValue != "Select gift amount"){
                ax.text("Add to Cart");  
                ax.removeClass('gift-prize-select');
            }else{ 
                ax.text("SELECT GIFT AMOUNT");
                ax.addClass('gift-prize-select');
            }
            
        });
        
        
        function showErrorMessage(msg){
            $('[data-mz-message-bar]').empty();
            $('[data-mz-message-bar]').append('<p>'+msg+'</p>');
            $('[data-mz-message-bar]').fadeIn(); 
            setTimeout(function(){
                $('[data-mz-message-bar]').hide();
            },4000);
            $('.jb-inner-overlay').remove();
            // $("html, body").animate({scrollTop:  $(".mz-l-paginatedlist").offset().top }, 1000);
        }
        
        
        function addToCartAndUpdateMiniCart(PRODUCT,count){
                    PRODUCT.set({'quantity':count});
                    //$target.addClass('is-loading');
                    PRODUCT.addToCart(1);
                    PRODUCT.on('addedtocart', function(attr) {
                        $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                       // $target.removeClass('is-loading');
                        CartMonitor.update();
                        MiniCart.MiniCart.showMiniCart();
                        PRODUCT = '';
						brontoObj.build(Api);
                        $(document).find('.confirm-popup-body').removeClass('active');
                        $(document).find('body').removeClass('has-popup');
						
                    });
                Api.on('error', function (badPromise, xhr, requestConf) {
                    showErrorMessage(badPromise.message);
                   // $target.removeClass('is-loading');
                });
        }
    });
    });


