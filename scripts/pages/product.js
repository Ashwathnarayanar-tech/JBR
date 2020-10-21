// Made chages for Read Review By Amit on 25June from line 242 to 259
require(["modules/jquery-mozu", 
"underscore", "hyprlive", "modules/backbone-mozu", 'modules/api', "modules/alert-popup",
"modules/cart-monitor", "modules/models-product", "modules/views-productimages", 
'modules/minicart',
"modules/models-cart",
"modules/review_snippet",  
"modules/jquery-dateinput-localized", "shim!vendor/owl.carousel[jquery=jQuery]>jQuery","modules/recentlyviewed"],
function ($, _, Hypr, Backbone, Api, alertPopup, CartMonitor, ProductModels, ProductImageViews, MiniCart, CartModel, PowerReviews) {
    
    var ProductView = Backbone.MozuView.extend({
        templateName: 'modules/product/product-detail',
        autoUpdate: ['quantity'],
        additionalEvents: {
            "change [data-mz-product-option]": "onOptionChange",
            "blur [data-mz-product-option]": "onOptionChange",
            "change .mz-productdetail-qty": "fixture"              
        },
       
        fixture: function(){
            var a=$('.mz-productdetail-qty').is(':checked');
            var me= this;
            var prototal = me.model.get("custom");
            var list="custom";
            if(a){
                var product={
                    pcode:me.model.get('productCode'),
                    qty: 1,
                    price: parseFloat(me.model.get('price.salePrice')).toFixed(2),
                    name: me.model.get('content.productName'),
                    total: ''
                };   
                product.total =  parseFloat(product.price * product.qty).toFixed(2);
                me.model.get("custom").push(product);      
                me.total(prototal,list); 
                me.render();
                $('#check').parent().css('background-color','#e28104');
                $('#addtobasket').attr('disabled',false);
            }else{
                $('#check').parent().css('background-color','#e3e3e3');
                $('#check').parent().css('cursor','not-allowed');
                 $('#addtobasket').attr('disabled',true);
                $.each(prototal, function(i,v){
                    if(v.pcode== me.model.get('productCode')){
                        prototal.splice(i,1);  
                        me.total(prototal,list);
                        me.render();  
                        return false;
                    }   
                });
            }
        },
       
        addTobasket:function(){
            var products=[];
            if(this.model.get('custom').length>0){
                products= this.model.get('custom');
            }
            if(this.model.get("custompro").length>0){ 
                var prolist = this.model.get("custompro");
                products = products.concat(prolist);
            }
      
        var errorArray = [], self = this, productAdded = 0,time = 1500;    
            $(products).each(function(key,pid){
                setTimeout(function(){
                var count = pid.qty;
                Api.get('product', pid.pcode).then(function(sdkProduct) {
                    var PRODUCT = new ProductModels.Product(sdkProduct.data);
                    PRODUCT.set({'quantity':pid.qty});
                    PRODUCT.addToCart();
                        PRODUCT.on('addedtocart', function(attr) {
                        productAdded++;
                        CartMonitor.update();
                        MiniCart.MiniCart.showMiniCart();
                        PRODUCT = ''; 
                        //console.log(attr.data.product.name);
                        /*if(productAdded  === products.length ){
                            self.showMessages(errorArray, productAdded);
                        }*/
                    });
                    Api.on('error', function (badPromise, xhr, requestConf) {
                        productAdded++;
                        errorArray.push(badPromise.message);
                        /*if(productAdded  === products.length ){
                            self.showMessages(errorArray, productAdded);
                        }*/
                    });
                },function(errorResp){
                    errorArray.push(errorResp.message);
                   /* if(productAdded  === products.length - 1){
                        self.showMessages(errorArray, productAdded);
                    }*/
                });
                },time);
                time+=1000;
            });
            
            
        },
        
        getRenderContext: function () {
                var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
                c.model.reviewsCount = 0;
                c.model.ratingVal = 0;
                c.model.ratingClass = 'zero';
                
                $.each(c.model.properties, function(index,item){
                    // if(item.attributeFQN == 'tenant~mixed-variants'){
                    //     c.model.mixvar = item.values[0].value;
                    // }
                    if(item.attributeFQN == 'tenant~sku'){
                        c.model.SKU = item.values[0].value;
                    }
                    /*if(item.attributeFQN == 'tenant~review'){
                        c.model.reviewsCount = item.values[0].value;
                    }*/
                   /* if(item.attributeFQN == 'tenant~rating'){
                        c.model.ratingVal = item.values[0].value;
                    }
                    if(item.attributeFQN == 'tenant~rating'){
                        var tenantRating = item.values[0].value;
                        var tenantRatingClass = "zero";
                        if( tenantRating === 0){
                            tenantRatingClass = 'zero';
                        }else if( tenantRating < 0.6 ){
                            tenantRatingClass = 'half';
                        }else if( tenantRating < 1.1 ){
                            tenantRatingClass = 'one';
                        }else if( tenantRating < 1.6 ){
                            tenantRatingClass = 'onehalf';
                        }else if( tenantRating < 2.1 ){
                            tenantRatingClass = 'two';
                        }else if( tenantRating < 2.6 ){
                            tenantRatingClass = 'twohalf';
                        }else if( tenantRating < 3.1 ){
                            tenantRatingClass = 'three';
                        }else if( tenantRating < 3.6 ){
                            tenantRatingClass = 'threehalf';
                        }else if( tenantRating < 4.1 ){
                            tenantRatingClass = 'four';
                        }else if( tenantRating < 4.6 ){
                            tenantRatingClass = 'fourhalf';
                        }else {
                            tenantRatingClass = 'five';    
                        }
                        c.model.ratingClass = tenantRatingClass;
                    }*/
                }); 
                c.model.savePrice = (c.model.savePrice).toFixed(2);
                
               
                return c;
        },
        
        savePercentage:function(me){
            
            var savePrice = me.model.get('savePrice');
            var price = me.model.get('price').get('price');
            var savePercenatage = (savePrice/price)*100;
            
            return Math.floor(savePercenatage);
            
        },
        
        render: function () { 
            var me = this;
            this.model.attributes.savePrice = this.model.attributes.price.attributes.price - this.model.attributes.price.attributes.salePrice;
            me.model.set('isFutureProduct',window.shipDate);
             //crosssellll     
                      /*    var owlArtThump = $('.mz-productlist-carousel ul');
                    owlArtThump.owlCarousel({
                        loop:true,
                        nav:true,
                        margin:2,
                        dots:false,
                        responsiveClass:true,
                        responsive:{
                            0:{
                                items:1
                            },
                            400:{
                                items:3
                            },
                            600:{
                                items:4
                            },
                            1000:{
                                items:5
                            }
                        }
                    });*/
            
            Backbone.MozuView.prototype.render.apply(this);
            
            if(typeof window.productView.model != "undefined") {
                $(".oos-msg").show();
            }

            // fill the user email id if product is out of stock.
            if($(document).find('#mz-instock-request-email').filter(':visible').length > 0){
                $(document).find('#mz-instock-request-email').val(decodeURIComponent(jQuery.cookie('userData'))); 
            }

             var percenatge = this.savePercentage(me);
            $('.savepercentage').text(percenatge);
            
            this.$('[data-mz-is-datepicker]').each(function (ix, dp) {
                $(dp).dateinput().css('color', Hypr.getThemeSetting('textColor')).on('change  blur', _.bind(me.onOptionChange, me));
            });
            
        var prototal = me.model.get("custom");
            var dis=me.model.get('subtotal');
            $.each(prototal, function(i,v){
                if(v.pcode== me.model.get('productCode')){
                    $('.mz-productdetail-qty').attr('checked',true);
                }
            });  
            if($('.mz-productdetail-qty').is(':Checked')){
                $('#check').parent().css('background-color','#e28104');
            }else{
                $('#check').parent().css('background-color','#e3e3e3');
            }
            if(me.model.get('custom').length>0 ||  me.model.get('custompro').length>0){
                
              //  $('.fixture_cart').attr('disabled',false);
                 $('#addtobasket').attr('disabled',false);
                // $('').css("background","rgba(244,124,32,0.61)");
              //  $('.fixture_cart').addClass('addtocart1');
              //  $('.fixture_cart').removeClass('addtocart2');
            }else{
               // $('.fixture_cart').attr('disabled',true);
                 $('#addtobasket').attr('disabled',true);
               //  $('.fixture_cart').addClass('addtocart2');
               //  $('.fixture_cart').removeClass('addtocart1');
            }
           
           
        },
        
        onOptionChange: function (e) {
            return this.configure($(e.currentTarget));
        },
        
        configure: function ($optionEl) {
            var newValue = $optionEl.val(),
                oldValue,
                id = $optionEl.data('mz-product-option'),
                optionEl = $optionEl[0],
                isPicked = (optionEl.type !== "checkbox" && optionEl.type !== "radio") || optionEl.checked,
                option = this.model.get('options').get(id);
            if (option) {
                if (option.get('attributeDetail').inputType === "YesNo") {
                    option.set("value", isPicked);
                } else if (isPicked) {
                    oldValue = option.get('value');
                    if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                        option.set('value', newValue);
                    }
                }
            }
        },
        addToCart: function () { // v.r.s changes
            if(typeof $.cookie("isSubscriptionActive") != "undefined") {
                var me = this;
                alertPopup.AlertView.fillmessage("first-dailog","You have started building a Subscription. Do you want to add this item to your Subscription?", function(result) {
                    console.log(result);
                    if(!result) {
                        alertPopup.AlertView.fillmessage("second-dailog","We can't mix Subscription and non-Subscription items at this time. Do you want to remove the Subscription item(s) and proceed with a one-time order?", function(result1) {
                            console.log(result1);
                            if(result1) {
                                console.log("will clear cart and subscription related cookie & update cart with selected item as non-Subscription");
                                var cartModel = CartModel.Cart.fromCurrent();
                                try {
                                    // empty cart
                                    cartModel.apiEmpty().then(function(res) {
                                    alertPopup.AlertView.closepopup();
                                        // remove subscription cookie
                                        $.removeCookie("isSubscriptionActive",{path:"/"});
                                        $.removeCookie("scheduleInfo",{path:"/"});

                                        me.checkPriceQuantity().then(function(s) {
                                            console.log(s);
                                            CartMonitor.update();
                                        });
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
                        me.checkPriceQuantity().then(function(s){
                            console.log(s);
                            CartMonitor.update();
                        });
                    }
                });  
            } else {
                this.checkPriceQuantity().then(function(s){
                    console.log(s);
                    CartMonitor.update();
                });
            }
        },
        checkPriceQuantity: function() { // v.r.s changes
            var pro = this.model;
            var qntcheck = 0;
            // changed to return promise
            return new Promise(function(resolve, reject) {
                $.each(MiniCart.MiniCart.getRenderContext().model.items,function(k,v){
                    if(v.product.productCode == pro.get('productCode') && ((v.quantity + pro.get('quantity')) > 50)){   
                        qntcheck = 1;
                    }
                }); 
                if(pro.get('price.price') === 0 && MiniCart.MiniCart.getRenderContext().model.items.length > 0 ){
                    var cartItems = MiniCart.MiniCart.getRenderContext().model.items;
                    var len = cartItems.length;
                    for(var i=0;i<len;i++){
                        if(cartItems[i].product.productCode === pro.get('productCode')){
                            if(cartItems[i].product.price.price === pro.get('price.price')){
                                 $('.zero-popup').show();
                                return false;
                            }
                        }
                    }
                    pro.addToCart();
                    resolve("added");
                }else if(qntcheck){ 
                   // $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                    //$target.removeClass('is-loading'); 
                    $('.items-per-order').show();  
                    return false; 
                }else{
                    pro.addToCart();
                    resolve("added");
                }
            });
            
            //Older version of the above code
            // $.each(MiniCart.MiniCart.getRenderContext().model.items,function(k,v){
            //     if(v.product.productCode == pro.get('productCode') && ((v.quantity + pro.get('quantity')) > 50)){   
            //         qntcheck = 1;
            //     }
            // }); 
            // if(pro.get('price.price') === 0 && MiniCart.MiniCart.getRenderContext().model.items.length > 0 ){
            //     var cartItems = MiniCart.MiniCart.getRenderContext().model.items;
            //     var len = cartItems.length;
            //     for(var i=0;i<len;i++){
            //         if(cartItems[i].product.productCode === pro.get('productCode')){
            //             if(cartItems[i].product.price.price === pro.get('price.price')){
            //                  $('.zero-popup').show();
            //                 return false;
            //             }
            //         }
            //     }
            //     this.model.addToCart().then(function(res){
            //         CartMonitor.update();
            //     });
            // }else if(qntcheck){ 
            //   // $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
            //     //$target.removeClass('is-loading'); 
            //     $('.items-per-order').show();  
            //     return false; 
            // }else{
            //     this.model.addToCart().then(function() {
            //         CartMonitor.update();
            //     });
            // }
        },
        addToWishlist: function () {
            this.model.addToWishlist();
        },
        subscribe: function(e) { // v.r.s changes
            var me = this;
            if (typeof $.cookie("isSubscriptionActive") === "undefined") {
                alertPopup.AlertView.fillmessage("subscribe","You can subscribe to this item (and others) to get regular deliveries on your own schedule! Click below to start the process.", function(result) {
                    if(result){
                        var prdCode = e.target.getAttribute("data-jb-pid");
                        window.location.href="/subscriptions?q="+prdCode;
                    } else {
                        alertPopup.AlertView.closepopup();
                    }
                });
            } else {
                alertPopup.AlertView.fillmessage("first-dailog","You have already started building a Subscription. Do you want to add this item to your Subscription?", function(firstChoice) {
                    if (!firstChoice) {
                        alertPopup.AlertView.fillmessage("second-dailog", "Proceeding will ignore your previously-started Subscription and allow you to set up a new Subscription.", function(secondChoice) {
                            if (secondChoice) {
                                var cartModel = CartModel.Cart.fromCurrent();
                                try {
                                    // empty cart
                                    cartModel.apiEmpty().then(function(res) {
                                        console.log(res);
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
                        alertPopup.AlertView.closepopup();
                        me.checkPriceQuantity().then(function(s){
                            CartMonitor.update();
                        });
                        setTimeout(function(){
                            if($(".mz-messagebar").find(".is-showing.mz-errors").length > 0){
                                if($(".mz-messagebar").find(".is-showing.mz-errors>li").html().indexOf("Validation Error") > -1) {
                                    return false;
                                }
                            } /*else {
                                var cartModel = CartModel.Cart.fromCurrent();
                                try {
                                    cartModel.apiGet().then(function(cart) {
                                        cartModel.apiCheckout().then(function(cartId) {
                                            window.location.href = "/checkout/" + cartId.data.id + "?checkoutsubsc=yes";
                                        },function(err) {
                                            console.warn(err);
                                        });
                                    },function(e) {
                                        console.warn(e);
                                    });
                                } catch (e) {
                                    console.warn(e);
                                }
                            }*/
                        }, 300);
                    }
                });
            }
        },
        checkLocalStores: function (e) {
            var me = this;
            e.preventDefault();
            this.model.whenReady(function () {
                var $localStoresForm = $(e.currentTarget).parents('[data-mz-localstoresform]'),
                    $input = $localStoresForm.find('[data-mz-localstoresform-input]');
                if ($input.length > 0) {
                    $input.val(JSON.stringify(me.model.toJSON()));
                    $localStoresForm[0].submit();
                }
            });

        },
        
        setTestimonial: function() { 
            var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            
            var testimonials = [
                {
                  name: "",
                  city: "",
                  state: "",
                  quote: ""
                },
                {
                  name: "",
                  city: "",
                  state: "",
                  quote: ""
                },
                {
                  name: "",
                  city: "",
                  state: "",
                  quote: ""
                }
                ];
            var t = 0;
            $.each(c.model.properties, function(index,item){
                    if(item.attributeFQN == 'tenant~testimonial-data-1') { 
                        testimonials[0].name = item.values[0].value.split(',')[0];
                        testimonials[0].city = item.values[0].value.split(',')[1];
                        testimonials[0].state = item.values[0].value.split(',')[2];
                    }
                    else if(item.attributeFQN == 'tenant~testimonial-data-2') { 
                        testimonials[1].name = item.values[0].value.split(',')[0];
                        testimonials[1].city = item.values[0].value.split(',')[1];
                        testimonials[1].state = item.values[0].value.split(',')[2];
                    }
                    else if(item.attributeFQN == 'tenant~testimonial-data-3') { 
                        testimonials[2].name = item.values[0].value.split(',')[0];
                        testimonials[2].city = item.values[0].value.split(',')[1];
                        testimonials[2].state = item.values[0].value.split(',')[2];
                    }
                    else if(item.attributeFQN == 'tenant~testimonial-quote-1') {  
                        testimonials[0].quote = item.values[0].stringValue;
                    }
                    else if(item.attributeFQN == 'tenant~testimonial-quote-2') { 
                        testimonials[1].quote = item.values[0].stringValue;
                    }
                    else if(item.attributeFQN == 'tenant~testimonial-quote-3') { 
                        testimonials[2].quote = item.values[0].stringValue;
                    }
            });

        var randNum = Math.floor((Math.random() * testimonials.length));

        if (testimonials[randNum].name.length > 0) {
            var testTemp = [];
            if(testimonials[randNum].name) {
                testTemp.push(testimonials[randNum].name);
            }
            
            if(testimonials[randNum].city) {
                testTemp.push(testimonials[randNum].city);
            }
            
            if(testimonials[randNum].state) {
                testTemp.push(testimonials[randNum].state);
            }
            
            $('#testimonial-data').html(testTemp.join(', '));
            $('#testimonial-quote').html(testimonials[randNum].quote);
            // $('#testimonial-section').show();
        }
        },
        
        initialize: function () {
            // handle preset selects, etc
            var me = this;
            me.model.set('custom',[]);
            me.model.set('custompro',[]);
            
            
            
            this.$('[data-mz-product-option]').each(function () {
                var $this = $(this), isChecked, wasChecked;
                if ($this.val()) {
                    switch ($this.attr('type')) {
                        case "checkbox":
                        case "radio":
                            isChecked = $this.prop('checked');
                            wasChecked = !!$this.attr('checked');
                            if ((isChecked && !wasChecked) || (wasChecked && !isChecked)) {
                                me.configure($this);
                            }
                            break;
                        default:
                            me.configure($this);
                    }
                }
            });

            /* Get Ship Dates from Arc  */
            var item = me.model.get("productCode");
            Api.request("post","/sfo/get_dates",{data:[item]}).then(function(r) {
                
                var blackoutDates = [];
                if(r.BlackoutDates.length > 0) {
                    blackoutDates = r.BlackoutDates.map(function(d) {
                        return me.formatDate(d);
                    });
                }
                var udate =  new Date(r.FirstShipDate),
                    date = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());     
                // date.setUTCHours(new Date().getUTCHours());
                // var hours = date.getHours();
                // if(hours >= 12){
                //     date.setDate(date.getDate()+1);
                // }
                var m = date.getMonth(),
                    d = date.getDate(),
                    y = date.getFullYear(),
                    startdate = ('0'+(m+1)).slice(-2)+ '/' + ('0'+d).slice(-2) + '/' + y;
                
                var nextday = new Date(),businessdays=2,day,month,year,currentDate,comparedate;
                    while(businessdays) {
                        nextday.setFullYear(nextday.getFullYear(),nextday.getMonth(),(nextday.getDate()+1));
                        day = nextday.getDay();
                        month = nextday.getMonth();
                        year = nextday.getFullYear();
                        currentDate = nextday.getDate(); 
                        comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                    
                        if(day===0 || day===6 ||blackoutDates.indexOf(comparedate) !== -1) {
                            nextday.setFullYear(year,month,currentDate);
                        } else {
                            businessdays--;
                        }
                    }
                
                /* check if date is regular or future and then determine if product is a regular one or SFO */
                if(me.model.get("inventoryInfo").onlineStockAvailable > 0 && date > nextday) {
                    //me.model.set('isFutureProduct',true);
                    window.shipDate = true;
                } else {
                    //me.model.set('isFutureProduct',false);
                    window.shipDate = false;
                }
                me.model.set('purchaseDateAvailable',startdate);
                me.render();
            }, function(er){
                console.log(er.message);
            });
          
            /*$(document).on('click','check',function(){
              if($(this).is(':checked')){
                $(this).parent().css('background-color','#e28104'); 
              }
              else if(!$(this).is(':checked')){
                   $(this).parent().css('background-color','#e3e3e3'); 
                   $(this).parent().css('cursor','not-allowed');
              }
            });*/
            
         $('[add-to-bundle-list],[qtys]').on('change',function(e){
                var current,removelist;
                 if($(this).attr('type')=="number"){
                if(parseInt($(this).val(),10)>0 && $(this).val()!=="" && parseInt($(this).val(),10)<=20){
                    var select = $(this); 
                      var list="custom";
                    me.selectqty(select,me,list);
                }  
                 }
                else if($(this).attr('type')=="checkbox"){
               if($(this).is(':checked')){ 
                   var p=$(this);
                    var addlist="custom";
                        if(parseInt(p.parent().siblings().val(),10)>0 && p.parent().siblings().val()!== "" && parseInt(p.parent().siblings().val(),10)<=20){
                    me.addProducts(p,me,addlist);
                        $('html, body').animate({scrollTop : 100},800);
                         $(this).parent().css('background-color','#e28104'); 
                          $('#addtobasket').attr("disabled",false); 
                        }
                        else{
                            $(this).click();
                        }
                   }
                   else{ 
                        current=$(this);   
                        removelist="custom";
                        me.removeProducts(current,me,removelist);
                        $('html, body').animate({scrollTop : 100},800);
                         $(this).parent().css('background-color','#e3e3e3'); 
                         $('#addtobasket').attr("disabled",false); 
                   }
               }
                 me.render();
                  
            });  
            
            
            $('[add-to-pro-list],[prqtys]').on('change',function(e){ 
                var current,removelist;
                if($(this).attr('type')=="number"){
                    if(parseInt($(this).val(),10)>0 && $(this).val()!=="" && parseInt($(this).val(),10)<=20 ){
                    var select = $(this); 
                    var list="custompro";
                    me.selectqty(select,me,list);
                }  
                }else if($(this).attr('type')=="checkbox"){
               if($(this).is(':checked')){ 
                   var p=$(this);
                    var addlist="custompro";
                        if(parseInt(p.parent().siblings().val(),10)>0 && p.parent().siblings().val()!== "" && parseInt(p.parent().siblings().val(),10)<=20){
                       // if(parseInt(p.siblings().val())>0 && p.siblings().val()!== "" && parseInt(p.siblings().val())<=20){
                    me.addProducts(p,me,addlist);
                    $('html, body').animate({scrollTop : 100},800); 
                    $(this).parent().css('background-color','#e28104'); 
                   $('#addtobasket').attr("disabled",false); 
                        }
                        else{
                            $(this).click();
                        }
               }
               else{ 
                       current=$(this);
                       removelist="custompro";
                   me.removeProducts(current,me,removelist);
                       $('html, body').animate({scrollTop : 100},800);
                   $(this).parent().css('background-color','#e3e3e3'); 
                   }
               }
                 me.render();
               
            });  
            
      
            
            $('#addtobasket').on('click',function(){
                me.addTobasket();
            });
      
         //mobile table remove products
        var width = $(window).width();
            if(width < 768){
                $(document).on('click','.close-me',function(){
                    var productCode = $(this).parent().data('mz-productcode');
                    var custom= $(this).parent().attr('custom');
                    if(custom==="custom"){
                        if($('.mz-bundle-main').find("[data-mz-product="+productCode+"]").find("[type='checkbox']").is(':checked')){
                            $('.mz-bundle-main').find("[data-mz-product="+productCode+"]").find("[type='checkbox']").click();
                        }
                        else if(productCode===me.model.get('productCode')){
                            if($('.mz-productdetail-qty').is(':checked')){
                                $('.mz-productdetail-qty').click();
                            }
                    }     
                    } else if(custom==="custompro"){
                        if($('.mz-pro-main').find("[data-mz-product="+productCode+"]").find("[type='checkbox']").is(':checked')){
                            $('.mz-pro-main').find("[data-mz-product="+productCode+"]").find("[type='checkbox']").click();
                        }    
                    } 
                });        
            } 
          
        },
        
        formatDate: function(date) {
            var udate = new Date(date),
                sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());     


// 			sdate.setUTCHours(new Date().getUTCHours());
//             var hours = sdate.getHours();
//             if(hours >= 12){
//                 sdate.setDate(sdate.getDate()+1);
//             }
            var startdate = ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
            return startdate;
        },
        
        addProducts:function(p,me,addlist){
                
                var product={
                  pcode:p.val(),
                  qty: parseInt(p.parent().siblings().val(),10),
                  price: parseFloat(p.attr('price')).toFixed(2),
                  name: p.attr('prodname'),
                  total: ''
                };   
                product.total = parseFloat(product.price * product.qty).toFixed(2);
                
                 me.model.get(addlist).push(product);      
                 var prototal = me.model.get(addlist);
                 if(addlist=="custompro"){
                    me.totalqty(prototal);
                 }
                 me.total(prototal,addlist);
                 me.render();
                 //me.model.set('total',total);
                
                
            },
            
        removeProducts: function(current,me,removelist){
                 var a= me.model.get(removelist);
                   var b=current.val();
                   $.each(a,function(i,v){
                       if(v.pcode==b){
                        a.splice(i,1);     
                        return false;
                       }  
                   });
                  if(removelist=="custompro"){
                    me.totalqty(a);  
                 }
                 me.total(a,removelist);  
                me.render();                   
            },
          
        selectqty:function(sel,me,list){           
                if(sel.parent().find('.check').is(':checked')){
                    var c= me.model.get(list);
                    var m= sel;
                    $.each(c,function(i,v){
                        if(v.pcode== m.parent().find('.check').val()){
                            v.qty=parseInt(m.val(),10);
                            v.total=parseFloat(v.qty*parseFloat(v.price)).toFixed(2);   
                        } 
                    });
                    if(list=="custompro"){
                    me.totalqty(c);
                 }
                   me.total(c,list);
                    me.render();
                }    
            },

        total:function (a,list){
                 var total = 0;
                 var me= this;
               
            
                 $.each(a,function(i,v){
                     total += parseFloat(v.total);
                     
                 });
                 /*var prototal = me.model.get('prototal');
                 if(prototal){
                 total= total+ prototal;
                 }*/
                 if(list=="custom"){
                    me.model.set('total',parseFloat(total).toFixed(2));
                    me.allTotal(me);
                 }
                  else if(list=="custompro"){
                    me.model.set('prototal',parseFloat(total).toFixed(2));
                    me.allTotal(me);
                  }
                 
            /*  $.each(a,function(i,v){
                    if(me.model.get('subtotal')>500 && v.total>0 && v.pcode===me.model.get('productCode')){
                    a[i].total=0;
                     me.total(a);
                }  
                else if( v.pcode===me.model.get('productCode') && v.total === 0 && me.model.get('subtotal')+me.model.get('price.salePrice')<500 ){
                    v.total=me.model.get('price.salePrice');
                    me.total(a);
                }
              });*/
                
                 
            },
            
        allTotal: function(me){
                
                var a= parseFloat(me.model.get('total'));
                var b= parseFloat(me.model.get('prototal'));
                
                
                
                
                if(a && b){
                    var c= a+b;
                    me.model.set('subtotal',parseFloat(c).toFixed(2));
                    me.fixtureUpdate();
                    
                }else if(a){
                    me.model.set('subtotal', a.toFixed(2));
                    me.fixtureUpdate();
                }
                else{
                    me.model.set('subtotal', b.toFixed(2));
                    me.fixtureUpdate();
                }
                
                
            },
            
        totalqty: function(a){
                var proqty=0;
                 var me= this;
                $.each(a, function(i,v){
                    proqty += parseInt(v.qty,10);
                    
                });
                 me.model.set('proqty',proqty);
            },
            
        fixtureUpdate:function(){
                 var me=this;
                 var x= me.model.get('custom');
                 $.each(x,function(i,v){
                    if(parseFloat(me.model.get('subtotal'))>500 && v.total>0 && v.pcode===me.model.get('productCode')){
                        v.total=0;
                        var list="custom";
                        me.total(x,list);
                    }  
                    else if( v.pcode===me.model.get('productCode') && v.total === 0 && parseFloat(me.model.get('subtotal'))+parseFloat(me.model.get('price.salePrice'))<500 ){
                        v.total=parseFloat(me.model.get('price.salePrice'));
                        var l="custom";
                        me.total(x,l);
                    }
                });  
                
            }
            
            //accordion 
            
          
           /* addProductsList: function(p,me){
                
                var product={
                  pcode:p.val(),
                  qty: parseInt(p.siblings().val()),
                  price: parseInt(p.attr('price')),
                  name: p.attr('prodname'),
                  total: ''
                };   
                product.total = product.price * product.qty;
                
                 me.model.get("custompro").push(product);      
                 var prototal = me.model.get("custompro");
                 me.totalpro(prototal);
                 me.totalqty(prototal);
                 me.render();
                 //me.model.set('total',total);
                
                
            },
            */
            /* removeProductsList: function(current,me){
                 var a= me.model.get("custompro");
                   var b=current.val();
                   $.each(a,function(i,v){
                       if(v.pcode==b){
                        a.splice(i,1);     
                        return false;
                       }  
                   });
                  
                 me.totalpro(a);
                 me.totalqty(a);
                me.render();
                   
            },*/
            
           /* totalpro: function(a){
                 var total = 0;
                  var me= this;
                 $.each(a,function(i,v){
                     total += v.total;
                 });
                 me.model.set('prototal',total);
                 me.allTotal(me);
              /*   if(me.model.get('total')){
                     var total1 = me.model.get('total');
                     if(total && total1){
                        total= total+ total1;
                        me.model.set('total',total);
                     }else{
                        me.model.set('total',total1);        
                     }
                 }*/
                 
                 
            //},
            
               /*
                          if(v.pcode== ){
                              if(v.total === 0 && me.model.get('subtotal')<500 &&  $('.mz-productdetail-qty').attr('checked',true)){
                                  me.fixtureUpdate();
                                  me.total(a);
                                  return false;
                              }
                              else if(v.total>0 && me.model.get('subtotal')>500 &&  $('.mz-productdetail-qty').attr('checked',true)){
                                  me.fixtureUpdate();
                                  me.total(a);
                                  return false;
                              }
                          } 
                       */
                
               
            
            
               
            
            
            /*selectqtypro: function(sel,me){
            
                if(sel.siblings().is(':checked')){
                    var a="custompro";
                    var c= me.model.get(a);
                    var m= sel;
                    $.each(c,function(i,v){
                        if(v.pcode==m.siblings().val()){
                            v.qty=parseInt(m.val());
                            v.total=v.qty*v.price;   
                        } 
                    });
                    
                    me.totalqty(c);
                    me.render();
                }    
            },*/
            
            
    });
    
    var quick = Backbone.MozuView.extend({
        templateName: "modules/product/recently-quick-view",
                    
        recentToCart: function(e){
            e.preventDefault();
            var me=this;
            var $target = $(e.currentTarget), productCode = $target.data("jb-pid");
            $('[data-mz-productlist],[data-mz-facets],.mz-productlisting').addClass('is-loading');
            $target.addClass('is-loading');
             var $quantity = $(e.target.parentNode.parentNode).find('#quantity')[0].options[$(e.target.parentNode.parentNode).find('#quantity')[0].options.selectedIndex];
            var count =  parseInt($quantity.innerHTML,10);
    
            Api.get('product', productCode).then(function(sdkProduct) {
                var PRODUCT = new ProductModels.Product(sdkProduct.data);
                var variantOpt = sdkProduct.data.options;
                $("#openModal").hide(); 
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
                                me.addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                        },2000);
                    }else{
                        me.showErrorMessage("Please choose the Gift Card amount before adding it to your cart. <br> Thanks for choosing to give a Jelly Belly Gift Card!");
                        $target.removeClass('is-loading');
                    }
                }else{
                    me.addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                }
            });
        
        },
                
        addToCartAndUpdateMiniCart:function(PRODUCT,count,$target){
            PRODUCT.set({'quantity':count});
            $target.addClass('is-loading');
            PRODUCT.addToCart(1);
            PRODUCT.on('addedtocart', function(attr) {
                $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                $target.removeClass('is-loading');
                CartMonitor.update();
                MiniCart.MiniCart.showMiniCart();
                PRODUCT = ''; 
            });
            Api.on('error', function (badPromise, xhr, requestConf) {
                this.showErrorMessage(badPromise.message);
                $target.removeClass('is-loading');
            });
        },
        
        render: function(){
            Backbone.MozuView.prototype.render.apply(this);
            // fill the user email id if product is out of stock.
            if($(document).find('#mz-instock-request-email').filter(':visible').length > 0){
                $(document).find('#mz-instock-request-email').val(decodeURIComponent(jQuery.cookie('userData'))); 
            }
        }
                    
    });

    $(document).ready(function () {
        // varient implementation
        var width = $(window).width();
        if(width < 768){
            $(document).find('body').addClass('variant');   
        }

        // AB testing starts.

        $(document).on('click', '.tabStructer .tabHead .headItem', function(e){
            if(!$(e.currentTarget).hasClass('active')){
                $('.tabStructer .tabHead .headItem').removeClass('active');
                $('.tabStructer .tabContent').find('.contentItem').removeClass('active');
                $(e.currentTarget).addClass('active');
                $('.tabStructer .tabContent').find('.'+$(e.currentTarget).attr('data-attr')).addClass('active');
            }
        });


        // fill the user email id if product is out of stock.
        // $(document).find('body.mz-product').addClass('variant');

        if($(document).find('#mz-instock-request-email').filter(':visible').length > 0){
            $(document).find('#mz-instock-request-email').val(decodeURIComponent(jQuery.cookie('userData'))); 
        } 
        
        $(document).on('click','.show-popup-confirmation', function(e){  
            if(typeof $.cookie("isSubscriptionActive") !== "undefined") {
                alertPopup.AlertView.fillmessage("future-dailog",Hypr.getLabel('futureSubscription'), function(result) {
                    if(!result) {
                         alertPopup.AlertView.closepopup();
                    }else{
                        alertPopup.AlertView.closepopup();
                    } 
                }); 
            }else{
                var $target = $(e.currentTarget), productCode = $target.data("jb-pid"); 
                var qty = $(e.currentTarget).parents('.mz-conversion-control-container').find('[data-mz-value="quantity"]').val();
                var count = parseInt(qty,10);
                
                var myDate = $(window).width()>768 ? $(e.currentTarget).parents('.mz-conversion-control-container').next(".oos-msg").find('strong').text() : $(e.currentTarget).parents('.mz-productdetail-conversion').find('.oos-msg').first().find('strong').text();
                if(!count){
                    var $quantity = $(e.target.parentNode.parentNode).find('#quantity')[0].options[$(e.target.parentNode.parentNode).find('#quantity')[0].options.selectedIndex];
                    count = parseInt($quantity.innerHTML,10);
                }
                if(!myDate){
                    if($(e.currentTarget).parents('.jb-quickviewdetails').length){
                        myDate = $(e.currentTarget).parents('.jb-quickviewdetails').find(".stock").find('b').text();
                    }else{
                        myDate = $(e.currentTarget).parents('.mz-productlisting-info').find(".stock").find('b').text();  
                    }
                }
                $(document).find('.confirmation-popup').find('.bold-text').html(myDate);
                $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('mz-productCode',productCode);
                $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('mz-quentity',count); 
                $(document).find('.confirmation-popup').addClass('active');
                $(document).find('.confirm-popup-body').addClass('active');
                $(document).find('body').addClass('has-popup');
            }    
        });
        $(document).on('click', '.times-circle, .cancel-atc', function(e){
            $(document).find('.confirmation-popup').removeClass('active');
            $(document).find('.confirm-popup-body').removeClass('active');
            $(document).find('body').removeClass('has-popup');
        });
        $(document).on('click', '.add-to-cart-popup', function(e){
            $(document).find('.confirmation-popup').removeClass('active');
            var $target = $(e.currentTarget), productCode = $target.attr("mz-productCode"), count = parseInt($target.attr('mz-quentity'),10);
            Api.get('product', productCode).then(function(sdkProduct){
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
                                addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                        },2000);
                    }else{
                        $target.removeClass('is-loading');
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
                                    $target.removeClass('is-loading');
                                    $('.zero-popup').show();
                                    return false;
                                }
                            }
                        }
                        addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                    }else if(qntcheck){
                        $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                        $target.removeClass('is-loading');
                        $(".items-per-order").show(); 
                        return false;    
                    }else{
                        addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                    }
                }
            });
        });
        
       function  addToCartAndUpdateMiniCart(PRODUCT,count,$target){
            PRODUCT.set({'quantity':count});
            $target.addClass('is-loading');
            PRODUCT.addToCart(1);
            PRODUCT.on('addedtocart', function(attr) {
                $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                $target.removeClass('is-loading');
                $(document).find('.confirmation-popup').removeClass('active');
                $(document).find('.confirm-popup-body').removeClass('active');
                $(document).find('body').removeClass('has-popup');
                CartMonitor.update();
                MiniCart.MiniCart.showMiniCart();
                PRODUCT = ''; 
                $("html, body").animate({
                    scrollTop: $(".mz-pageheader-desktop").offset().top
                }, 500);
            });
            Api.on('error', function (badPromise, xhr, requestConf) {
                this.showErrorMessage(badPromise.message);
                $target.removeClass('is-loading');
                $(document).find('.confirmation-popup').removeClass('active');
                $(document).find('.confirm-popup-body').removeClass('active');
                $(document).find('body').removeClass('has-popup');
            });
        }
        
        $('.check').click (function(){
            $('#addtobasket').attr('diasbled',false);
            $('.check').click (function(){
                $('#addtobasket').attr('diasbled',true);   
            });
        });
        var product = ProductModels.Product.fromCurrent();

        product.on('addedtocart', function (cartitem) {
            if (cartitem && cartitem.prop('id')) {
                CartMonitor.addToCount(product.get('quantity'));
                MiniCart.MiniCart.showMiniCart();
            } else {
                product.trigger("error", { message: Hypr.getLabel('unexpectedError') });
            } 
			brontoObj.build(Api);
        });

        product.on('addedtowishlist', function (cartitem) {
            $('#add-to-wishlist').prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
            $('#add-to-wishlist').css("cursor",'not-allowed');
        });

        var productView = new ProductView({
            el: $('#product-detail'),
            model: product,
            messagesEl: $('[data-mz-message-bar]')
        });

        var productImagesView = new ProductImageViews.ProductPageImagesView({
            el: $('[data-mz-productimages]'),
            model: product
        });

        window.productView = productView;
        window.productImagesView = productImagesView;

   
        productView.render();
        productImagesView.render();
        
        $(document).on('click', "#open-video", function() {
           productImagesView.showVideo();
           $('#cboxClose').css({ 'background-image': 'url("/resources/images/icons/close-popup-black.png")' });
        });
        
        productView.setTestimonial(); 
        
        var isCarousalLoaded = false;
        setInterval(function(){
            if(!isCarousalLoaded){
                var xx = $('.recommended-product').find('.MB_PROD2');
                if(xx.length>0){
                    var x= xx.children()[0];
                    x.innerHTML = '<h3 style="padding-left: 9%;width: 100%;">Jelly Belly Also Recommends</h3>';
                    isCarousalLoaded = true;
                    mybuyscarousal();
                }
            }
        }, 1000);

        function mybuyscarousal(){
            if($(window).width() < 800){
                var owlMBRP = $('.MB_PRODUCTSLOT').parent();
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
        
        var owlMBR = $('.mz-pro-main');
        owlMBR.owlCarousel({
            center          :false,
            loop            :false,
            nav             :true,
            margin          :2,
            dots            :false,
            items           : 5,
            slideBy         : 5,
            responsive:{
                0:{
                    items:1
                },
                400:{
                    items:1
                },
                600:{
                    items:3
                },
                800:{
                    items:5
                }
            }
        }); 
        $(document).on('click','.owl-next',function(){
            if($('.mz-pro-main .owl-item ').last().hasClass('active')){
                   $('.mz-pro-main .owl-next').hide();
                }else{
                     $('.mz-pro-main .owl-next').show();
            } 
        });    
                    
        $(document).on('click','.owl-prev',function(){
            if($('.mz-pro-main .owl-item ').first().hasClass('active')){
               $('.mz-pro-main .owl-prev').hide();
            }else{
                $('.mz-pro-main .owl-prev').show();
            }
        });    
        /*       var owlMBRP = $('.mz-productimages-thumbs');
      
                           owlMBRP.owlCarousel({
                                center          :false,
                                loop            :true,
                                nav             :true,
                               margin        :-78,
                                dots            :false,
                                    responsive:{
                                     0:{  
                                         items:1
                                       },
                              400:{
                                          items:1
                                     },
                                     600:{
                                          items:2
                                       },
                                    800:{
                                           items:3
                                     }
                                 }
                                });*/
        /*var productImages = require.mozuData("product").content.productImages;
        
        if( productImages.length < 4 ){
            $(".owl-nav").hide();
        }*/
        
        /*var owlMBRP = $('.mz-productimages-thumbs');
       owlMBRP.owlCarousel({
                                center          :false,
                                loop            :true,
                                nav             :true,
                               margin        :-78,
                                dots            :false, 
                                    responsive:{
                                     0:{  
                                         items:1
                                       },
                              400:{
                                          items:1
                                     },
                                     600:{
                                          items:2
                                       },
                                    800:{
                                           items:3
                                     }
                                 }
                                });
   */                             
        var windowsize = $(window).width();

        $(window).resize(function() {
            var windowsize = $(window).width();
        });
        /*if(windowsize > 600) {
      var owlMBR1 = $('.mz-productimages-thumbs');
      
                           owlMBR1.owlCarousel({
                                center          :false,
                                loop            :true,
                                nav             :true, 
                               dots            :false,
                               autoWidth      :true,
                               items        :3, 
                            }); 
}*/
        if (windowsize < 800) {
            var owl = $('.mz-bundle-main'); 
            owl.owlCarousel({
                center          :false,
                loop            :false,
                nav             :true,
                dots            :false, 
                slideBy         : 3,
                responsive:{
                    0:{  
                        items:1
                    },
                    400:{
                        items:1
                    },
                    600:{
                        items:2
                    }
                }
            });
        }                         
        // var owlMBRP = $('.mz-bundle-main');
        //   owlMBRP.owlCarousel({
                          ////      center          :false,
                           //     loop            :true,
                           //     nav             :true,
                           //     dots            :false,
                           //         responsive:{
                           //          0:{  
                             //            items:3
                           //            },
                            //       400:{
                               //           items:3
                           //          },
                              //      600:{
                                   //       items:3
                                    //   },
                                   // 800:{
                                       //    items:3 
                                   //  }
                               //  }
              //  }); 
        //open review section
        $(document).on('click','.jb-read-review-link',function(e){
            $($('.accordian-list')[0].children[0]).removeClass('active');
            $($('.accordian-list')[0].children[0]).find('ul').hide();
            // $('[jb-review-mz-db-container]').find('.comment-section').slideDown(function(){
            //     $($('[jb-review-mz-db-container]').find('.accordian-list')[0].children[0]).addClass('active');
            // });
             // $('[riviewLister]').toggleClass('active');
            // changes made by Amit 26 June
            if($(this).find('span').text() !== "0"){
                    $($('.accordian-list')[1].children[0]).addClass('active');
                if($($('.accordian-list')[1].children[0]).hasClass('active')){
                    e.preventDefault();
                    $('html, body').animate({
                        scrollTop: 400
                    }, 500);
                    $('.accordian-list .comment-section').slideDown();
                }
                else{
                    e.preventDefault();
                    $('.accordian-list .comment-section').slideUp();
                }
            }
            /*
            if($('[riviewLister]').hasClass('active')){
                $('.accordian-list .comment-section').slideDown();
            }else{
                $('.accordian-list .comment-section').slideUp();
            }*/
        });
      
        
        // Hide zoome view
        $('html').click(function(e){ 
            if(e.target === $('[data-mz-role="product-variants-wrapper"]')[0]){
                $(e.target).hide().remove();
                $('body').removeClass('tz-modal-active');
            }
        });
        $('.pstock').show();  
    
        //Recently Viewed
        var procode=[];
        if($.cookie('recentProducts') !== undefined){
            var recent= $.cookie('recentProducts');  
            procode = recent.split(",");
            
            if(procode.indexOf(require.mozuData('product').productCode) == -1){
                // if(procode.length >= 5)
                // {
                //     procode.splice(4, 1);
                //     //procode.push(require.mozuData('product').productCode);
                // }
                procode.splice(0,0,require.mozuData('product').productCode);
            
            }
            else
            {
                var a=procode.indexOf(require.mozuData('product').productCode);
                procode.splice(a,1);
                procode.splice(0,0,require.mozuData('product').productCode);
            }
            $.cookie('recentProducts',procode,{path: '/'});
        }
        else{
            procode.push(require.mozuData('product').productCode);
            $.cookie('recentProducts',procode,{path: '/'});
        }
        
        var checkbox= $(':checkbox');
        if(checkbox.length>0){
            $.each(checkbox, function(i,v){
               if(v.checked){
                   v.checked=false;
               } 
            });
            
        }
        
        //bundle accordion
        $(document).on('click','.accordion li',function(){
            var current=$(this);
            var acc= $('.accordion');
            if(current.hasClass('active')){
                current.find('p').slideToggle();
                current.removeClass('active');
                current.find('.fa-minus').hide();
                current.find('.fa-plus').show();
            }else{
                acc.find('.active').removeClass('active');
                acc.find('.fa-minus').hide();
                acc.find('.fa-plus').show();
                acc.find('p').slideUp();
                current.addClass('active');
                if(current.hasClass('active')){
                    current.find('.fa-plus').hide();
                    current.find('.fa-minus').show();
                    current.find('p').slideDown();
                }
            }
        });
        
        //quick view bundle
        var deviceWidth = $(window).width();
        if(deviceWidth>768){
        $(document).on('mouseover','.bun img',function(){
            $(this).parent().find('.quick-view-image').show();
        });
        
        $(document).on('mouseleave','.bun img',function(){
            $('.bun').find('.quick-view-image').hide();
        });
        $(document).on('mouseover','.quick-view-image',function(){
           $(this).show(); 
        });
        }
        
        $('.quick-view-image').on('click',function(e){
            var $target = $(e.currentTarget); 
            var productCode = $target.parent().parent().data('mz-product');
            //var parentNode = $target.closest('.mz-productlist-item');
            Api.get('product', productCode).then(function(sdkProduct) {
            var PRODUCT = new ProductModels.Product(sdkProduct.data);
            //var variantOpts = PRODUCT.apiModel.data.options;
            //console.log(variantOpts);
            
            var quickView= new quick({
            el: $('#viewpro'),
            model: PRODUCT 
            });
            
            quickView.render();
                $('#openModal').show();
                $('.close').click(function(){
                    $('#openModal').hide();
                });
            }); 
            
        });
        
        $(document).on('click', '#instock-notification-signup-button', function(e){
            if(validateEmail($('#mz-instock-request-email').val())){
                $(document).find('.err-msg-notify').html("");   
                Api.create('instockrequest', {
                    email: $('#mz-instock-request-email').val(),
                    customerId: require.mozuData('user').accountId,
                    productCode: require.mozuData('product').productCode,
                    locationCode: require.mozuData('product').inventoryInfo.onlineLocationCode
                }).then(function (r) {
                    //$("#instock-notification-signup").fadeOut(100);
                    $("#instock-notification-signup").html('<div class="col-1" style="width:100%; padding: 15px;">Thank you! We\'ll let you know when we have more.</div>');
                    setTimeout(function(){
                        $("#instock-notification-signup").fadeOut(100);
                    }, 3000);
                    $("#notify-me-dialog").fadeOut(500, function () { $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
                }, function (er) {
                    $("#instock-notification-signup").html('<div class="col-1" style="width:100%; padding: 15px; color: red">'+er.message+'</div>');
                    setTimeout(function(){
                        $("#instock-notification-signup").fadeOut(100);
                    }, 3000);
                    $("#notify-me-dialog").fadeOut(500, function () { $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
                });
            }else{ 
                if($('#mz-instock-request-email').val().length === 0){
                    $(document).find('.err-msg-notify').html("Error: Please enter the email address and submit.");   
                }else{
                    $(document).find('.err-msg-notify').html("Error: Please be sure to provide your Email Address. Make sure you have included the '@' and the '.' in the address.");   
                } 
            }
        });
        
        $(document).on('click','.jb-out-of-stock', function(e) {
            //alert(e.target.getAttribute('data-mz-product-code'));
            $.colorbox({
                open : true,
                maxWidth : "100%",
                maxHeight : "100%",
                scrolling : false,
                fadeOut : 500,
                html : "<div id='notify-me-dialog' style='padding: 30px;'><form><span>Enter your email address to be notified when this item is back in stock.</span><br><input style='margin-top: 10px;' id='notify-me-email' type='text' value='"+decodeURIComponent(jQuery.cookie('userData'))+"'><span style='background: #39A857; color: #ffffff; padding: 3px; margin-left: 5px; cursor: pointer;' id='notify-me-button' data-mz-product-code='" + e.target.getAttribute('data-mz-product-code') + "'>NOTIFY ME</span></form><div class='notify-error' style='display: none; color:red;'>Please enter a valid Email id.</div></div>", //"/resources/intl/geolocate.html",
                overlayClose : true,
                onComplete : function () {
                   $('#cboxClose').show();
                   $('#cboxLoadedContent').css({
                       background : "#ffffff"
                   });
    
               },
                onOpen: function(){
                    $("#colorbox").removeClass("img-box");
                } 
           });
            $(document).find('body').addClass("haspopup"); 
        });
    
        // enable scroll after closing zoom image poup
        $(document).on('click','#cboxClose',function(){
            setTimeout(function(){
                $(document).find('body').removeClass("haspopup"); 
            },250);
        });
    
        $(document).on('click','#cboxOverlay',function(e){
            if($(e.target).attr('id') == "cboxOverlay"){ 
                setTimeout(function(){ 
                    $(document).find('body').removeClass("haspopup");
                },250); 
            }
        });
    
        $(document).on('click','#notify-me-button', function(e) {
            if($('#notify-me-email').val() !== ""){
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                var patt = new RegExp(re);
                if(patt.test($('#notify-me-email').val())){
                    var obj = {
                        email: $('#notify-me-email').val(),
                        customerId: require.mozuData('user').accountId,
                        productCode: e.target.getAttribute('data-mz-product-code'),
                            locationCode: '' //this.model.get('inventoryInfo').onlineLocationCode
                        };
                    if(window.location.host.indexOf('s16708') > -1 || window.location.host.indexOf('east') > -1){
                        obj.locationCode = 'MDC';
                    }else if(window.location.host.indexOf('s21410') > -1 || window.location.host.indexOf('west') > -1){
                        obj.locationCode = 'FDC';
                    }
                        
                    Api.create('instockrequest',obj ).then(function () {
                        $("#notify-me-dialog").fadeOut(500, function () { $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
                    }, function () {
                        $("#notify-me-dialog").fadeOut(500, function () { $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
                    });
                }else{
                    $('.notify-error').show();
                }
            }else{
                $('.notify-error').show(); 
            }
        });
    
        $(document).on('keypress', '#notify-me-email', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            $('#notify-me-button').trigger('click');
            return false;
        }
    });
    });

    $(window).load(function() {
        $("#instock-notification-signup").addClass("in-stock");
    });

    function validateEmail(email){
        var validity = true;
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var patt = new RegExp(re);
        if(email.length === 0){
                validity = false; 
        }else if(patt.test(email)){
        }else if(!(patt.test(email))){
                validity = false; 
        }else{
        }
        return validity; 
    }

    // enable scroll after closing zoom image poup
    $(document).on('click','#cboxClose',function(){
        $(document).find('body').removeClass("haspopup");  
    });

    $(document).on('click','#cboxOverlay',function(e){
        if($(e.target).attr('id') == "cboxOverlay")  
            $(document).find('body').removeClass("haspopup"); 
    });

    // tab structer for recently viewed and you may alos know and top sellers
    $(document).on('click','.head-to-activate',function(){
        $(document).find('.head-to-activate').removeClass('active');
        $(this).addClass('active');
        $(document).find('.pd-list-section').removeClass('active');
        $(document).find('.'+$(this).attr('data-id')).addClass('active');
        carousel($(this).attr('data-id')); 
    }); 


    // destory the currosel and re build it on selection of the tab
    function carousel(element){  
        var ele, bodyele;
        if(element == "rti-section"){
            ele = ".rti-section .related-prod-owl-carousel";
            bodyele = ".rti-section";
        }else if(element == "revently-viewed"){
            ele = ".revently-viewed .mz-productlist-list.mz-l-carousel";
            bodyele = ".revently-viewed";
        }else if(element == "top-seller"){
            ele = ".top-seller .mz-productlist-carousel ul.mz-productlist-grid";
            bodyele = ".top-seller";
        }
        var owlele = $(ele); 
        var owlele1 = $(ele); 
        var counter = 0; 
        counter++; 
        owlele.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
        owlele.find('.owl-stage-outer').children().unwrap();
        owlele.owlCarousel({    
            loop: false, 
            margin: 2,  
            dots: false,
            autoPlay: false,  
            pagination: false,  
            nav: true,     
            navText:false,
            responsive: {    
                0: {
                    items: 1
                },
                400: {
                    items: 1 
                },
                600: {
                    items: 2 
                },
                768: {
                    items: 3
                },
                800: {
                    items: 4 
                },
                1200: {
                    items: 6
                }
            }
        }); 
        hideNavis(owlele1);  
        owlele1.find('.owl-prev').addClass('disabled');    
        owlele.on('changed.owl.carousel', function (e) {
           
            if((e.item.count-e.page.size) == e.item.index){
                owlele1.find('.owl-next').addClass('disabled');  
            }
            if(e.item.index === 0){
                owlele1.find('.owl-prev').addClass('disabled');      
            } 
        });             
    }     
    
    function hideNavis(element){
        if(element.find('.owl-item').length <= 6 && $(window).width() > 1024){   
            element.find('.owl-prev').hide(); 
            element.find('.owl-next').hide();  
            element.find('.owl-prev').addClass('disabled');
            element.find('.owl-next').addClass('disabled');
        }else if(element.find('.owl-item').length <= 3 && $(window).width() > 767){
            element.find('.owl-prev').hide();  
            element.find('.owl-next').hide();  
            element.find('.owl-prev').addClass('disabled');
            element.find('.owl-next').addClass('disabled');   
        } else if(element.find('.owl-item').length <= 1 && $(window).width() <= 767){ 
            element.find('.owl-prev').hide();  
            element.find('.owl-next').hide();  
            element.find('.owl-prev').addClass('disabled');
            element.find('.owl-next').addClass('disabled');       
        }    
    }
    
    //Future date
    var shipDate = window.shipDate = true; 

}); 

