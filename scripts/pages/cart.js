// Changes made by Amit on 3- july for empty cart and coupon code at line no 74-116
define(['modules/backbone-mozu', 'underscore', 'hyprlive', 'modules/jquery-mozu', 'modules/models-cart', 
        'modules/cart-monitor','modules/minicart', 'modules/api' , 'modules/models-product',"modules/alert-popup","shim!vendor/owl.carousel[jquery=jQuery]>jQuery"], 
        function (Backbone, _, Hypr, $, CartModels, CartMonitor, Minicart,Api, ProductModels,alertPopup
) {

    var CartView = Backbone.MozuView.extend({
        templateName: "modules/cart/cart-table",
        initialize: function () {
            var me = this;

            //setup coupon code text box enter.
            this.listenTo(this.model, 'change:couponCode', this.onEnterCouponCode, this);
            this.codeEntered = !!this.model.get('couponCode');
            this.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    if (me.codeEntered) {
                        me.handleEnterKey();
                    }
                    return false;
                }
            });
        },
        clearCartWarning: function() {
            $('#clear-cart-warning').show();
        },
        clearCartYes: function() {
            var self = this;   
            $(document).find('.overlay').show();
            var nameSpace;
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
                catItems = self.model.get('items').models.filter(function(ele){ 
                    if(!_.findWhere(ele.get('product').get('categories'),{id:(resp.items[0].CategoryCode)})){
                        var res = ele.get('product').get('categories').filter(function(e){return e.parent && e.parent.id == (resp.items[0].CategoryCode); });
                        if(res.length > 0){
                            if(_.findWhere(ele.get('productDiscounts'),{couponCode:(ele.get('product').id)})){discountApplyed.push(_.findWhere(ele.get('productDiscounts'),{couponCode:(ele.get('product').id)}).couponCode);}
                            return true;
                        }else{  
                            return false;
                        }
                    }else{if(_.findWhere(ele.get('productDiscounts'),{couponCode:(ele.get('product').id)})){discountApplyed.push(_.findWhere(ele.get('productDiscounts'),{couponCode:(ele.get('product').id)}).couponCode);} return true; }}  
                );
                catItems.sort(function(a,b){return a.get('total')-b.get('total');}); 
                catItems = catItems.filter(function(ele){ if(!_.findWhere(ele.get('productDiscounts'),{couponCode: ele.get('product').id}) && (discountApplyed.indexOf(ele.get('product').id) != -1)){return false;}else{return true;}});
                        
                var removeItemsCount = []; catItems.filter(function(ele){ if(_.findWhere(ele.get('productDiscounts'),{couponCode: ele.get('product').id})){  var temp = {};  temp.prodSKU = ele.get('product').id; removeItemsCount.push(temp);}});
                if(removeItemsCount.length > 0){ 
                    Api.request('POST', "svc/custom_discount", {cartId: this.model.get('id'), addCoupons:[], removeCoupon:removeItemsCount }).then(function(res){ 
                        self.model.apiEmpty();
                        $('#clear-cart-warning').hide();
                    }); 
                }else{ 
                    self.model.apiEmpty();
                    $('#clear-cart-warning').hide();    
                }
            });
                // this.model.apiEmpty();
                // $('#clear-cart-warning').hide();
			
            if(typeof $.cookie("isSubscriptionActive") != "undefined") {
                $.cookie("isSubscriptionActive", '', {path: '/', expires: -1});
                $.cookie("scheduleInfo", '', {path: '/', expires: -1});
            }
	
        },
        clearCartNo: function() {
            $('#clear-cart-warning').hide();
        },
        updateQuantity: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val(),10),
                id = $qField.data('mz-cart-item'),
                item = this.model.get("items").get(id); 
            if(item.get('product.price').get('price')>0){
            if (item && !isNaN(newQuantity)) {
                item.set('quantity', newQuantity);
                 if(item.attributes.quantity > 50){  
                $("#cart-checkout-top").prop( "disabled", true );
                $("#cart-checkout-top").css("background","#c2c2c2");
                $("#cart-checkout").css("background","#c2c2c2");
                $("#cart-checkout").prop( "disabled", true );
                
                }
                else{
                        if(! this.model.get("isCartFaulty") ) {
                 $("#cart-checkout-top").prop( "disabled", false );    
                  $("#cart-checkout").prop( "disabled", false );
                  $("#cart-checkout-top").css("background","green");
                   $("#cart-checkout").css("background","green");
                        }
                  item.saveQuantity();
                    }
              
                }
            }else if(item.get('product.price').price === 0){
                $('.mz-carttable-qty-field').val('1');
            }
            Minicart.MiniCart.updateMiniCart();
        },400),
        
        additionalEvents : {
          'keyup #shipping-zip' : 'testfun'
        },
        getRenderContext: function () {
            var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
                if(c.model.items.length>0 && c.model.items.length !=window.cartCount ){
                    window.cartCount  = c.model.items.length;
                    window.getAndUpdateDates();
                }
            return c;
        },        
        testfun : function(e){
            var cartDetails = this.model.apiModel.data;
            
            if(cartDetails && cartDetails.items.length > 0 ){
              
                if($(e.currentTarget).val() !== "" && cartDetails.isEmpty !== true){
                    $('#estimateShip').removeAttr('disabled');
                }else{
                     $('#estimateShip').attr('disabled','disabled');
                }
            }
        
        },
        isColdPackRemoved: true,
        renderTest: function(){      
            this.model.apiGet();  
        },
        // firstDateFormat:function(fdate){
        //     var me=this,
        //     blackoutDates = [];
        //     if(window.getDates.BlackoutDates.length > 0) {
        //         blackoutDates = window.getDates.BlackoutDates.map(function(d) {
        //             return me.formatDate(d);
        //         });
        //     }
        //     var nextday = new Date(); 
        //     var businessdays=2,day,month,year,currentDate,comparedate;
        //     while(businessdays) {
        //         nextday.setFullYear(nextday.getFullYear(),nextday.getMonth(),nextday.getDate());
        //         day = nextday.getDay();
        //         month = nextday.getMonth();
        //         year = nextday.getFullYear();
        //         currentDate = nextday.getDate(); 
        //         comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
        //         if(day===0 || day===6 ||blackoutDates.indexOf(comparedate) !== -1) {
        //             nextday.setFullYear(year,month,(currentDate+1));
        //         } else {
        //             businessdays--;
        //         }
        //     }
        //     return ('0'+(nextday.getMonth()+1)).slice(-2)+ '/' + ('0'+nextday.getDate()).slice(-2) + '/' + nextday.getFullYear();
        // },
        firstShipDateFormat:function(fdate){
            var udate = new Date(fdate),me=this,businessdays=2,
                sdate,blackoutDates = [];
             
            if(typeof fdate != "undefined"){ 
                var date = new Date(fdate);
                sdate = new Date((date.getUTCMonth()+1)+'/'+date.getUTCDate()+'/'+date.getUTCFullYear());
            }
            if(window.getDates.BlackoutDates.length > 0) {
                blackoutDates = window.getDates.BlackoutDates.map(function(d) {
                    return me.formatDate(d);
                });
            }
            var nextday = new Date(),day,month,year,currentDate,comparedate;
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
            if(sdate && sdate>nextday){
                var futuredate = me.finalShipDatePicker(sdate);
                return  ('0'+(futuredate.getMonth()+1)).slice(-2)+ '/' + ('0'+futuredate.getDate()).slice(-2) + '/' + futuredate.getFullYear();
            }else{
                return  ('0'+(nextday.getMonth()+1)).slice(-2)+ '/' + ('0'+nextday.getDate()).slice(-2) + '/' + nextday.getFullYear();
            }
        },
        heatSensitvieDate:function(_sfo){
            var date = new Date(),sdate,businessdays =2,blackoutdates = [],self = this,finalShipDate,bufferday=0,
            day,month,year,currentDate,comparedate,finaldate ;
            if(typeof _sfo != "undefined"){ 
                var udate = new Date(_sfo);
                sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
            }
            if(window.getDates.BlackoutDates.length > 0) {
                blackoutdates = window.getDates.BlackoutDates.map(function(d) {
                    return self.formatDate(d);
                });
            }
            while(businessdays){
                day = date.getDay(); 
                month = date.getMonth();
                year = date.getFullYear();
                currentDate = date.getDate(); 
                comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                if(bufferday && (day===0 || day===6 || day===3 || day===4 || day===5 ||blackoutdates.indexOf(comparedate) !== -1) ){
                    date.setFullYear(year,month,(currentDate+1));
                }else if(!bufferday && (day===0 || day===6 ||blackoutdates.indexOf(comparedate) !== -1) ){
                    date.setFullYear(year,month,(currentDate+1));
                }else if(!bufferday && (day===2 || day===3 || day===4)){
                    var cdate = new Date(); 
                    cdate.setFullYear(year,month,(currentDate+1));
                    if(cdate.getDay()!==0 && cdate.getDay()!==6 && blackoutdates.indexOf(
                        ('0'+(cdate.getMonth()+1)).slice(-2)+ '/' + ('0'+cdate.getDate()).slice(-2) + '/' + cdate.getFullYear())===-1 ){
                        businessdays--;
                        bufferday=1;        
                    }
                    date.setFullYear(year,month,(currentDate+1));
                }else if(!bufferday && day===5){
                    var hdate = new Date();
                    hdate.setHours(11,51,0);
                    if(date<hdate){
                        businessdays--;
                        bufferday=1;
                        date.setFullYear(year,month,(currentDate+1));
                    }else if(date>hdate){
                        date.setFullYear(year,month,(currentDate+1));
                    }
                }else if(!bufferday && day===1){
                    var mdate = new Date();
                    mdate.setHours(11,51,0);
                    if(date<mdate){
                        businessdays--;
                        bufferday=1;
                        date.setFullYear(year,month,(currentDate+1));
                    }else if(date>mdate){
                        date.setFullYear(year,month,(currentDate+1));
                    }
                }else if(bufferday && (day===1 || day===2) && blackoutdates.indexOf(comparedate) !== -1){
                    date.setFullYear(year,month,(currentDate+1));
                }else if(bufferday && (day===1 || day===2) && blackoutdates.indexOf(comparedate) === -1){
                    businessdays--;
                } 
                else{
                    businessdays--;
                    date.setFullYear(year,month,(currentDate+1));
                    bufferday=1;
                }
            }
            if(sdate && sdate && sdate>date){
                var fdate = self.finalShipHeatDatePicker(sdate);
                finaldate = ('0'+(fdate.getMonth()+1)).slice(-2)+ '/' + ('0'+fdate.getDate()).slice(-2) + '/' + fdate.getFullYear(); 
            }else{
                finaldate = ('0'+(date.getMonth()+1)).slice(-2)+ '/' + ('0'+date.getDate()).slice(-2) + '/' + date.getFullYear(); 
            }
            return finaldate;
        },
        finalShipHeatDatePicker:function(finalShipDate){
            var self = this,date = new Date(finalShipDate),businessdays=1,blackoutdates = [],
                day,month,year,fulldate,currentDate,comparedate;
                
            if(window.getDates.BlackoutDates.length > 0) {
                blackoutdates = window.getDates.BlackoutDates.map(function(d) {
                    return self.formatDate(d);
                });
            }    
            date.setFullYear(date.getFullYear(),date.getMonth(),(date.getDate()+1));
            while(businessdays){
                date.setFullYear(date.getFullYear(),date.getMonth(),date.getDate());
                day = date.getDay();
                month = date.getMonth();
                year = date.getFullYear();
                currentDate = date.getDate(); 
                comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                if(day===0 || day===6 ||  day===3 ||  day===4 || day===5 || blackoutdates.indexOf(comparedate) !== -1){
                    date.setFullYear(year,month,(currentDate+1));
                }else{
                    businessdays--;
                }
            }
            return date;
        },
        finalShipDatePicker:function(finalShipDate){
            var self = this,date = new Date(finalShipDate),businessdays=1,blackoutdates=[],
                day,month,year,fulldate,currentDate,comparedate;
                
            if(window.getDates.BlackoutDates.length > 0) {
                blackoutdates = window.getDates.BlackoutDates.map(function(d) {
                    return self.formatDate(d);
                });
            }   
            date.setFullYear(date.getFullYear(),date.getMonth(),(date.getDate()+1));
            while(businessdays){
                date.setFullYear(date.getFullYear(),date.getMonth(),date.getDate());
                day = date.getDay();
                month = date.getMonth();
                year = date.getFullYear();
                currentDate = date.getDate(); 
                comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                if(day===0 || day===6 || blackoutdates.indexOf(comparedate) !== -1){
                    date.setFullYear(year,month,(currentDate+1));
                }else{
                    businessdays--;
                }
            }
            return date;
        },
        render:function(){ 
            var me = this;
            var total=this.model.apiModel.data.discountedTotal;
             if(total<Hypr.getThemeSetting('freeshippingBoundingValue')){
                var amt=Hypr.getThemeSetting('freeshippingBoundingValue')-total;     
               this.model.attributes.remainingfreeshippinng=amt.toFixed(2);
            }else{
              this.model.attributes.remainingfreeshippinng=0;
            }
            Minicart.MiniCart.updateMiniCart();
            if(window.getDates && window.getDates.Items.length > 0) {
                this.updateShipDates();
                if(me.isThereHeatSensitiveProduct()){
					$("#first-shipdate").text(me.heatSensitvieDate(window.getDates.FirstShipDate));
				}else{
					$("#first-shipdate").text(me.firstShipDateFormat(window.getDates.FirstShipDate));
				}	
            }
            
            Backbone.MozuView.prototype.render.apply(this);
            
            if (me.model.hasHeatSensitiveItems() && Hypr.getThemeSetting('showHeatSensitiveText')) {
                $('#heat-warning').css({ display: "block" });
            }
			if(this.model.get("items").length === 0) {
                if(typeof $.cookie("isSubscriptionActive") != "undefined") {
                    $.cookie("isSubscriptionActive", '', {path: '/', expires: -1});
                    $.cookie("scheduleInfo", '', {path: '/', expires: -1});
                }
            }

            setTimeout(function(){$('.overlay').hide(); }, 4000);
            //this.checkInventory();

            var segmentArray = document.getElementById('segments').innerHTML;
            var segments = segmentArray.split(',');

            if(segments.indexOf('B2B-DISC-5PERCENT') > -1){
                $("#discount-cell div").css({ "background" : "lightyellow"});
                $("#discount-cell div span").css({ "color" : "black"});
                if($(window).width() < 767) {
                    $("#discount-cell div").css({ "margin-right" : "40px"});
                    $("#discount-cell div").css({ "margin-left" : "40px"});
                }
            }  
            //oos error message
            if($(document).find('.mz-stockout-error').length>0){
                $(document).find('.oos-error').text( Hypr.getLabel('ooserror'));
            }else{
                $(document).find('.oos-error').text('');
            }    
            if(me.model.get('items').length < 1) {
               $("#first-shipdate").text("");  
            }
        },
        formatDate: function(date) {
            var udate = new Date(date),
            sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
            return ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
        },
        isThereHeatSensitiveProduct: function(){
            var heat=false;
            var cartProducts = this.model.get('items').models;
            if(cartProducts.length>0){
                for(var i=0;i<cartProducts.length;i++){
                    var heatProp = cartProducts[i].get('product.properties');
                    for(var j=0; j<heatProp.length; j++){
                        if(heatProp[j].attributeFQN == "tenant~IsHeatSensitive" ){
                           if(heatProp[j].values[0].value){
                              return true;  
                           }
                        } 
                    }
                }
            }    
             return false;
        },  
        
        removeItem: function(e) {
            var $removeButton = $(e.currentTarget),
            id = $removeButton.data('mz-cart-item');
            $('.overlay').show();
            var self = this;
            var product = $(e.currentTarget).parents('.mz-carttable-item').attr('data-mz-carttable-item-sku');
            if(this.model.get('couponCodes').indexOf(product) != -1){  
                var catItems = this.model.get('items').models.filter(function(ele){return (ele.get('product').id == product && !_.findWhere(ele.get('productDiscounts'),{couponCode:(ele.get('product').id)}))? true : false;});
                if(catItems.length > 0){
                    catItems = catItems[0];
                    if(catItems.get('quantity') > 1){
                        if(catItems.id != id){
                            self.modifyChangeQuty((catItems.get('quantity')-1), catItems.id); 
                        }else{
                            self.model.removeItem(id);      
                        }
                    }else{
                        self.model.removeItem(catItems.id); 
                    }   
                }else{
                    Api.request('POST', "svc/custom_discount", {cartId: this.model.get('id'), addCoupons:[], removeCoupon:[{prodSKU:product}] }).then(function(res){ 
                        self.model.removeItem(id);
                    });  
                }
            }else{this.model.removeItem(id);}  
            return false;
        },
        modifyChangeQuty : function(newQty, id){
            var item = this.model.get("items").get(id); 
            item.set('quantity', newQty);
            item.saveQuantity();
            Minicart.MiniCart.updateMiniCart();
        },
        
        proceedToCheckout: function () {
            //commenting  for ssl for now...
            //this.model.toOrder();
            // return false;
            this.model.isLoading(true);
            // the rest is done through a regular HTTP POST
        },
        
        addCoupon: function () {
            var self = this;
            this.model.addCoupon().ensure(function () {
                self.model.unset('couponCode');
                self.render();
            });
        },
        onEnterCouponCode: function (model, code) {
            if (code && !this.codeEntered) {
                this.codeEntered = true;
                this.$el.find('#cart-coupon-code').prop('disabled', false);
                this.$el.find('#cart-coupon-code').addClass("active-button");
            }
            if (!code && this.codeEntered) {
                this.codeEntered = false;
                this.$el.find('#cart-coupon-code').prop('disabled', true);
                this.$el.find('#cart-coupon-code').removeClass("active-button");
            }
        },
        autoUpdate: [
            'couponCode'
        ],
        handleEnterKey: function () {
            this.addCoupon();
        },
        updateShipDates: function() {
            var me = this;
            if(window.cartView.model.get("items").length > 0 && window.cartView.model.get("items").length!=window.cartCount ){
                window.cartCount  = window.cartView.model.get("items").length;
                window.getAndUpdateDates();
            }else{
                var blackoutDates = [];
                if(window.getDates.BlackoutDates.length > 0) {
                    blackoutDates = window.getDates.BlackoutDates.map(function(d) {
                        return me.formatDate(d);
                    });
                }
            if(window.getDates.comingSoonProducts.length > 0) {
                me.model.set("isCartFaulty",true);
            } else {
                me.model.set("isCartFaulty",false);
            }
            me.model.get("items").models.forEach(function(e,i) {
               var foundEl = _.findWhere(window.getDates.Items, {SKU: e.get("product.productCode")});
                  
                    if(foundEl && foundEl.FirstShipDate){
                        var udate = new Date(foundEl.FirstShipDate),
                        date = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear()),
                        nextday = new Date(),businessdays=2,day,month,year,currentDate,comparedate;
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
                        if(foundEl.inventory > 0 && date > nextday) {
                            e.set('isFutureProduct',true);
                        }    
                        e.set("nextAvailableDate",('0'+(date.getMonth()+1)).slice(-2)+ '/' + ('0'+date.getDate()).slice(-2) + '/' + date.getFullYear());
                        e.set("availableInventory",foundEl.inventory);
                    }
                    else if(foundEl) {
                       e.set("availableInventory",foundEl.inventory);
                       //me.checkInventoryForShipDates(e);
                    }
                });
            }    
        },
        // v.r.s changes to allow SFO items
        checkInventoryForShipDates: function(modelItem) {
            var isColorboxOpen = false;
            if (!isColorboxOpen) {
                isColorboxOpen = true;
                // if (modelItem.get("quantity") > skuData.inventory ) {
                //     $('[data-mz-carttable-item-sku='+modelItem.get("product").get("productCode")+']').after("<tr class='mz-carttable-item'><td colspan=5 class='mz-carttable-item-product' style='margin-top: 20px;'><span style='font-size: 14px; font-weight: bold;'><i class='fa fa-exclamation-triangle' aria-hidden='true' style='color: #dd0000;'></i> Sorry, but "+modelItem.get("product").get("productCode")+":"+modelItem.get("product").get("name")+" no longer has enough inventory to satisfy your order.  There are "+skuData.inventory+" units left in stock.  Please adjust your order and try again.</span></td></tr>");
                // }
                $.colorbox({
                    open : true,
                    maxWidth : "100%",
                    maxHeight : "100%",
                    height : "50%",
                    width : "55%",
                    scrolling : true,
                    fadeOut : 500,
                    html : "<div style='margin:20px 10px 20px 10px;'>Inventory levels have changed for some products. <br>Please review your cart and adjust quantities.<span id='itemList'></span></div>",
                    overlayClose : true,
                    trapFocus: false,
                    onComplete : function () {
                        $('#cboxClose').css({ 'background-image': 'url("/resources/images/icons/close-popup.png")' });
                        $('#cboxClose').fadeIn(); 
                        $('#cboxLoadedContent').css({
                            background : "#ffffff"
                        });
                        $('#cboxClose').focus();
                        //focusLoop();
                        
                        
                    }
                    
                });
                
            }
            $('#itemList').append('<ul><li><b>'+modelItem.get("product").get("name")+'</b></li></ul>');
            
        },

        checkInventory: function(){
      var isColorboxOpen = false; 
            _.each(this.model.apiModel.data.items, function(item){
                Api.get('product', item.product.productCode).then(function(sdkProduct) {
                    if (item.quantity > sdkProduct.data.inventoryInfo.onlineSoftStockAvailable) { 
                        $('[data-mz-carttable-item-sku="'+item.product.productCode+'"]').after("<tr class='mz-carttable-item'><td colspan=5 class='mz-carttable-item-product' style='margin-top: 20px;'><span style='font-size: 14px; font-weight: bold;'><i class='fa fa-exclamation-triangle' aria-hidden='true' style='color: #dd0000;'></i> Sorry, but "+item.product.productCode+":"+item.product.name+" no longer has enough inventory to satisfy your order.  There are "+sdkProduct.data.inventoryInfo.onlineSoftStockAvailable+" units left in stock.  Please adjust your order and try again.</span></td></tr>"); 
                        if (!isColorboxOpen) {
                  isColorboxOpen = true;
                  $.colorbox({
                    open : true,
                    maxWidth : "100%",
                    maxHeight : "100%",
                    height : "50%",
                    width : "55%",
                    scrolling : true,
                    fadeOut : 500,
                    html : "<div style='margin:20px 10px 20px 10px;'>Inventory levels have changed for some products. <br>Please review your cart and adjust quantities.<span id='itemList'></span></div>",
                    overlayClose : true,
                    trapFocus: false,
                    onComplete : function () {
                        $('#cboxClose').css({ 'background-image': 'url("/resources/images/icons/close-popup.png")' });
                        $('#cboxClose').fadeIn();
                        $('#cboxLoadedContent').css({
                            background : "#ffffff"
                        });
                        $('#cboxClose').focus();
                        //focusLoop();
                      }
                    });
                  }
                        $('#itemList').append('<ul><li><b>'+item.product.name+'</b></li></ul>');
                    }
                });
            });
          },
        estimateShip: function(e){
            var self = this;
            var stringmethods = Hypr.getThemeSetting('shippingMethods');
            var shippingMethods = stringmethods.split(',');
           e.preventDefault();
           var zipPat = /^\d{5}(?:[-\s]\d{4})?$/;
           
            $(e.currentTarget).addClass('is-loading');
            if(zipPat.test($('#shipping-zip').val()) ){
               
            $('#ziperror').hide();
            var cartData = this.model.apiModel.data;
            
            if(cartData.isEmpty !== true){
            var itemArr = [];
            
            $.each(cartData.items,function(index,obj){
                
                var item={};
                item.quantity=obj.quantity;
                item.shipsByItself=false;
                item.unitMeasurements={
                    "weight":{
                        "unit":obj.product.measurements.weight.unit,
                        "value":obj.product.measurements.weight.value
                    }
                };
                itemArr.push(item);
            });
            var now = new Date();
            var utc = new Date(Date.UTC(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getHours(), 
                now.getMinutes()
            ));
            //$('.dispdate').append('CurrentDate ' + now);
            
            var responsefiled1={
                    "carrierIds": ['ups'],
                    "destinationAddress" : {
                    "countryCode":"US",
                    "postalOrZipCode":$('#shipping-zip').val()
                    },
                    
                    "isDestinationAddressCommercial" : false,
                    "isoCurrencyCode" :Hypr.getThemeSetting('shipamtCode'),
                    "items": itemArr,
                    "originAddress": {
                        "address1": Hypr.getThemeSetting('shipaddress1'),
                        "cityOrTown":Hypr.getThemeSetting('shipcityOrTown'),
                        "countryCode":Hypr.getThemeSetting('shipcountryCode'),
                        "postalOrZipCode":Hypr.getThemeSetting('shippostalOrZipCode'),
                        "stateOrProvince":Hypr.getThemeSetting('shipstateOrProvince')
                    },
                    "shippingServiceTypes": ["ups_UPS_GROUND","ups_UPS_SUREPOST_LESS_THAN_1LB","ups_UPS_SUREPOST_1LB_OR_GREATER","ups_UPS_THREE_DAY_SELECT","ups_UPS_SECOND_DAY_AIR","ups_UPS_NEXT_DAY_AIR_SAVER"] //shippingMethods
            };
            Api.request('POST',{
              url: '/api/commerce/catalog/storefront/shipping/request-rates',
              iframeTransportUrl: 'https://' + document.location.host + '/receiver?receiverVersion=2'
            },responsefiled1).then(function(resp){
                //console.log(resp);
                $('#shipping-zip').val("") ;
                //console.log(this);
                $('#estimateShip').removeClass('is-loading'); 
                $('#estimateShip').attr('disabled','disabled');
                $('#estimateradio').html('');
                $.each(resp.rates,function(index,val){
                    //console.log(type+"\n"+val); 
                    console.log(val);
                    var shippingAmount=[];
                     for(var i=0;i<val.shippingRates.length;i++){
                        if(val.shippingRates[i].amount !== undefined){
                            shippingAmount.push(val.shippingRates[i]);    
                        }
                    }
                    var sortedRates = shippingAmount.sort(function(a,b){
                        if(a.amount !== undefined || b.amount !== undefined){
                            return a.amount - b.amount;
                        }
                    });
                    console.log(sortedRates);
                    $.each(sortedRates,function(i,o){
                        var cartModel = self.model.attributes;
                        console.log(cartModel);
                        if(o.amount !== undefined){
                            if(o.amount > 0 && o.code === "ups_UPS_GROUND" && Hypr.getThemeSetting('freeshippingBoundingValue') < cartModel.discountedSubtotal ){
                                $('#estimateradio').append("<div class='mleft18 '><input type='radio' name='shippingmethod' data-mz-value = 'shippingMethodCode' data-mz-price = "+ o.amount +" value ="+ o.code +"/><span style='margin-left:10px;'>"+ o.content.name +" - " +"$"+ (0.00).toFixed(2)  +"</span></div>");
                            } else {
                                 $('#estimateradio').append("<div class='mleft18 '><input type='radio' name='shippingmethod' data-mz-value = 'shippingMethodCode' data-mz-price = "+ o.amount +" value ="+ o.code +"/><span style='margin-left:10px;'>"+ o.content.name +" - " +"$"+ o.amount.toFixed(2) +"</span></div>");
                            }
                        }
                    });
                });
                $('input[type=radio]').change(function(e){
                   
                    var price = $(this).data('mz-price');
                    var estimatedPriceWithShipping = 0;
                    var shipMethod = $(this).val();
                    //var cartModel = require.mozuData('cart');
                    var cartModel = self.model.attributes;
                    console.log(cartModel);
                    if(Hypr.getThemeSetting('freeshippingBoundingValue') < cartModel.discountedSubtotal && shipMethod == 'ups_UPS_GROUND/' ){
                        estimatedPriceWithShipping = 0;
                        estimatedPriceWithShipping = (cartModel.discountedSubtotal).toFixed(2);
                    }else{
                        estimatedPriceWithShipping = 0;
                        estimatedPriceWithShipping = (cartModel.discountedSubtotal + price).toFixed(2);
                        
                    }
                    document.getElementById('estimateprice').innerHTML = ""; 
                    $('.ordertotalWithoutshipping').css('border-bottom','none');
                    $('.estimateprice').append("<span class='mleft18 order-total'><span class='estimate-total'>Total With Shipping:</span><span id='mz-carttable-total' class='mz-carttable-total jb-carttotalwithshipping'> $"+ estimatedPriceWithShipping +"</span></span>");
                    
                });
                
            });
        } 
            }else{
                //alert("Please enter valid Zip-code"); 
                $('#ziperror').show();
                $('#estimateradio').html('');
                $('#estimateShip').removeClass('is-loading'); 
                
                return;
            }
        }
       
    });

    $(document).ready(function () {
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
                var $target = $(e.currentTarget), productCode = $target.data("mz-prcode"); 
                var $quantity = $(e.target.parentNode.parentNode).find('#quantity')[0].options[$(e.target.parentNode.parentNode).find('#quantity')[0].options.selectedIndex];
                var count = parseInt($quantity.innerHTML,10);
                var myDate = '';  
                if($(e.currentTarget).parents('.jb-quickviewdetails').length > 0){
                    myDate = $(e.currentTarget).parents('.jb-quickviewdetails').find('.stock.green').find('b').html();
                }else{
                    myDate = $(e.currentTarget).parents('.mz-productlisting-info').find('.stock.green').find('b').html();    
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
                    $.each(Minicart.MiniCart.getRenderContext().model.items,function(k,v){
                        if(v.product.productCode == pro.get('productCode') && ((v.quantity + count) > 50)){ 
                            qntcheck = 1;
                        }
                    });
                    if(pro.get('price.price') === 0 && Minicart.MiniCart.getRenderContext().model.items.length > 0 ){
                        //console.log(MiniCart);
                        var cartItems = Minicart.MiniCart.getRenderContext().model.items;
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
  
        
       var segmentArray = document.getElementById('segments').innerHTML;
       var segments = segmentArray.split(',');  

        if(segments.indexOf('B2B-DISC-5PERCENT') > -1){
            $('.disc-text').html('Your 5% discount is shown below near the Estimated Total.');
       if($(window).width() < 767) {
         $('.disc-text').html('Your 5% discount is shown below <br><span style="padding-left:5px" > near the Estimated Total.</span>');
       }
        }

        //cart out of stock message
      Api.on('error', function (badPromise, xhr, requestConf) {
                        if(badPromise.message.indexOf('Inadequate Inventory')){
                            var obj = badPromise.message;
                            var index = obj.lastIndexOf("-");
                            var stock = obj.substring(index+1);
                            if(stock){
                                //badPromise.message=
                                badPromise.message= "<p style=margin:0>Unfortunately, there's not enough inventory to support your request now.</p>"+
                                "Please lower your Quantity to be less than, or equal to, our available inventory of "+ stock+".";
                                return false;
                            }
                    }
                });
        var cartModel = CartModels.Cart.fromCurrent(),
            cartView = new CartView({
                el: $('#cart'),
                model: cartModel,
                messagesEl: $('[data-mz-message-bar]')
            });
            window.cartView = cartView; 
            //heat sensitive message
            
            var heatMessage = window.heatMessage = cartModel.hasHeatSensitiveItems(),
                cartCount = window.cartCount = window.cartView.model.get("items").length;
            
            var getAndUpdateDates = window.getAndUpdateDates = function() {
                var cartModelItems = window.cartView.model.get("items").models,
                    items = cartModelItems.map(function(item){ return item.get('product').get('productCode'); });
                if(items.length>0){    
                    Api.request("post","/sfo/get_dates",{data: items})
                    .then(function(r) {
                        var getDates = window.getDates = r;
                        cartView.render();
                    },function(er){
                        console.error(er);
                        cartView.render();
                    });
                }    
            };
            if(window.cartView.model.get("items").length > 0) {
                getAndUpdateDates();
            } else {
                window.cartView.render();
            }
        cartModel.on('ordercreated', function (order) {
            cartModel.isLoading(true);
            window.location = "/checkout/" + order.prop('id');
        });

        cartModel.on('sync', function() {
            CartMonitor.setCount(cartModel.count());
            if (cartModel.hasHeatSensitiveItems() && Hypr.getThemeSetting('showHeatSensitiveText')) {
                $('#heat-warning').css({ display: "block" });
            //  $('.hide-when-heat-sensitive').css({ display: "none" });
            }
        });
        
        // add a free product js 
        cartModel.checkBOGA(); 
        
        window.cartView = cartView;
        cartView.render();
        
        
        /**
         * ADD CARAOUSEL in mobile view
         **/
        /*var isCarousalLoaded = false;
        setInterval(function(){
            if(!isCarousalLoaded){
                var xx = $('.recommended-product').find('.MB_CART2');
                if(xx.length>0){
                    var x= xx.children()[0];
                    x.innerHTML = '<h3 style="padding-left: 9%;width: 100%;">Jelly Belly Also Recommends</h3>';
                    isCarousalLoaded = true;
                    mybuyscarousal();
                }
            }
        }, 1000);
        */
        
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
       
       
        //CArt Reminder:
        
//         $('#keep-shopping-button').hover(
//   function() {
//     $('#keep-shopping-button').css({"background" : "#929292"});
//   }, function() {
//     $('#keep-shopping-button').css({"background" : "#c2c2c2"});
//   }
// );

        $(document).on('click', '.jb-add-to-cart,.jb-add-to-cart-cur', function(e) {  
            //e.preventDefault();
            $('[data-mz-productlist],[data-mz-facets]').addClass('is-loading');
            var $target = $(e.currentTarget), productCode = $target.data("mz-prcode");
            $('[data-mz-message-bar]').hide();
            $(document).find('.overlay-for-complete-page').addClass('is-loading');
            var $quantity = $(e.target.parentNode.parentNode).find('#quantity')[0].options[$(e.target.parentNode.parentNode).find('#quantity')[0].options.selectedIndex];
            var count = parseInt($quantity.innerHTML,10);
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
                            addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                        },2000);
                    }else{
                        // showErrorMessage("Please choose the Gift Card amount before adding it to your cart. <br> Thanks for choosing to give a Jelly Belly Gift Card!");
                        $(document).find('.overlay-for-complete-page').removeClass('is-loading');
                    }
                }else{
                    var pro = PRODUCT;
                    var qntcheck = 0;
                    $.each(Minicart.MiniCart.getRenderContext().model.items,function(k,v){
                        if(v.product.productCode == pro.get('productCode') && ((v.quantity + count) > 50)){
                            qntcheck = 1;
                        }
                    });
                    if(pro.get('price.price') === 0 && Minicart.MiniCart.getRenderContext().model.items.length > 0 ){
                        //console.log(MiniCart);
                        var cartItems = Minicart.MiniCart.getRenderContext().model.items;
                        var len = cartItems.length; 
                        for(var i=0;i<len;i++){
                            if(cartItems[i].product.productCode === pro.get('productCode')){
                                if(cartItems[i].product.price.price === pro.get('price.price')){
                                    $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                                    $(document).find('.overlay-for-complete-page').removeClass('is-loading');
                                    $('.zero-popup').show();
                                    return false;
                                }
                            }
                        }
                        addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                    }else if(qntcheck){  
                        $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                        $(document).find('.overlay-for-complete-page').removeClass('is-loading');
                        $(".items-per-order").show();
                        return false;
                    }else{
                        addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                    }
                }
            });
        });
 
        function addToCartAndUpdateMiniCart(PRODUCT,count,$target){
            PRODUCT.set({'quantity':count});
            $('#mybuyspagezone3').addClass('is-loading');
            PRODUCT.addToCart(1);
            PRODUCT.on('addedtocart', function(attr) {
                //$('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                //$('#mybuyspagezone3').removeClass('is-loading');
                CartMonitor.update();   

                //Minicart.MiniCart.showMiniCart();
                PRODUCT = '';
                setTimeout(function() {
                    // window.location.reload();
                    
                    cartView.model.apiGet();
                    cartView.render();
                    $(document).find('.RTI-overlay').removeClass('active');
                    $(document).find('.confirm-popup-body').removeClass('active');
                    $(document).find('body').removeClass('has-popup');
                }, 500); 
			
			brontoObj.build(Api);
            });
            Api.on('error', function (badPromise, xhr, requestConf) {
                $('#mybuyspagezone3').removeClass('is-loading');
                $(document).find('.RTI-overlay').removeClass('active');
            }); 
            setTimeout(function(){
                // add a free product js
                cartModel.checkBOGA();   
            },2000);       
        }

        $(document).on('click','.jb-out-of-stock-cur', function(e) {
            var $prevTarget = $(e.target);  
            $.colorbox({  
                open : true,
                maxWidth : "100%",
                maxHeight : "100%",
                scrolling : false,
                fadeOut : 500,
                html :  "<div id='notify-me-dialog-cur' style='padding: 20px;'><form><span>Enter your email address to be notified when this item is back in stock.</span><br><input style='margin-top: 10px;' id='mz-instock-request-email-cur' type='text' value='"+decodeURIComponent(jQuery.cookie('userData'))+"'><span style='background: #39A857; color: #ffffff; padding: 3px; margin-left: 5px; cursor: pointer;' id='instock-notification-signup-button-cur' data-mz-product-code='" + e.target.getAttribute('data-mz-product-code') + "'>NOTIFY ME</span></form><div class='notify-error' style='color:red; font-size:15px;display:none;'>Please enter a valid Email id</div></div>", //"/resources/intl/geolocate.html",
                overlayClose : true,
                trapFocus: false, 
                onComplete : function () {
                    $('#cboxClose').show().attr({'role':'button','aria-label':'close dialog'});
                    $('#cboxLoadedContent').css({
                        background : "#ffffff"
                    });
                    $('#notify-me-dialog').focus();
                    notifymedilog(); 
                }
            });
            $(document).find('body').addClass("haspopup");
        });
    
        notifymedilog();
    
        function notifymedilog(){
            window.notifyinputs = $(document).find('#cboxContent').find('select, input, textarea, button, a').filter(':visible');   
            window.notifyfirstInput = window.notifyinputs.first();
            window.notifylastInput = window.notifyinputs.last(); 
            
             // if current element is last, get focus to first element on tab press.
            window.notifylastInput.on('keydown', function (e) {
               if ((e.which === 9 && !e.shiftKey)) {
                   e.preventDefault();
                   window.notifyfirstInput.focus(); 
               }
            });
            
            // if current element is first, get focus to last element on tab+shift press.
            window.notifyfirstInput.on('keydown', function (e) {
                if ((e.which === 9 && e.shiftKey)) {
                    e.preventDefault();
                    window.notifylastInput.focus();  
                }
            }); 
        }
        
        $(document).on('click', '#instock-notification-signup-button-cur', function(e){
            if($('#mz-instock-request-email-cur').val() !== ""){
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var patt = new RegExp(re);
            if(patt.test($('#mz-instock-request-email-cur').val())){
                var obj = {
                    email: $('#mz-instock-request-email-cur').val(),
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
                        $("#notify-me-dialog-cur").fadeOut(500, function () { $("#notify-me-dialog-cur").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
                    }, function () {
                        $("#notify-me-dialog-cur").fadeOut(500, function () { $("#notify-me-dialog-cur").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
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
        
        //custom discount modification 
        
        $(document).on('click','.trigger-render',function(){
            cartView.renderTest();      
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
        
        // JEL-135 fix
        $(document).on('blur','[data-mz-value="quantity"]', function(e) {
            if($(this).val() === "")
                $(this).val($(this).attr('value'));
        });
        if (cartModel.hasHeatSensitiveItems())
          $('#heat-warning').show();
    });   
});

