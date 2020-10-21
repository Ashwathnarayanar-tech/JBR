define([
    "modules/jquery-mozu", 
    "hyprlive", 
    'modules/api',
    "modules/backbone-mozu",
    'modules/models-product',
    'modules/cart-monitor',
    'modules/models-cart',
    'underscore'
  ],function ($, Hypr,Api, Backbone, ProductModels,CartMonitor, CartModels, _) {

        /**
         * Mini cart mozu view 
         **/ 
        var utag_data;
            var checkMy = false,myCart ; 
        var MiniCartView = Backbone.MozuView.extend({  
            templateName: "modules/page-header/softcart",
            coldpack:true,
            getRenderContext: function () {
                if(require.mozuData("pagecontext").pageType != "cart") {  
                    // add a free product js 
                    window.cartModel.checkBOGA();   
                } 
                this.customDiscount();   
                var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
                var cartId = [],cartQty = [], cartPrice = [];
                c.model.items.reverse(); 
                for(var i=0; i<c.model.items.length;i++) {
                    var data = ""+c.model.items[i].quantity;
                    var data1 = ""+c.model.items[i].product.price.salePrice;
                    cartId.push(c.model.items[i].product.productCode);
                    cartQty.push(data);
                    cartPrice.push(data1);
                }
                
                var total=c.model.discountedTotal;
                if(total<Hypr.getThemeSetting('freeshippingBoundingValue')){
                    var amt=Hypr.getThemeSetting('freeshippingBoundingValue') - total;
                    c.model.remainingfreeshippinng=  parseFloat(amt.toFixed(2),10);
                }else{
                    c.model.remainingfreeshippinng=0;
                }
				
				c.model.hasHeatSensitive = false;
				if(Hypr.getThemeSetting('showHeatSensitiveText')) {
					for (var x = 0; x < c.model.items.length; x++){
						var properties = c.model.items[x].product.properties;
						for (var y = 0; y < properties.length; y++)
						{
							if (properties[y].attributeFQN === 'tenant~IsHeatSensitive')
							{
								//console.log(properties[y].values[0].value);
								if(properties[y].values[0].value) {
									c.model.hasHeatSensitive = true;
								}
							}
						}
					}
				}
                //console.log(JSON.stringify(cartId));
               /*  Tealium Trigger */ 
               //console.log(utag_data);
               /* require(['pages/jb-tealium'], function() {
                    setTimeout(function() {
                        myCart =  setInterval(function(){cartTimer();}, 800);
                    }, 200);
                    function cartTimer() {
                        if(utag_data) {
                          clearInterval(myCart);
                          var updated_json = {
                                    cart_product_id: cartId, 
                                    cart_product_quantity: cartQty,
                                    cart_product_unit_price: cartPrice
                                  };
                          utag_data =  $.extend({}, utag_data,updated_json); 
                        }
                    }
                });*/

                $(".softCartId").html(JSON.stringify(cartId));
                $(".softCartQty").html(JSON.stringify(cartQty));
                $(".softCartPrice").html(JSON.stringify(cartPrice));
                //$('.mz-utilitynav-link-cart').data('tealium',JSON.stringify(cartItem));
               // console.log($('.mz-utilitynav-link-cart').data("tealium"));
                if(checkMy && c.model.items.length) c.model.items[0].initMybuys = true;
                
                // Progress bar
                var self = this;
                if(c.model.total > 0){
                    $(document).find('.progress-bar').show();
                    setTimeout(function(){self.progressbar(c.model.total, false);},1000);                    
                }else{
                    setTimeout(function(){self.progressbar(c.model.total, false);$(document).find('.progress-bar').hide();},1000);                        
                }     
                return c;  
            },   
            progressbar: function(total,hasheatsensitive){ 
                $(document).find(".meter").find("span").each(function() {
                    var currentWidth = $(this).width();
                    var per = 0;
                    if(total < Hypr.getThemeSetting('minimumOrderAmount')) {
                        per = total * 100/Hypr.getThemeSetting('minimumOrderAmount');
                    } else {
                        per = total * 100/Hypr.getThemeSetting('freeshippingBoundingValue');
                    }
                    per = Math.floor(per).toFixed(0);  
                    window.progressBar = false;
                    if(per < 100) {
                        $(document).find('.progress-bar').show(); 
                        $(document).find('.progress-bar').css("visibility","visible");
                        $(this).css('width',per+"%");                      
                        $(this)
                            .data("origWidth", $(this).width())
                            .width(currentWidth)
                            .animate({
                                width: $(this).data("origWidth") 
                            }, 1200);  
                            
                            $(document).find('.meter').removeClass('green');
                            if(total < Hypr.getThemeSetting('minimumOrderAmount')) {
                                $(document).find('.meter').addClass('pale-yellow');  
                                $(document).find('.meter').removeClass('blue');
                            } else {
                                $(document).find('.meter').removeClass('pale-yellow');
                                if(!$(document).find('.meter').hasClass('blue')){
                                    $(document).find('.meter').addClass('blue');
                                }  
                            }
                            
                            if(per > 0 && !hasheatsensitive){
                                if(total < Hypr.getThemeSetting('minimumOrderAmount')) {
                                    $(document).find('.text-content').html("<strong>"+per+"% complete.</strong> Add $"+(Hypr.getThemeSetting('minimumOrderAmount')-total).toFixed(2)+" more to meet the Minimum Order Requirement!");
                                } else {
                                    $(document).find('.text-content').html("<strong>"+per+"% complete.</strong> Add $"+(Hypr.getThemeSetting('freeshippingBoundingValue')-total).toFixed(2)+" more to get Free Ground Shipping!");
                                }
                                
                                if($(document).find('body').hasClass('mz-category') || $(document).find('body').hasClass('mz-searchresults')){
                                    $(document).find('.mz-pageheader-desktop').addClass('topZero'); 
                                    if($(document).find('body').hasClass('mz-category') && !$(document).find('body').hasClass('mz-searchresults') && $(window).width() > 767){
                                        $(document).find('.mz-l-pagecontent').addClass('topZero');
                                    }else if($(window).width() > 767){
                                        $(document).find('.mz-l-pagecontent').addClass('topZero');    
                                    }   
                                } 
                                if($(window).width() <= 767 && !$(document).find('body').hasClass('mz-checkout')){   
                                    if(total < Hypr.getThemeSetting('minimumOrderAmount')) {
                                        $(document).find('.text-content').html("Add $"+(Hypr.getThemeSetting('minimumOrderAmount')-total).toFixed(2)+" to place your order.");
                                    } else {
                                        $(document).find('.text-content').html("Add $"+(Hypr.getThemeSetting('freeshippingBoundingValue')-total).toFixed(2)+" for Free Ground Shipping.");
                                    }
                                    $(document).find('.mz-pageheader-mobile').addClass('zerotag-mobile');
                                    $(document).find('.mz-l-pagecontent').addClass('zerotag-mobile');
                                }   
                            }else if(per > 0 && hasheatsensitive) {
                                $(document).find('.progress-bar').show();   
                                $(document).find('.progress-bar').css("visibility","visible");
                                $(this).css('width',0+"%");                      
                                $(this)
                                    .data("origWidth", $(this).width())
                                    .width(currentWidth)
                                    .animate({
                                        width: $(this).data("origWidth")    
                                    }, 1200); 
                                $(document).find('.text-content').html("Orders with Heat-Sensitive Items must ship with Expedited Shipping.");
                                if($(document).find('body').hasClass('mz-category') || $(document).find('body').hasClass('mz-searchresults')){
                                    $(document).find('.mz-pageheader-desktop').addClass('topZero');
                                    if($(document).find('body').hasClass('mz-category') && !$(document).find('body').hasClass('mz-searchresults') && $(window).width() > 767){
                                        $(document).find('.mz-l-pagecontent').addClass('topZero');
                                    }else if($(window).width() > 767){
                                        $(document).find('.mz-l-pagecontent').addClass('topZero');    
                                    }
                                } 
                                if($(window).width() <= 767 && !$(document).find('body').hasClass('mz-checkout')){
                                    $(document).find('.mz-pageheader-mobile').addClass('zerotag-mobile');
                                    $(document).find('.mz-l-pagecontent').addClass('zerotag-mobile');
                                } 
                            }else{
                                $(document).find('.progress-bar').hide();
                                $(document).find('.progress-bar').css("visibility","hidden");
                                $(document).find('.text-content').html("Add $"+Hypr.getThemeSetting('minimumOrderAmount')+" more to meet the Minimum Order Requirement!");
                                if($(document).find('body').hasClass('mz-category') || $(document).find('body').hasClass('mz-searchresults')){
                                    $(document).find('.mz-pageheader-desktop').removeClass('topZero');
                                    if($(document).find('body').hasClass('mz-category') && !$(document).find('body').hasClass('mz-searchresults') && $(window).width() > 767){
                                        $(document).find('.mz-l-pagecontent').removeClass('topZero');
                                    }else if($(window).width() > 767){
                                        $(document).find('.mz-l-pagecontent').removeClass('topZero');    
                                    }   
                                } 
                                if($(window).width() <= 767 && !$(document).find('body').hasClass('mz-checkout')){
                                    $(document).find('.mz-pageheader-mobile').removeClass('zerotag-mobile');
                                    $(document).find('.mz-l-pagecontent').removeClass('zerotag-mobile');
                                } 
                            }
                    } 
                    else if(!hasheatsensitive){ 
                        $(document).find('.progress-bar').show();
                        $(document).find('.progress-bar').css("visibility","visible");
                        $(this).css('width',"100%");
                        $(this)
                            .data("origWidth", $(this).width())
                            .width(currentWidth)
                            .animate({
                                width: $(this).data("origWidth")
                            }, 1200); 
                            $(document).find('.meter').removeClass('blue');
                            $(document).find('.meter').removeClass('pale-yellow');
                            if(!$(document).find('.meter').hasClass('green')){
                                $(document).find('.meter').addClass('green');   
                            }
                            if(total < Hypr.getThemeSetting('freeshippingBoundingValue'))
                                $(document).find('.text-content').html("<strong>Congratulations,</strong> you have hit the Minimum Order Requirement!");
                            else $(document).find('.text-content').html("<strong>Congratulations,</strong> you qualify for Free Ground Shipping!");
                            
                            if($(document).find('body').hasClass('mz-category') || $(document).find('body').hasClass('mz-searchresults')){
                                $(document).find('.mz-pageheader-desktop').addClass('topZero');
                                if($(document).find('body').hasClass('mz-category') && !$(document).find('body').hasClass('mz-searchresults') && $(window).width() > 767){
                                    $(document).find('.mz-l-pagecontent').addClass('topZero');
                                }else if($(window).width() > 767){
                                    $(document).find('.mz-l-pagecontent').addClass('topZero');    
                                }  
                            }
                            if($(window).width() <= 767 && !$(document).find('body').hasClass('mz-checkout')){
                                if(total < Hypr.getThemeSetting('freeshippingBoundingValue'))
                                    $(document).find('.text-content').html("<strong>Congratulations,</strong> you have hit the Minimum Order Requirement!");
                                else $(document).find('.text-content').html("<strong>Congratulations,</strong> you qualify for Free Ground Shipping!");
                                
                                $(document).find('.mz-pageheader-mobile').addClass('zerotag-mobile');
                                $(document).find('.mz-l-pagecontent').addClass('zerotag-mobile');
                            } 
                    }else if(hasheatsensitive){
                        $(document).find('.progress-bar').show(); 
                        $(document).find('.progress-bar').css("visibility","visible");
                        $(this).css('width',0+"%");                      
                        $(this)
                            .data("origWidth", $(this).width())
                            .width(currentWidth)
                            .animate({
                                width: $(this).data("origWidth") 
                            }, 1200); 
                        $(document).find('.text-content').html("Orders with Heat-Sensitive Items must ship with Expedited Shipping.");
                        if($(document).find('body').hasClass('mz-category') || $(document).find('body').hasClass('mz-searchresults')){
                            $(document).find('.mz-pageheader-desktop').addClass('topZero');
                            if($(document).find('body').hasClass('mz-category') && !$(document).find('body').hasClass('mz-searchresults') && $(window).width() > 767){
                                $(document).find('.mz-l-pagecontent').addClass('topZero');
                            }else if($(window).width() > 767){
                                $(document).find('.mz-l-pagecontent').addClass('topZero');     
                            }    
                        } 
                        if($(window).width() <= 767 && !$(document).find('body').hasClass('mz-checkout')){
                            $(document).find('.mz-pageheader-mobile').addClass('zerotag-mobile');
                            $(document).find('.mz-l-pagecontent').addClass('zerotag-mobile');
                        }       
                    }else{
                        $(document).find('.progress-bar').hide();
                        $(document).find('.progress-bar').css("visibility","hidden");
                        $(document).find('.text-content').html("Add $"+Hypr.getThemeSetting('minimumOrderAmount')+" more to meet the Minimum Order Requirement!");    
                        if($(document).find('body').hasClass('mz-category') || $(document).find('body').hasClass('mz-searchresults')){
                            $(document).find('.mz-pageheader-desktop').removeClass('topZero');
                            if($(document).find('body').hasClass('mz-category') && !$(document).find('body').hasClass('mz-searchresults') && $(window).width() > 767){
                                $(document).find('.mz-l-pagecontent').removeClass('topZero');
                            }else if($(window).width() > 767){
                                $(document).find('.mz-l-pagecontent').removeClass('topZero');     
                            }   
                        }    
                        if($(window).width() <= 767 && !$(document).find('body').hasClass('mz-checkout')){
                            $(document).find('.mz-pageheader-mobile').removeClass('zerotag-mobile');
                            $(document).find('.mz-l-pagecontent').removeClass('zerotag-mobile');
                        } 
                    }
                }); 
            },
            makeApiCall: function(cartId, addCouponArray, removeCouponArray){
                var self = this;
                console.log(this);
                Api.request('POST', "/svc/custom_discount", {cartId: cartId, addCoupons:addCouponArray, removeCoupon:removeCouponArray }).then(function(res){ 
                    if(require.mozuData("pagecontext").pageType != "cart") {  
                        self.updateMiniCart();    
                    }else{ 
                        $(document).find('.trigger-render').trigger('click');  
                    }
                   
                }); 
            },    
            customDiscount:function(){  
                var self = this, nameSpace = '';
                if(window.location.host.indexOf('retailer') == -1){
                    nameSpace = "jbellyretailer";
                }else if(window.location.host.indexOf('retailer') != -1){
                     nameSpace = "jbelly";
                }
                var name = "custom_discount";     
                var entityListName = name+'@'+nameSpace;
                var res = Api.get('entity', {
                    listName : entityListName
                });
                res.then(function (resp) {
                    resp = resp.data;
                    var catItems = {}, discountApplyed = [];  
                    // console.log("custom discount"); 
                    // console.log(resp.items[0].TypeOfDiscount);   
                    if(resp.items.length > 0){
                        if(resp.items[0].TypeOfDiscount == "sets" || resp.items[0].TypeOfDiscount == "counts"){
                            catItems = cartModel.get('items').models.filter(function(ele){ 
                                if(!_.findWhere(ele.get('product').get('categories'),{id:(resp.items[0].CategoryCode)}) && (ele.get('total') > 0)){
                                    var res = ele.get('product').get('categories').filter(function(e){return e.parent && e.parent.id == (resp.items[0].CategoryCode);});
                                    if(res.length > 0){
                                        if(_.findWhere(ele.get('productDiscounts'),{couponCode:(ele.get('product').id)})){discountApplyed.push(_.findWhere(ele.get('productDiscounts'),{couponCode:(ele.get('product').id)}).couponCode);}
                                        return true;
                                    }else{  
                                        return false;  
                                    }  
                                }else if(ele.get('total') > 0){if(_.findWhere(ele.get('productDiscounts'),{couponCode:(ele.get('product').id)}) && (ele.get('total') > 0)){discountApplyed.push(_.findWhere(ele.get('productDiscounts'),{couponCode:(ele.get('product').id)}).couponCode);} return true; }else{return false;}}  
                            );
                            catItems.sort(function(a,b){return a.get('total')-b.get('total');}); 
                            catItems = catItems.filter(function(ele){ if(!_.findWhere(ele.get('productDiscounts'),{couponCode: ele.get('product').id}) && (discountApplyed.indexOf(ele.get('product').id) != -1)){return false;}else{return true;}});
                            if(resp.items[0].TypeOfDiscount == "counts"){  
                                if(catItems.length >= resp.items[0].datafeed){
                                    var addCouponProdCount = []; catItems.slice(0,resp.items[0].datafeed).filter(function(ele){ if(!_.findWhere(ele.get('productDiscounts'),{couponCode: ele.get('product').id})){  var temp = {};  temp.prodSKU = ele.get('product').id; addCouponProdCount.push(temp);}});
                                    var nextItemsCount = []; catItems.slice(resp.items[0].datafeed).filter(function(ele){ if(_.findWhere(ele.get('productDiscounts'),{couponCode: ele.get('product').id})){  var temp = {};  temp.prodSKU = ele.get('product').id; nextItemsCount.push(temp);}});
                                    if(addCouponProdCount.length > 0 || nextItemsCount.length > 0){  
                                        self.makeApiCall(cartModel.get('id'), addCouponProdCount, nextItemsCount);
                                    }   
                                    //console.log("add discount Counts");      
                                }else{
                                    var removeItemsCount = []; catItems.filter(function(ele){ if(_.findWhere(ele.get('productDiscounts'),{couponCode: ele.get('product').id})){  var temp = {};  temp.prodSKU = ele.get('product').id; removeItemsCount.push(temp);}});
                                    if(removeItemsCount.length > 0){
                                        self.makeApiCall(cartModel.get('id'), [], removeItemsCount);
                                    }   
                                    //console.log("remove discounts Counts");    
                                }    
                            }else if(resp.items[0].TypeOfDiscount == "sets"){
                                if(catItems.length >= resp.items[0].datafeed){
                                    var numSets = Math.floor(catItems.length/resp.items[0].datafeed);
                                    var addCouponProd = []; catItems.slice(0,(numSets*resp.items[0].datafeed)).filter(function(ele){ if(!_.findWhere(ele.get('productDiscounts'),{couponCode: ele.get('product').id})){  var temp = {};  temp.prodSKU = ele.get('product').id; addCouponProd.push(temp);}});
                                    var nextItems = []; catItems.slice((numSets*resp.items[0].datafeed)).filter(function(ele){ if(_.findWhere(ele.get('productDiscounts'),{couponCode: ele.get('product').id})){  var temp = {};  temp.prodSKU = ele.get('product').id; nextItems.push(temp);}});
                                    if(addCouponProd.length > 0 || nextItems.length > 0){  
                                        self.makeApiCall(cartModel.get('id'), addCouponProd, nextItems);
                                    } 
                                    //console.log("add discount Sets");  
                                }else{  
                                    var removeItems = []; catItems.filter(function(ele){ if(_.findWhere(ele.get('productDiscounts'),{couponCode: ele.get('product').id})){  var temp = {};  temp.prodSKU = ele.get('product').id; removeItems.push(temp);}});
                                    if(removeItems.length > 0){
                                        self.makeApiCall(cartModel.get('id'), [], removeItems);
                                    }
                                    //console.log("remove discounts Sets");    
                                }   
                            }    
                        }else if(resp.items[0].TypeOfDiscount == "specific"){
                            var inputSKUs = resp.items[0].datafeed.split(',');  
                            var specificApplayed = [];
                            catItems = cartModel.get('items').models.filter(function(ele){ return (inputSKUs.indexOf(ele.get('product').id) != -1 && ele.get('total') > 0)? true : false;} ); 
                            var addCouponProdSpecific = []; catItems.filter(function(ele){ if(!_.findWhere(ele.get('productDiscounts'),{couponCode: ele.get('product').id})){  var temp = {};  temp.prodSKU = ele.get('product').id; addCouponProdSpecific.push(temp);}else{ specificApplayed.push(ele.get('product').id); }});
                            addCouponProdSpecific = addCouponProdSpecific.filter(function(ele){ if(specificApplayed.indexOf(ele.prodSKU) != -1){return false;}else{return true;}});
                            var nextItemsSpecific = []; cartModel.get('items').models.filter(function(ele){ if(_.findWhere(ele.get('productDiscounts'),{couponCode: ele.get('product').id})){  var temp = {};  temp.prodSKU = ele.get('product').id; nextItemsSpecific.push(temp);}});
                            catItems = catItems.filter(function(ele){if(!_.findWhere(ele.get('productDiscounts'),{couponCode: ele.get('product').id}) && (specificApplayed.indexOf(ele.get('product').id) != -1)){return false;}else{return true;}});
                            if(catItems.length == inputSKUs.length){
                                if(addCouponProdSpecific.length > 0){
                                    self.makeApiCall(cartModel.get('id'), addCouponProdSpecific, []);
                                }
                                //console.log("add discount specific");    
                            }else{
                                if(nextItemsSpecific.length > 0){
                                    self.makeApiCall(cartModel.get('id'), [], nextItemsSpecific);      
                                }  
                                //console.log("remove discounts specific");
                            }
                        }
                    }
                //console.log("custom discount");
                }); 
            },  
            checkHeatSensitive:function(c){
                var heat= c.model.items;
                 for(var j=0;j<heat.length;j++){
                    var pro = heat[j].product.properties;
                    for(var k=0;k<pro.length;k++){
                        if(pro[k].attributeFQN == "tenant~IsHeatSensitive"){
                            if(pro[k].values[0].value){
                              return true;
                              
                            }
                        }
                    }
                 }    
                return false;
            },
            isColdPack:function(c){
                 var heat= c.model.items;
                 var productCode = Hypr.getThemeSetting('codePack');
                 for(var j=0;j<heat.length;j++){
                    if(heat[j].product.productCode == productCode){
                        if(heat[j].quantity>1){
                            cartModel.removeItem(heat[j].id);
                            return false;
                        }
                        else{
                            return true;
                        }
                    }
                       // coldProduct=heat[j];
                 }
                 return false;
            },
            showMiniCart: function(){
                checkMy = true;
                this.model.apiGet();
                
                //console.log(this.model);
                if(require.mozuData("pagecontext").pageType != "my_account"){
                    $('.jb-mobile-minicart-popup').fadeToggle('slow', function(){  
                        $('.jb-mobile-minicart-popup').delay(Hypr.getThemeSetting('mobileAddToCartPopupTimer') * 1000).fadeOut();
                    });
                    
                    $('.jb-minicart-popup').fadeToggle('slow',function(){
                        if(typeof $.cookie("isSubscriptionActive") !== "undefined") {
                            if($(window).width() > 767) {
                                $(document).find('.jb-minicart-checkout-container .cart-checkout-buttons').find('a').attr('href','/subscriptions');
                            }
                        }else{
                            if($(window).width() < 767) {
                                $(document).find('.jb-minicart-checkout-container .cart-checkout-buttons').find('a').attr('href','/cart');
                            }
                        }
                        $('.jb-minicart-popup').delay(6000).fadeOut();
                    });
                }
               // $(window).scrollTop(0);
            },
            updateMiniCart: function(){
                this.model.apiGet();
                if(typeof $.cookie("isSubscriptionActive") !== "undefined") {
                    if($(window).width() > 767) {
                        $(document).find('.mz-utilitynav-link-cart').attr('href','/subscriptions');
                    }
                }else{
                    if($(window).width() > 767) {
                       $(document).find('.mz-utilitynav-link-cart').attr('href','/cart');
                    }
                }
            },
			updateMiniCart2: function(qtyAdded){
				this.model.apiGet().then(function(something) { 
					Api.get('cartsummary').then(function (summary) {
						$('[data-mz-role="cartmonitor"]').text(summary.count());
					});
				});
            },
            showCartval: function() {
              //  console.log(this.model.apiGet());
            }
        });
        
        var cartModel  = window.cartModel = new CartModels.Cart(),
        miniCartView = new MiniCartView({
            el: $('[data-mz-minicart]'),
            model: cartModel
        });

    $(document).ready(function(){
        
        cartModel.apiGet();
        
        //mincart oriantation change 
        
        $( window ).on( "orientationchange", function( event ) {
            //alert("in change orientation");
            $(document).find('.progress-bar').show();
            //console.log(cartModel);  
            setTimeout(function(){miniCartView.progressbar(cartModel.get('total'), false);},500);                      
        });
        
        //Show hide mincart
        if(!!('ontouchstart' in window)){
            $(document).on({
                click: function (e) { 
                    if($('.jb-minicart-popup').css('display') == 'none'){
                        e.preventDefault();
                        e.stopPropagation();
                        cartModel.apiGet();
                        $('.jb-minicart-popup').show();
                    }
                }
            }, ".mz-utilitynav-link-cart,.jb-minicart-popup,.jb-mobile-minicart-popup");    
            $(document).click(function(e) {
                if(! ($('.jb-minicart-popup').is(e.target) || $('.mz-utilitynav-link-cart').is(e.target)) ){
                    if($('.jb-minicart-popup').css('display') == 'block'){
                        $('.jb-minicart-popup').hide();
                    }
                }else{
                    e.preventDefault();
                    cartModel.apiGet();
                    $('.jb-minicart-popup').show();
                }
            });
        }else{
            $(document).on({
                mouseenter: function () { 
                    // cartModel.apiGet();
                    $('.jb-minicart-popup').show();
                    if(typeof $.cookie("isSubscriptionActive") !== "undefined") {
                        if($(window).width() > 767) {
                            $(document).find('.jb-minicart-checkout-container .cart-checkout-buttons').find('a').attr('href','/subscriptions');
                        }
                    }else{
                        if($(window).width() < 767) {
                            $(document).find('.jb-minicart-checkout-container .cart-checkout-buttons').find('a').attr('href','/cart');
                        }
                    }
                },
                mouseleave: function () {
                    $('.jb-minicart-popup').hide();
                }
            }, ".mz-utilitynav-link-cart,.jb-minicart-popup");
        }
        //  miniCartView.render();
       
        window.miniCartView = miniCartView;  
              
        // $('.jb-mobile-minicart-popup').css({ display: "block" });

        $('body').delegate('.close-mobile-minicart-popup','click', function(){
            $(".jb-mobile-minicart-popup").hide();
        });
        
        $(document).on("click",".orderNotAllowed", function(e) {
            e.preventDefault();
            //alert("preventing submit");
            $(".overlay-for-complete-page").show();
            $(".minimumorder-alert").show();
        });
        
        $(document).on("click",".btn.accept", function() {
            $(".overlay-for-complete-page").hide();
            $(".minimumorder-alert").hide();
            if(require.mozuData("pagecontext").pageType === "cart" && $(".mz-table-cart").hasClass("is-loading")) {
                $(".mz-table-cart").removeClass("is-loading");
            }
        });
        //update subscription URL
        setTimeout(function(){
            if(typeof $.cookie("isSubscriptionActive") !== "undefined") {
                if($(window).width() > 767) {
                    $(document).find('.jb-minicart-checkout-container .cart-checkout-buttons').find('a').attr('href','/subscriptions');
                }
            }else{
                if($(window).width() < 767) {
                    $(document).find('.jb-minicart-checkout-container .cart-checkout-buttons').find('a').attr('href','/cart');
                }
            }
        },4000);

        if(typeof $.cookie("isSubscriptionActive") !== "undefined") {
            $(document).on("submit", "#cartform", function(e){
                e.preventDefault();
                window.location.href = "/subscriptions";
            });
        }
    });
    
    return { MiniCart:miniCartView };
});
