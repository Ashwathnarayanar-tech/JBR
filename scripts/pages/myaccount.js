define(['modules/backbone-mozu', 'hyprlive', 'modules/jquery-mozu', 'underscore',
'modules/models-customer', 'modules/views-paging',
'modules/api',
'modules/models-product',
'modules/models-cart',
'modules/cart-monitor',
"modules/alert-popup",
'modules/minicart',"vendor/jquery.mask"], 
function(Backbone, Hypr, $, _, CustomerModels, PagingViews,Api,
ProductModels, CartModels, CartMonitor,AlertPopup,MiniCart) {
    
    var EditableView = Backbone.MozuView.extend({
        constructor: function () {
            Backbone.MozuView.apply(this, arguments);
            this.editing = {};
        },
        getRenderContext: function () {
            var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            c.editing = this.editing;
            return c;
        },
        doModelAction: function (action, payload) {
            var self = this,
            renderAlways = function () {
                self.render();
            };
            var operation = this.model[action](payload);
            if (operation && operation.then) {
                operation.then(renderAlways,renderAlways);
                return operation;
            }
        }
    });
    
    
    var AccountSettingsView = EditableView.extend({
        templateName: 'modules/my-account/my-account-settings',
        autoUpdate: [
            'firstName',
            'lastName',
            'emailAddress',
            //'primaryBillingContact.phoneNumbers.home',
            'oldPassword',
            'password',
            'confirmPassword',
            'acceptsMarketing'
        ],
        updateAcceptsMarketing: function(e) {
            var yes = $(e.currentTarget).prop('checked');
            this.model.set('acceptsMarketing', yes);
            this.model.updateAcceptsMarketing(yes);
        },
        startEditName: function () {
            this.editing.name = true;
            this.render();
        },
        
        startEditEmail: function () {  
            this.editing.name = true;
            this.render();
        },
        cancelEditName: function() {
            this.editing.name = false;
            this.render();
        },
        finishEditName: function () {
            if(this.$el.find('input')[0].value.length>0 && this.$el.find('input')[1].value.length>0 && this.$el.find('input')[2].value.length>0){
                this.doModelAction('updateName');
                this.editing.name = false;
            }else{
                if(this.$el.find('input')[1].value.length === 0){
                    this.$('[data-mz-validationmessage-for="firstName"]').show().text("Please add your First Name.").fadeOut(3000);
                }else if(this.$el.find('input')[2].value.length === 0){
                    this.$('[data-mz-validationmessage-for="lastName"]').show().text("Please add your Last Name.").fadeOut(3000);
                }
            }
        },
        startEditPassword: function () {
            this.editing.password = true;
            this.render();
        },
        finishEditPassword: function() {
            var self = this;
            this.doModelAction('changePassword').then(function() {
                _.delay(function() {
                    self.$('[data-mz-validationmessage-for="passwordChanged"]').show().text(Hypr.getLabel('passwordChanged')).fadeOut(3000);
                }, 250);
            });
            this.editing.password = false;
        },
        cancelEditPassword: function() {
            this.editing.password = false;
            this.render();
        }
        //startEditPhone: function() {
        //    this.editing.phone = true;
        //    this.render();
        //},
        //finishEditPhone: function() {
        //    this.doModelAction('savePrimaryBillingContact');
        //    this.editing.phone = false;
        //},
        //cancelEditPhone: function() {
        //    this.editing.phone = false;
        //    this.render();
        //}
    });
    
    var WishListView = EditableView.extend({
        templateName: 'modules/my-account/my-account-wishlist',
        addItemToCart: function (e) {
            var self = this, $target = $(e.currentTarget),
            id = $target.data('mzItemId');
            if (id) {
                this.editing.added = id;
                return this.doModelAction('addItemToCart', id);
            }
        },
        doNotRemove: function() {
            this.editing.added = false;
            this.editing.remove = false;
            this.render();
        },
        beginRemoveItem: function (e) {
            var self = this;
            var id = $(e.currentTarget).data('mzItemId');
            if (id) {
                this.editing.remove = id;
                this.render();
            }
        },
        finishRemoveItem: function(e) {
            var self = this;
            var id = $(e.currentTarget).data('mzItemId');
            if (id) {
                var removeWishId = id;
                return this.model.apiDeleteItem(id).then(function () {
                    self.editing.remove = false;
                    var itemToRemove = self.model.get('items').where({ id: removeWishId });
                    if (itemToRemove) {
                        self.model.get('items').remove(itemToRemove);
                        self.render();
                    }
                });
            }
        }
    });
    
    
    var OrderHistoryView = Backbone.MozuView.extend({
        templateName: "modules/my-account/order-history-list",
        currentOrderId: '',
        autoUpdate: [
            'rma.returnType',
            'rma.reason',
            'rma.quantity',
            'rma.comments'
        ],
        initialize: function () {
            // this.listenTo(this.model, "change:pageSize", _.bind(this.model.changePageSize, this.model));
			//this.lookupRequestors();
            var isloadingMoreItems = window.isloadingMoreItems = false;
        },
        loadMoreItems: function(){
            this.model.changePageSize(true);
            window.isloadingMoreItems = true;
			//this.lookupRequestors();
        },
        increaseReturnQuantity: function(){
            $('[data-mz-value="rma.quantity"]').val($('[data-mz-value="rma.quantity"]').val()===""?1:parseInt($('[data-mz-value="rma.quantity"]').val(),10)+1);
        },
        decreaseReturnQuantity: function(){
            $('[data-mz-value="rma.quantity"]').val($('[data-mz-value="rma.quantity"]').val()===""?1:parseInt($('[data-mz-value="rma.quantity"]').val(),10)-1);
        },
        getRenderContext: function () {
            var me = this;
            var context = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            context.returning = this.returning;
            if(context.model.hasNextPage) {
                context.model.allLoaded = 1;
            }else{
                context.model.allLoaded = 2;
            }
            var orders = [];
            $.each(context.model.items,function(){
                orders.push(this.orderNumber);
            });
            this.lookupRequestors(orders);
            if(window.isloadingMoreItems ) {
                window.isloadingMoreItems  = false;
                setTimeout(function() {
                    //me.updateShippingDates();
                    window.updateDates.getAvailableShipDates();
                    me.render();
                }, 500);
            }
            return context;
        },
        startReturnItem: function (e) {
            var $target = $(e.currentTarget),
            itemId = $target.data('mzStartReturn'),
            orderId = $target.data('mzOrderId'),
            currentOrderId = orderId;
            if (itemId && orderId) {
                this.returning = itemId;
                this.model.startReturn(orderId, itemId);
            }
            this.model.attributes.itemReturnOrderID = e.target.getAttribute('data-mz-order-id');
            this.render();
        },
        cancelReturnItem: function () {
            delete this.returning;
            this.model.clearReturn();
            this.render();
        },
        finishReturnItem: function () {
            var self = this,
            op = this.model.finishReturn();
            if (op) {
                return op.then(function () {
                    delete self.returning;
                    self.render();
                });
            }
        },        
        
        addAllToCart: function(e){
            var orderId = e.currentTarget.getAttribute('orderToAdd'),me = this;
            $('.addtocartoverlay').show(); 
            if(typeof $.cookie("isSubscriptionActive") === "undefined"){
                $('[data-mz-action="addAllToCart"][orderToAdd="'+orderId+'"]').addClass('active');
                var data = [];
                $('[orderId="'+orderId+'"]').find('.mz-itemlisting').each(function(){
                    var temp = {};
                    temp.productCode = $(this).find('[quickOrderProductCode]')[0].getAttribute('quickorderproductcode');
                    temp.quantity = $(this).find('[quickOrderQuantity]')[0].value;
                    temp.location = $(this).find('[quickOrderProductCode]')[0].getAttribute('locationcode');
                    temp.inventory = $(this).find('[quickOrderProductCode]')[0].getAttribute('inventory');
                    temp.name = $(this).find('[quickOrderProductCode]')[0].getAttribute('name');
                    data.push(temp);
                });
                var hasFuture = false;
                $(document).find('[orderid="'+orderId+'"]').find('.inline-add-to-cart').each(function(){
                    if($(this).hasClass('show-futureprod-alert')){
                        hasFuture = true;
                    }
                });
                if(hasFuture){
                    this.showpopupAll(data,orderId); 
                }else{
                    this.makeQuickOrder(data,orderId);
                }
            }else if(typeof $.cookie("isSubscriptionActive") !== "undefined"){
                var hasFutureProd = false;
                $(document).find('[orderid="'+orderId+'"]').find('.inline-add-to-cart').each(function(){
                    if($(this).hasClass('show-futureprod-alert')){
                        hasFutureProd = true;
                    }
                });
                if(hasFutureProd){
                    AlertPopup.AlertView.fillmessage("future-dailog",Hypr.getLabel('futureSubscription'), function(result) {
                        if(!result) {
                             AlertPopup.AlertView.closepopup();
                        }else{
                            AlertPopup.AlertView.closepopup();
                        } 
                        $('.addtocartoverlay').hide();
                    });
                }else{
                    $('[data-mz-action="addAllToCart"][orderToAdd="'+orderId+'"]').addClass('active');
                    var datas = [];
                    $('[orderId="'+orderId+'"]').find('.mz-itemlisting').each(function(){
                        var temp = {};
                        temp.productCode = $(this).find('[quickOrderProductCode]')[0].getAttribute('quickorderproductcode');
                        temp.quantity = $(this).find('[quickOrderQuantity]')[0].value;
                        temp.location = $(this).find('[quickOrderProductCode]')[0].getAttribute('locationcode');
                        temp.inventory = $(this).find('[quickOrderProductCode]')[0].getAttribute('inventory');
                        temp.name = $(this).find('[quickOrderProductCode]')[0].getAttribute('name');
                        datas.push(temp);
                    });
                    this.makeQuickOrder(datas,orderId);
                }
            }else{
                AlertPopup.AlertView.fillmessage("addall-dailog","You have started building a Subscription. Do you want to add this item to your Subscription?", function(result) {
                    if(!result) {
                        AlertPopup.AlertView.fillmessage("second-dailog","We can't mix Subscription and non-Subscription items at this time. Do you want to remove the Subscription item(s) from the cart?", function(result1) {
                            if(result1) {
                                var cartModel = CartModels.Cart.fromCurrent();
                                try {
                                    // empty cart
                                    cartModel.apiEmpty().then(function(res) {
                                    AlertPopup.AlertView.closepopup();
                                        // remove subscription cookie
                                        $.removeCookie("isSubscriptionActive",{path:"/"});
                                        $.removeCookie("scheduleInfo",{path:"/"});
                                        if(hasFuture){
                                            me.showpopupAll(data,orderId); 
                                        }else{
                                            me.makeQuickOrder(data,orderId);
                                        }
                                    });
                                }
                                catch(e){
                                    console.error(e);
                                }
                            }
                            else {
                                AlertPopup.AlertView.closepopup();
                                $('.addtocartoverlay').hide();
                            }
                        });
                    } else {
                        // add product as subscription
                        AlertPopup.AlertView.closepopup();
                        $('.addtocartoverlay').hide(); 
                        if(hasFuture){
                            me.showpopupAll(data,orderId); 
                        }else{
                            me.makeQuickOrder(data,orderId);
                        }
                    }
                });
            } 
        },
        showpopupAll: function(data,orderId){
            var self = this; 
            var myDate = self.firstShipDateFormat(window.getDates.FirstShipDate);  
            $(document).find('.confirmation-popup').find('.bold-text').html(myDate);
            $(document).find('.confirmation-popup').find('.add-to-cart-popup').addClass('popupAddall');
            $(document).find('.confirmation-popup').find('.popupAddall').removeClass('add-to-cart-popup');
            $(document).find('.confirmation-popup').addClass('active');
            $(document).find('.confirm-popup-body').addClass('active');   
            $(document).find('body').addClass('has-popup');  
            $(document).on('click','.popupAddall',function(e){
                $(document).find('.confirmation-popup').find('.popupAddall').addClass('add-to-cart-popup');
                $(document).find('.confirmation-popup').find('.add-to-cart-popup').removeClass('popupAddall');
                self.makeQuickOrder(data,orderId);
                $(document).find('.confirmation-popup').removeClass('active');
                $(document).find('.confirm-popup-body').removeClass('active');
                $(document).find('body').removeClass('has-popup');
            }); 
        },
        firstDateFormat:function(fdate){
            var me=this,
            blackoutDates = [];
            if(window.getDates.BlackoutDates.length > 0) {
                blackoutDates = window.getDates.BlackoutDates.map(function(d) {
                    return me.formatDate(d);
                });
            }
            var nextday = new Date(fdate); 
            var businessdays=1,day,month,year,currentDate,comparedate;
            while(businessdays) {
                nextday.setFullYear(nextday.getFullYear(),nextday.getMonth(),nextday.getDate());
                day = nextday.getDay();
                month = nextday.getMonth();
                year = nextday.getFullYear();
                currentDate = nextday.getDate(); 
                comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                if(day===0 || day===6 ||blackoutDates.indexOf(comparedate) !== -1) {
                    nextday.setFullYear(year,month,(currentDate+1));
                } else {
                    businessdays--;
                }
            }
            return ('0'+(nextday.getMonth()+1)).slice(-2)+ '/' + ('0'+nextday.getDate()).slice(-2) + '/' + nextday.getFullYear();
        },
        firstShipDateFormat: function(fdate){
            var udate = new Date(fdate),me=this,
            sdate =  new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
            var preDate= new Date();
            if(sdate>preDate && sdate>(preDate.setFullYear(preDate.getFullYear(),preDate.getMonth(),(preDate.getDate()+1)))){
               return me.firstDateFormat(sdate); 
            }else{
                var date = new Date(),
                m = date.getMonth(),
                d = date.getDate(),
                y = date.getFullYear(),
                startdate = ('0'+(m+1)).slice(-2)+ '/' + ('0'+d).slice(-2) + '/' + y;
                
                var blackoutDates = [];
                if(window.getDates.BlackoutDates.length > 0) {
                    blackoutDates = window.getDates.BlackoutDates.map(function(d) {
                        return me.formatDate(d);
                    });
                }
                
                var nextday = new Date(); 
                var businessdays=2,day,month,year,currentDate,comparedate;
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
                return   ('0'+(nextday.getMonth()+1)).slice(-2)+ '/' + ('0'+nextday.getDate()).slice(-2) + '/' + nextday.getFullYear();
            }
        },
        addInlineItemToCartmyacc: function(e){ 
            var me = this;
            $('.addtocartoverlay').show(); 
            if(typeof $.cookie("isSubscriptionActive") === "undefined") {
                this.addSingleItemtoCart(e);
            }
            else {
                AlertPopup.AlertView.fillmessage("addinline-dailog","You have started building a Subscription. Do you want to add this item to your Subscription?", function(result) {
                    console.log(result);
                    if(!result) {
                        AlertPopup.AlertView.fillmessage("second-dailog","We can't mix Subscription and non-Subscription items at this time. Do you want to remove the Subscription item(s) from the cart?", function(result1) {
                            console.log(result1);
                            if(result1) {
                                console.log("will clear cart and subscription related cookie & update cart with selected item as non-Subscription");
                                var cartModel = CartModels.Cart.fromCurrent();
                                try {
                                    // empty cart
                                    cartModel.apiEmpty().then(function(res) {
                                    AlertPopup.AlertView.closepopup();
                                        // remove subscription cookie
                                        $.removeCookie("isSubscriptionActive",{path:"/"});
                                        $.removeCookie("scheduleInfo",{path:"/"});

                                        me.addSingleItemtoCart(e);
                                    });
                                }
                                catch(e){
                                    console.error(e);
                                }
                            }
                            else {
                                AlertPopup.AlertView.closepopup();
                                $('.addtocartoverlay').hide();
                                console.log("do nothing, keep cart as it is!");
                            }
                        });
                    } else {
                        // add product as subscription
                        console.log("add product as subscription");
                        AlertPopup.AlertView.closepopup();
                        me.addSingleItemtoCart(e);
                    }
                });
            } 
        },
        addSingleItemtoCart:function(e){
            var orderNumber = $(e.currentTarget).parent().parent().attr('orderid');   
            var quantityElement =$(e.currentTarget).parent().find('.quick-order-quantity').find('.quantity-field');   
            var temp = {};
            temp.productCode =  e.currentTarget.getAttribute('quickOrderProductCode');
            temp.quantity = quantityElement.val();
            temp.location = e.currentTarget.getAttribute('locationcode');
            temp.inventory = e.currentTarget.getAttribute('inventory');
            temp.name = e.currentTarget.getAttribute('name');
            var data = [];
            data.push(temp);
            this.makeQuickOrder(data,orderNumber);
        },
        decreaseQuickOrderQuantity: function(e){
            var productId = e.currentTarget.getAttribute('quickOrderProductCodeQuantityChanger');
            var orderId = $(e.currentTarget).parents('[orderid]').attr('orderid');             
            if(parseInt($('[orderId="'+orderId+'"].mz-orderlisting-items .quantity-field[OrderProductId="'+productId+'"]').val(),10)<2){
                $('[orderId="'+orderId+'"] [data-mz-action="decreaseQuickOrderQuantity"][quickorderproductcodequantitychanger="'+productId+'"]').prop('disabled', true);
            }else{
                $('[orderid="'+orderId+'"].mz-orderlisting-items .quantity-field[OrderProductId="'+productId+'"]').val($('[orderid="'+orderId+'"].mz-orderlisting-items [OrderProductId="'+productId+'"]').val()===""?1:parseInt($('[orderid="'+orderId+'"].mz-orderlisting-items [OrderProductId="'+productId+'"]').val(),10)-1);
                $('[orderid="'+orderId+'"] [data-mz-action="decreaseQuickOrderQuantity"][quickorderproductcodequantitychanger="'+productId+'"]').prop('disabled', false);
                $('[orderid="'+orderId+'"] [data-mz-action="increaseQuickOrderQuantity"][quickorderproductcodequantitychanger="'+productId+'"]').prop('disabled', false); 
            }       
        },
        increaseQuickOrderQuantity: function(e){
            var productId = e.currentTarget.getAttribute('quickOrderProductCodeQuantityChanger');
            var orderId = $(e.currentTarget).parents('[orderid]').attr('orderid');
            var price = $('[orderId="'+orderId+'"].mz-orderlisting-items .inline[OrderProductId="'+productId+'"]').attr('productprice');
            if(parseInt(price,10)>0){ 
                if(parseInt($('[orderid="'+orderId+'"].mz-orderlisting-items .quantity-field[OrderProductId="'+productId+'"]').val(),10)> 49 ){
                    $('[orderid="'+orderId+'"] [data-mz-action="increaseQuickOrderQuantity"][quickorderproductcodequantitychanger="'+productId+'"]').prop('disabled', true);
                }else{
                    $('[orderid="'+orderId+'"].mz-orderlisting-items .quantity-field[OrderProductId="'+productId+'"]').val($('[orderid="'+orderId+'"].mz-orderlisting-items [OrderProductId="'+productId+'"]').val()===""?1:parseInt($('[orderid="'+orderId+'"].mz-orderlisting-items [OrderProductId="'+productId+'"]').val(),10)+1);
                    $('[orderid="'+orderId+'"] [data-mz-action="increaseQuickOrderQuantity"][quickorderproductcodequantitychanger="'+productId+'"]').prop('disabled', false);
                    if(parseInt($('[orderid="'+orderId+'"].mz-orderlisting-items .quantity-field[OrderProductId="'+productId+'"]').val(),10)>1 ){
                        $('[orderid="'+orderId+'"] [data-mz-action="decreaseQuickOrderQuantity"][quickorderproductcodequantitychanger="'+productId+'"]').prop('disabled', false);
                    }
                }
            }                
        },
        makeQuickOrder: function(products,orderId){
            var errorArray = [], self = this, productAdded = 0,time = 1500, productNotAdded = 0;
            errorArray.outOfSotck = []; errorArray.zeroDolPrd = []; errorArray.maxqty = [];
            var cartItems = MiniCart.MiniCart.getRenderContext().model.items;
            if(products.length > 0){
                var productCodes = [],locationCodes=[],productData=[];
                products.filter(function(e){
                    var temp = {}, error = "";
                    var item =cartItems.filter(function(obj) {return obj.product.productCode == e.productCode;})[0];
                    if(e.inventory > 0){
                        if(item && (parseFloat(e.quantity,10)+parseFloat(item.quantity,10)) <= e.inventory){
                            if(item.product.price.price > 0){
                                if((parseFloat(e.quantity,10)+parseFloat(item.quantity,10)) <= 50){
                                    temp.productcode = e.productCode;
                                    temp.quantity = e.quantity;
                                    productData.push(temp); 
                                    productAdded++;
                                }else{
                                    error = {};
                                    error.code = e.productCode;
                                    error.message = "Sorry, but you can't order more than 50 at a time.";
                                    error.name = e.name;
                                    errorArray.maxqty.push(error); 
                                    productNotAdded++;
                                }
                            }else{
                                error = {};
                                error.code = e.productCode;
                                error.message = "Sorry, but free items are one-per-order. If you need more, please call Customer Service at 800-323-9380.";
                                error.name = e.name;
                                errorArray.zeroDolPrd.push(error); 
                                productNotAdded++;
                            } 
                        }else if(parseFloat(e.quantity,10) <= e.inventory){
                            if(parseFloat(e.quantity,10) <= 50){
                                temp.productcode = e.productCode;
                                temp.quantity = e.quantity;
                                productData.push(temp); 
                                productAdded++;
                            }else{
                                error = {};
                                error.code = e.productCode;
                                error.message = "Sorry, but you can't order more than 50 at a time.";
                                error.name = e.name;
                                errorArray.maxqty.push(error); 
                                productNotAdded++;
                            }
                        }else{
                            error = {}; 
                            error.code = e.productCode;
                            error.message = "This item is currently out of stock.";
                            error.name = e.name;
                            errorArray.outOfSotck.push(error); 
                            productNotAdded++;
                        }
                    }else{
                        error = {};
                        error.code = e.productCode;
                        error.message = "This item is currently out of stock.";
                        error.name = e.name;
                        errorArray.outOfSotck.push(error); 
                        productNotAdded++;    
                    }
                });
                if(productData.length > 0){
                    Api.request('POST', 'svc/bulkadd', productData).then(function(res){
                        if(res.status == "success"){
                            self.showMessages(errorArray,orderId,true); 
                            $('.addtocartoverlay').hide(); 
                            CartMonitor.update();
                            MiniCart.MiniCart.showMiniCart(); 
                        }else{
                            self.showMessages(errorArray,orderId,true); 
                            $('.addtocartoverlay').hide(); 
                            CartMonitor.update();
                            MiniCart.MiniCart.showMiniCart();
                        } 
                    }); 
                }else{
                    self.showMessages(errorArray,orderId,true); 
                    $('.addtocartoverlay').hide(); 
                }        
            }else{
                self.showMessages(errorArray,orderId,false); 
                $('.addtocartoverlay').hide(); 
            }
        },

        showMessages: function(errorArray,orderId,flag){
            $(document).find('.confirm-popup-body').removeClass('active');
            $(document).find('.mz-orderlisting-items').find('.mz-itemlisting').find('.mz-item-error').html('');
            var order = $(document).find('.mz-orderlisting-items[orderid="'+orderId+'"]');
            var str = '<div class="notaddedMsg">You have not added the following products.</div>', shownotadd = false;
            if(errorArray.outOfSotck.length > 0){
                shownotadd = true;
                errorArray.outOfSotck.filter(function(v){
                    order.find('.mz-itemlisting[data-attr-code="'+v.code+'"]').find('.mz-item-error').html(v.message);   
                    str = str + "<p class='notaddeditem'>"+v.name+"</p>";
                });  
            }
            if(errorArray.maxqty.length > 0){
                shownotadd = true;
                errorArray.maxqty.filter(function(v){
                    order.find('.mz-itemlisting[data-attr-code="'+v.code+'"]').find('.mz-item-error').html(v.message);   
                    str = str + "<p class='notaddeditem'>"+v.name+"</p>";
                });  
            }
            if(errorArray.zeroDolPrd.length > 0){
                shownotadd = true;
                errorArray.zeroDolPrd.filter(function(v){
                    order.find('.mz-itemlisting[data-attr-code="'+v.code+'"]').find('.mz-item-error').html(v.message);   
                    str = str + "<p class='notaddeditem'>"+v.name+"</p>";
                });  
            }
            if(flag){
                var popup = $(document).find('.error-popup-orderHistory');
                if(shownotadd){ popup.find('.notAdded').html(str); }  
                popup.addClass('active');
                setTimeout(function(){ popup.removeClass('active'); popup.find('.notAdded').html("");}, 3000);
            }
        },
        lookupRequestors: function(orderIds) {        
            Api.request('POST', "/svc/order_information", { orders:orderIds  }).then(function(res){
                $(".placed-by").each(function(pb) {
                    var z = this;
                    var submitter = _.find(res.result, function(lookup) {
                        return z.getAttribute("orderid") == lookup.MozuOrderNumber;
                    });
                    submitter = (submitter === undefined ? "unknown" : submitter.Email );
                    $('.placed-by[orderID="'+z.getAttribute("orderid")+'"]').text(submitter);
                });
            });
        },
        /* v.r.s changes for SFO */
        updateShippingDates:function() {
            var me = this,
                blackoutdates = [];
            if(window.getDates.BlackoutDates.length > 0) {
				blackoutdates = window.getDates.BlackoutDates.map(function(d) {
				   return me.formatDate(d);
				});
			}			
            me.model.get("items").models.forEach(function(el){ 
                el.get("items").forEach(function(prod){
                    var foundEl = _.findWhere(window.getDates.Items, {SKU: prod.get("product.productCode")});
                     
                    var udate = new Date(foundEl.FirstShipDate),
                        futureDate =  new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
                    var startdate = ('0'+(futureDate.getMonth()+1)).slice(-2)+ '/' + ('0'+futureDate.getDate()).slice(-2) + '/' + futureDate.getFullYear();

                    var nextday = new Date(),businessdays=2,day,month,year,currentDate,comparedate;
					while(businessdays){
						nextday.setFullYear(nextday.getFullYear(),nextday.getMonth(),(nextday.getDate()+1));
						day = nextday.getDay();
						month = nextday.getMonth();
						year = nextday.getFullYear();
						currentDate = nextday.getDate(); 
						comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
						 
						if(day===0 || day===6 ||blackoutdates.indexOf(comparedate) !== -1){
							nextday.setFullYear(year,month,currentDate);
						}else{
							businessdays--;
						}
					}
                    if(foundEl && foundEl.FirstShipDate) {
                        /* check if date is regular or future and then determine if product is a regular one or SFO */
                        if(foundEl.inventory > 0 && futureDate > nextday) {
                            prod.set("isFutureProduct",true);
                        }    
                        
                        prod.set("nextAvailableDate",startdate);
                        prod.set("availableInventory",foundEl.inventory);
                    }
                    else {
                      prod.set("availableInventory",foundEl.inventory); 
                    }
                });
            });
        },
        formatDate: function(date) {
            var udate = new Date(date),
                sdate =  new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
            var startdate = ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
            return startdate;
        },
        render: function() {            
            Backbone.MozuView.prototype.render.apply(this);
        }
    }),

    MyaccountSubscriptionView = Backbone.MozuView.extend({
        templateName: "modules/my-account/subscription-history-list",
        additionalEvents: {
            "click .subs-list-heading": "toggleShow",
            "click #pause-subscription": "pauseSubcription",
            "click #unpause-subscription": "unPauseSubcription",
            "click #cancel-subscription": "cancelSubcription",
            "click .edit-subscription": "editSubcription",
            "change #skip-subscription": "skipSubscription",
            "click .mz-more-order": "loadMoreItems",
            "mouseenter .mz-schedule.paused": "handleMouseEnter",
            "mouseleave .mz-schedule.paused": "handleMouseExit"

        },
        toggleShow: function(e) {
            e.preventDefault();
            if($(e.currentTarget).hasClass('active')) {
                $(e.currentTarget).removeClass('active');
                $(e.currentTarget).nextAll('.subs-list-details').slideUp();
                $(e.currentTarget).find('.plus-minus a').html('&#43;');
            }
            else {
                $('.subs-list-heading').removeClass('active');
                $('.subs-list-heading').find('.plus-minus a').html('&#43;');
                $('.subs-list-heading').nextAll('.subs-list-details').slideUp();
                $(e.currentTarget).addClass('active');
                $(e.currentTarget).nextAll('.subs-list-details').slideDown();
                $(e.currentTarget).find('.plus-minus a').html('&#8722;');

            }
        },
        pauseSubcription: function(e) {
            //console.log(e.target);
            var currentAction = window.currentAction = $(e.target).parents('.mz-subscription-listing').attr('data-subscription');
            var me = this,paused = window.paused = true,
            customerId = me.model.get("customerId");
            AlertPopup.AlertView.fillmessage("pause-dailog", "If you Pause your Subscription the coming deliveries will get cancelled until you Unpause it. Are you sure?", function(userChoice) {
                if(userChoice && window.paused) {
                    
                    $(".overlay-for-complete-page").addClass("overlay-shown");
                    $(".mz-subscriptionhistory").addClass("is-loading");
                    //console.log(me.model.get("orderDetails"));
                    var counter = 1;
                    while(counter){
                        if(me.model.get("orderDetails")[counter-1].subscriptionId == window.currentAction){
                            me.model.get("orderDetails")[counter-1].subscribedStatus = "Paused";
                            me.model.get("orderDetails")[counter-1].modifiedDate = new Date().toISOString();
                            counter = 0;
                            window.paused = false;
                        }else{ 
                            counter++;
                        } 
                    }
                    // me.model.get("orderDetails").find(function(obj){
                    //     if(obj.subscriptionId == $(e.target).parents(".mz-subscription-listing").data("subscription")) {
                    //         //console.log(obj);
                    //         obj.subscribedStatus = "Paused";
                    //         obj.modifiedDate = new Date().toISOString();
                    //     }
                    // });
                    try {
                        //me.model.get("orderDetails").reverse();
                        //need to test against multiple accounts
                       // Api.request('PUT', '/api/platform/entitylists/createsubscription@jbellyretailer/entities/' + customerId, me.model.attributes).then(function(res) {
                        Api.request('POST', 'svc/getSubscription',{method:"UPDATE",data:me.model.attributes}).then(function(res) {
                            console.log(res);
                            if(res) {
                                setTimeout(function(){
                                    var activeEl = $(document).find('.subscription-contianer[subscriptionid="'+window.currentAction+'"]');
                                    activeEl.find(".subs-list-heading").addClass("active");
                                    activeEl.find(".subs-list-details").show();
                                    window.currentAction = 0;
                                },2000);
                            }
                            $(".overlay-for-complete-page").removeClass("overlay-shown");
                            $(".mz-subscriptionhistory").removeClass("is-loading");
                            //me.model.get("orderDetails").reverse();
                            me.render();
                            $(document).find('.subs-list-heading.active').find('.plus-minus a').html('&#8722;');
                            // if(currentAction != "undefined") {
                            //     currentAction.parents("[data-subscription]").find(".subs-list-heading").addClass("active");
                            //     currentAction.parents("[data-subscription]").find(".subs-list-heading").next().show();
                            // }
                        }).then(function(er) {
                            //console.log("in reject..");
                            $(document).find('.subs-list-heading.active').find('.plus-minus a').html('&#8722;');
                            console.log(er);
                            $(".overlay-for-complete-page").removeClass("overlay-shown");
                            $(".mz-subscriptionhistory").removeClass("is-loading");
                        });
                    } catch(error) {
                        //console.error("in catch");
                        console.error(error);
                    }
                    AlertPopup.AlertView.closepopup();
                }
                else {
                    AlertPopup.AlertView.closepopup();
                }
            });
        },
        unPauseSubcription: function(e) {
            var currentAction = window.currentAction = $(e.target).parents('.mz-subscription-listing').attr('data-subscription');
            var me = this,unpaused = window.unpaused = true,
                customerId = me.model.get("customerId");
            AlertPopup.AlertView.fillmessage("unpause-dailog", "Are you sure you want to UnPause your Subscription?", function(userChoice) {
                if(userChoice && window.unpaused) {
                    $(".overlay-for-complete-page").addClass("overlay-shown");
                    $(".mz-subscriptionhistory").addClass("is-loading");
                    //console.log(me.model.get("orderDetails"));
                    var counter = 1;
                    while(counter && window.unpaused){
                        if(me.model.get("orderDetails")[counter-1].subscriptionId == window.currentAction){
                            me.model.get("orderDetails")[counter-1].subscribedStatus = "Active";
                            me.model.get("orderDetails")[counter-1].modifiedDate = new Date().toISOString();
                            counter = 0;
                            window.unpaused = false;
                        }else{
                            counter++;
                        } 
                    }
                    // me.model.get("orderDetails").find(function(obj){
                    //     if(obj.subscriptionId == $(e.target).parents(".mz-subscription-listing").data("subscription")) {
                    //         //console.log(obj);
                    //         obj.subscribedStatus = "Active";
                    //         obj.modifiedDate = new Date().toISOString();
                    //     }
                    // });
                    try {
                        //need to test against multiple accounts
                        Api.request('POST', 'svc/getSubscription',{method:"UPDATE",data:me.model.attributes}).then(function(res) {
                        //Api.request('PUT', '/api/platform/entitylists/createsubscription@jbellyretailer/entities/' + customerId, me.model.attributes).then(function(res) {
                            //console.log(res);
                            if(res) {
                                setTimeout(function(){
                                    var activeEl = $(document).find('.subscription-contianer[subscriptionid="'+window.currentAction+'"]');
                                    activeEl.find(".subs-list-heading").addClass("active");
                                    activeEl.find(".subs-list-details").show();
                                    window.currentAction = 0;
                                },2000);
                            }
                            $(".overlay-for-complete-page").removeClass("overlay-shown");
                            $(".mz-subscriptionhistory").removeClass("is-loading");
                            me.render();
                            $(document).find('.subs-list-heading.active').find('.plus-minus a').html('&#8722;');
                            // if(currentAction != "undefined") {
                            //     currentAction.parents("[data-subscription]").find(".subs-list-heading").addClass("active");
                            //     currentAction.parents("[data-subscription]").find(".subs-list-heading").next().show();
                            // }
                        }).then(function(er) {
                            console.log(er);
                            //$(e.currentTarget).parents(".subscription-contianer").find('.plus-minus a').html('&#8722;');
                        });
                    } catch(error) {
                        console.error(error);
                    }
                    AlertPopup.AlertView.closepopup();
                }
                else {
                    AlertPopup.AlertView.closepopup();
                }
            });
        },
        cancelSubcription: function(e) {
            var currentAction = window.currentAction = $(e.target).parents('.mz-subscription-listing').attr('data-subscription');
            var me = this,cancel = window.cancel = true,
                customerId = me.model.get("customerId");
            AlertPopup.AlertView.fillmessage("cancel-dailog", "If you Cancel your Subscription and then change your mind, you'll lose any discounts and have to start over. Are you sure?", function(userChoice) {
                if(userChoice && window.cancel) {
                    $(".overlay-for-complete-page").addClass("overlay-shown");
                    $(".mz-subscriptionhistory").addClass("is-loading");
                    window.cancel = false; 
                    me.model.get("orderDetails").find(function(obj){
                        if(obj.subscriptionId == window.currentAction) { 
                            obj.subscribedStatus = "Cancelled";
                            obj.modifiedDate = new Date().toISOString();
                        }
                    });
                    try {
                        //need to test against multiple accounts
                        Api.request('POST', 'svc/getSubscription',{method:"UPDATE",data:me.model.attributes}).then(function(res) {
                        //Api.request('PUT', '/api/platform/entitylists/createsubscription@jbellyretailer/entities/' + customerId, me.model.attributes).then(function(res) {
                            console.log(res);
                            setTimeout(function(){
                                window.currentAction = 0;
                            },2000);
                            $(".overlay-for-complete-page").removeClass("overlay-shown");
                            $(".mz-subscriptionhistory").removeClass("is-loading"); 
                            me.render();
                            $(".subsc-cancel-alert").show();
                            $(document).find('.subs-list-heading.active').find('.plus-minus a').html('&#8722;');
                            // if(currentAction != "undefined") {
                            //     currentAction.parents("[data-subscription]").find(".subs-list-heading").addClass("active");
                            //     currentAction.parents("[data-subscription]").find(".subs-list-heading").next().show();
                            // }
                        }).then(function(er) {
                            console.log(er);

                            $(".overlay-for-complete-page").removeClass("overlay-shown");
                            $(".mz-subscriptionhistory").removeClass("is-loading");
                        });
                    } catch(e) {
                        console.error(e);
                    }
                    AlertPopup.AlertView.closepopup();
                }
                else {
                    AlertPopup.AlertView.closepopup();
                }
            });
        },
        skipSubscription: function(e) {
            console.log(e.target);
        },
        handleMouseEnter: function(e) {
            $(".mz-paused-tooltip").show();
        },
        handleMouseExit: function(e) {
            $(".mz-paused-tooltip").hide();
        },
        editSubcription: function(e) {
            AlertPopup.AlertView.fillmessage("edit-dailog", "In order to edit the Subscription you will be navigated to the Subscription setup page.", function(userChoice) {
                if(userChoice) {
                    $(".overlay-for-complete-page").addClass("overlay-shown");
                    $(".mz-subscriptionhistory").addClass("is-loading");
                    var subscriptionId = $(e.target).parents('[subscriptionid]').attr('subscriptionid');
                    console.log(subscriptionId);
                    window.location.href = "/subscriptions#edit="+subscriptionId;
                } else {
                    AlertPopup.AlertView.closepopup();
                }
            });
        },
        loadMoreItems: function(e) {
            var me = this;
            var batch = me.model.get("batch"),
                moreItemstoLoad = window.moreItemstoLoad = 1,
                isLoadMore = window.isLoadMore = true;
            var moreItems = $("[data-subscription]").filter(":hidden").slice(0,5);
            if(batch > 1) {
                batch--;
                me.model.set("batch",batch);
            }
            this.render();
        },
        initialize: function() {
            var orderDetails = [],
                orderDetailsLength = 0;

            if(typeof this.model.get("orderDetails") != "undefined") {
                orderDetails = this.model.get("orderDetails").reverse();
            } 
            if(typeof this.model.get("orderDetails") != "undefined") {
                orderDetailsLength = this.model.get("orderDetails").length;
            }
            this.model.attributes.batch = Math.ceil(orderDetailsLength/5);
            orderDetails.forEach(function(k) {
                var endDate = k.schedule.endType,
                    endDateToDelivery = "";
                if(endDate === null || endDate === "null" || endDate === "until i cancel") {
                    endDate = 12;
                }
                else {
                    endDate = parseInt(endDate.split(" ")[0], 10);
                }
                endDateToDelivery = Array.apply(null, Array(endDate));
                endDateToDelivery.forEach(function(k,v){
                    endDateToDelivery[v] = (v++ < 9 ? '0' : '') +(v);
                });
                k.schedule.deliveries = endDateToDelivery; 
            });
        },
        getRenderContext: function() {
            var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            return c;  
        },
        render: function() {
            
            Backbone.MozuView.prototype.render.apply(this);
            
            var maxListItems = $('.mz-subscription-listing').length;
            if(this.model.get("batch")) {
                var batch = this.model.get("batch"), //4
                    inital = 0,
                    current = 0,
                    toShow = "";
                console.log(batch);

                var extra = 0;
                if(batch != 1) {
                    extra = maxListItems % 5;
                }

                if(batch > 1) {
                    current = (extra !== 0) ? (5*(batch - 2)) : (5*(batch - 1));
                } 
                else {
                    current = 0;
                }
                toShow = $(".mz-subscription-listing").slice(0, (maxListItems - extra - current));
                toShow.each(function() {
                    $(this).show();
                });
            }

            if(window.currentAction) {
                var device = $(window).width()<768?'.mobile':'.desktop';
                
                $('.mz-subscription-listing[data-subscription="'+window.currentAction+'"]').find(".subs-list-heading"+device).addClass("active");
                $('.mz-subscription-listing[data-subscription="'+window.currentAction+'"]').find(".subs-list-heading"+device).nextAll('.subs-list-details').show();
            }
        }
    }),

    ReturnHistoryView = Backbone.MozuView.extend({
        templateName: "modules/my-account/return-history-list",
        initialize: function () {
            var self = this;
            this.listenTo(this.model, "change:pageSize", _.bind(this.model.changePageSize, this.model));
            this.listenTo(this.model, 'returndisplayed', function (id) {
                var $retView = self.$('[data-mz-id="' + id + '"]');
                if ($retView.length === 0) $retView = self.$el;
                $retView.ScrollTo({ axis: 'y' });
            });
        },
        getRenderContext: function () {
            var context = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            if(context.model.hasNextPage) {
                context.model.allLoaded = 1;
            }else{
                context.model.allLoaded = 2;
            }
            return context;
        },
        loadMoreOrders: function(){
            this.model.changePageSize(true);
        }
    });
    
    var PaymentMethodsView = EditableView.extend({
        templateName: "modules/my-account/my-account-paymentmethods",
        autoUpdate: [
            'editingCard.paymentOrCardType',
            'editingCard.nameOnCard',
            'editingCard.cardNumberPartOrMask',
            'editingCard.expireMonth',
            'editingCard.expireYear',
            'editingCard.cvv',
            'editingCard.isCvvOptional',
            'editingCard.contactId',
            'editingContact.firstName',
            'editingContact.lastNameOrSurname',
            'editingContact.address.address1',
            'editingContact.address.address2',
            'editingContact.address.address3',
            'editingContact.address.cityOrTown',
            'editingContact.address.countryCode',
            'editingContact.address.stateOrProvince',
            'editingContact.address.postalOrZipCode',
            'editingContact.address.addressType',
            'editingContact.phoneNumbers.home',
            'editingContact.isBillingContact',
            'editingContact.isPrimaryBillingContact',
            'editingContact.isShippingContact',
            'editingContact.isPrimaryShippingContact'
        ],
        renderOnChange: [
            'editingCard.contactId',
            'editingContact.address.countryCode'
        ],
        beginEditCard: function (e) {
            e.preventDefault();
            var id = this.editing.card = e.currentTarget.getAttribute('data-mz-card');
            this.model.beginEditCard(id);
            this.render();
            if(id === "new"){
                this.clearAllData();
            }
        },
        clearAllData: function(){
            $('#mz-payment-credit-card-type').val($("#mz-payment-credit-card-type option:first").val());
            $('#mz-payment-credit-card-number').val("");
            $('#mz-payment-credit-card-name').val("");
            $('#mz-payment-expiration-month').val($('#mz-payment-expiration-month option:first').val());
            $('[name="mz-payment-expiration-year"]').val($('[name="mz-payment-expiration-year"] option:first').val());
            $('#mz-payment-security-code').val("");
        },
        finishEditCard: function () {
            if (this.doModelAction('saveCard')) this.editing.card = false;
        },
        cancelEditCard: function () {
            this.editing.card = false;
            this.model.endEditCard();
            this.render();
        },
        beginDeleteCard: function (e) {
            var self = this,
            id = e.currentTarget.getAttribute('data-mz-card'),
            card = this.model.get('cards').get(id);
            if (window.confirm(Hypr.getLabel('confirmDeleteCard', card.get('cardNumberPart')))) {
                this.doModelAction('deleteCard', id);
            }
        }
    });
    
    var AddressBookView = EditableView.extend({
        templateName: "modules/my-account/my-account-addressbook",
        autoUpdate: [
            'editingContact.firstName',
            'editingContact.lastNameOrSurname',
            'editingContact.address.address1',
            'editingContact.address.address2',
            'editingContact.address.address3',
            'editingContact.address.cityOrTown',
            'editingContact.address.countryCode',
            'editingContact.address.stateOrProvince',
            'editingContact.address.postalOrZipCode',
            'editingContact.address.addressType',
            'editingContact.phoneNumbers.home',
            'editingContact.isBillingContact',
            'editingContact.isPrimaryBillingContact',
            'editingContact.isShippingContact',
            'editingContact.isPrimaryShippingContact'
        ],
        renderOnChange: [
            'editingContact.address.countryCode',
            'editingContact.isBillingContact',
            'editingContact.isShippingContact'
        ],
        additionalEvents: {
            "keydown input[name='shippingphone']": "phoneNumberFormating",
            "keyup input[name='shippingphone']": "phoneNumberFormating2",
            "change input[isShippingContact]":"update",
            "change input[isBillingContact]":"update"
        },
        update: function(e){
            if(e.target.getAttribute("data-mz-value") === "editingContact.isBillingContact"){
                setTimeout(function(){ $('input[isPrimaryBillingContact]').trigger('click'); }, 1000);
                // this.model.set("editingContact.isPrimaryBillingContact",e.target.checked);
            }
            if(e.target.getAttribute("data-mz-value") === "editingContact.isShippingContact"){
                setTimeout(function(){ $('input[isPrimaryShippingContact]').trigger('click'); }, 1000);
                // this.model.set("editingContact.isPrimaryShippingContact",e.target.checked);
            }
        },
        phoneNumberFormating2: function(e){
            var keyChar  = $('input[name="shippingphone"]').val()[$('input[name="shippingphone"]').val().length-1];
            var value = $('input[name="shippingphone"]').val();
            if(keyChar === "!" || keyChar === "@" || keyChar === "#" || keyChar === "$" || keyChar === "%" || keyChar === "^" || keyChar === "&"  || keyChar === "*" || keyChar === "(" || keyChar === ")" || keyChar === "_" || keyChar === "+" || keyChar === "~"){
                $('input[name="shippingphone"]').val(value.substr(0,value.length-1));
            }
        },
        phoneNumberFormating : function(e){
            if(e.shiftKey){
                e.stopPropagation();
                e.preventDefault();
            }
            if((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)){     
                var keyChar = String.fromCharCode( e.keyCode);
                var length = $('input[name="shippingphone"]').val().length;
                switch(length){
                    case(0): 
                        $('input[name="shippingphone"]').val('('+$('input[name="shippingphone"]').val());
                        break;
                    case(4): 
                        $('input[name="shippingphone"]').val($('input[name="shippingphone"]').val()+') ');
                        break;
                    case(9): 
                        $('input[name="shippingphone"]').val($('input[name="shippingphone"]').val()+'-');
                        break;
                }
            }else{
                if(e.keyCode != 8){
                    e.stopPropagation();
                    e.preventDefault();
                }
            }
        },
        beginAddContact: function (e) {
            e.preventDefault();
            this.model.set('editingContact.address.countryCode',"US");
            this.model.set('editingContact.address.addressType',"");
            this.model.set('editingContact.isBillingContact',true);
            this.editing.contact = "new";
            this.render();
        },
        beginEditContact: function (e) {
            this.model.set('editingContact.address.countryCode',"US");
            
            var meModel = this;
            $(this.model.get('contacts').models).each(function(key,val){
                if(meModel.model.get('contacts').models[key].get('isPrimaryBillingContact')){
                    meModel.model.get('contacts').models[key].set('isBillingContact',meModel.model.get('contacts').models[key].get('isPrimaryBillingContact'));
                }else{
                    meModel.model.get('contacts').models[key].set('isBillingContact',false);
                }
                if(meModel.model.get('contacts').models[key].get('isPrimaryShippingContact')){
                    meModel.model.get('contacts').models[key].set('isShippingContact',meModel.model.get('contacts').models[key].get('isPrimaryShippingContact'));
                }else{
                    meModel.model.get('contacts').models[key].set('isShippingContact',false);
                }
            });
            var id = this.editing.contact = e.currentTarget.getAttribute('data-mz-contact');
            this.model.beginEditContact(id);
            this.render();
        },
        finishEditContact: function () {
            
           this.model.get('editingContact').set('companyOrOrganization',$('#companyName').val());
         
            if (this.doModelAction('saveContact')) this.editing.contact = false;
            
            this.model.get('contacts').models[0].get('address').set('addressType',$('#jb-addressType option:selected').val());
         
        },
        cancelEditContact: function () {
            this.editing.contact = false;
            this.model.endEditContact();
            this.render();
        },
        beginDeleteContact: function (e) {
            var self = this,
            id = e.currentTarget.getAttribute('data-mz-contact'),
            contact = this.model.get('contacts').get(id);
            if (window.confirm(Hypr.getLabel('confirmDeleteContact', contact.get('address').get('address1')))) {
                this.doModelAction('deleteContact', id);
            }
        }
    });
    
    var StoreCreditView = Backbone.MozuView.extend({
        templateName: 'modules/my-account/my-account-storecredit',
        addStoreCredit: function (e) {
            var self = this;
            var id = this.$('[data-mz-entering-credit]').val();
            if (id) return this.model.addStoreCredit(id).then(function (data) {
                return self.model.getStoreCredits();
            });
        }
    });
    
    var QuickOrderHistoryView = Backbone.MozuView.extend({
        templateName: "modules/my-account/my-account-quick-order-items",
        additionalEvents: {
            "click [data-mz-showQuickOrder]": "showQuickOrderDetails"
        },
        getRenderContext: function () {
            var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            $(c.model.items).each(function(key,val){
                c.model.items[key].numberofproducts = c.model.items[key].items.length;
            });
            return c;
        },
        showQuickOrderDetails: function(e){
            var orderId = e.currentTarget.getAttribute('QorderID');
            $('[QorderID]').removeClass('active');
            $('[data-mz-showQuickOrder]').find('.quick-order-plus a').text('+');
            $('[data-mz-QuickOrder]').slideUp();
            if($('[data-mz-QuickOrder][QorderID="'+orderId+'"]')[0].style.display === "none" || $('[data-mz-QuickOrder][QorderID="'+orderId+'"]')[0].style.display === ""){
                $('[data-mz-QuickOrder][QorderID="'+orderId+'"]').slideDown();
                $(e.currentTarget).addClass('active');
                $('[data-mz-showQuickOrder][ QorderID="'+orderId+'"]').find('.quick-order-plus a').text('-');
            }
        },
        loadMoreItems: function(){
            this.model.changePageSize(true);    
        },
        addAllToCart: function(e){
            var orderId = e.currentTarget.getAttribute('orderToAdd');
            $('[data-mz-action="addAllToCart"][orderToAdd="'+orderId+'"]').addClass('active');
            var productCodes = [];
            var productQuantity = [];
            var orderItems = $('[data-mz-QuickOrder][QorderId="'+orderId+'"]').find('[quickOrderProductCode]');
            $(orderItems).each(function(key,val){
                productCodes.push(val.getAttribute('quickorderproductcode'));
            });
            var orderQuantity = $('[data-mz-QuickOrder][QorderId="'+orderId+'"]').find('[quickOrderQuantity]');
            $(orderQuantity).each(function(key,val){
                productQuantity.push(val.value);
            });
            var orderItemslines = $('[data-mz-QuickOrder][QorderId="'+orderId+'"]');
            console.log(orderItemslines);
            this.makeQuickOrder(productCodes,productQuantity,orderId);
        },
        addInlineItemToCart: function(e){
            var productId = e.currentTarget.getAttribute('quickOrderProductCode');
            var orderNumber = e.currentTarget.getAttribute('orderNumber');
            var location = e.currentTarget.getAttribute('locationcode');
            var quantityElement = $('[data-mz-QuickOrder][QorderID="'+orderNumber+'"]').find('[quickOrderQuantity][quickOrderProductId="'+productId+'"]');
            var qty = quantityElement[0].value;
            var temp = {};
            temp.productCode = productId;
            temp.quantity = qty;
            temp.location = location;
            var data = [];
            data.push(temp);
            this.makeQuickOrder(data,orderNumber);
        },
        decreaseQuickOrderQuantity: function(e){
            var productId = e.currentTarget.getAttribute('quickOrderProductCodeQuantityChanger');
            $('[quickOrderQuantity][quickOrderProductId="'+productId+'"]').val($('[quickOrderQuantity][quickOrderProductId="'+productId+'"]').val()===""?1:parseInt($('[quickOrderQuantity][quickOrderProductId="'+productId+'"]').val(),10)-1);
        },
        increaseQuickOrderQuantity: function(e){
            var productId = e.currentTarget.getAttribute('quickOrderProductCodeQuantityChanger');
            $('[quickOrderQuantity][quickOrderProductId="'+productId+'"]').val($('[quickOrderQuantity][quickOrderProductId="'+productId+'"]').val()===""?1:parseInt($('[quickOrderQuantity][quickOrderProductId="'+productId+'"]').val(),10)+1);
        },
        makeQuickOrder: function(products,quantities,orderId){
            var errorArray = [], self = this, productAdded = 0,time = 1500;
            $(products).each(function(key,pid){
                setTimeout(function(){
                var count = quantities[key];
                Api.get('product', pid).then(function(sdkProduct) {
                    var PRODUCT = new ProductModels.Product(sdkProduct.data);
                    PRODUCT.set({'quantity':quantities[key]});
                    PRODUCT.addToCart();
                        PRODUCT.on('addedtocart', function(attr) {
                        productAdded++;
                        PRODUCT = ''; 
                        if(productAdded  === products.length ){
                            self.showMessages(errorArray, productAdded,orderId);
                        }
                    });
                    Api.on('error', function (badPromise, xhr, requestConf) {
                        productAdded++;
                        errorArray.push(badPromise.message);
                        if(productAdded  === products.length ){
                            self.showMessages(errorArray, productAdded,orderId);
                        }
                    });
                },function(errorResp){
                    errorArray.push(errorResp.message);
                    if(productAdded  === products.length - 1){
                        self.showMessages(errorArray, productAdded,orderId);
                    }
                });
                },time);
                time+=1000;
            });
        },
        showMessages: function(errorArray, productAdded,orderId){
            //show All error messges
            $('#account-messages').hide();
            var msg = "";
            if(errorArray.length>0){
                $(errorArray).each(function(key ,value){
                    msg = msg + "<p>" + value + "</p>";
                });
                $('#account-messages')[0].style.background = "#F06D6D";
                $('#account-messages')[0].style.border = "1px solid #959494";
                $('#account-messages')[0].style.padding = "5px";
                $('[data-mz-message-bar]').html(msg);
                $('#account-messages').show(function(){
                setTimeout(function(){
                    $('#account-messages').slideUp(500);
                    },errorArray.length*1500);
                });
            }
            
            //TODO : update and show minicart
            if(productAdded != errorArray.length){
                CartMonitor.update();
                MiniCart.MiniCart.showMiniCart();
            }
            $('[data-mz-action="addAllToCart"][orderToAdd="'+orderId+'"]').removeClass('active');
        }
    });

    var InvoiceView = Backbone.MozuView.extend({
        templateName: "modules/my-account/invoice-view",
        additionalEvents: {
            "click .selected-item": "showOptions",
            "click .view-morebutton": "loadMore",
            "click .invoice-header": "accordionFun",
            "click .select-invoice-checkbox": "selectInvoice",
            "click .option" : "filterInvoices",
            "click .optionList" : "sortInvoices",
            "keyup .search-box" : "onsearchfield",
            "click .pay-button" : "startPayment",
            "click .back-to-invoice" : "backToInvoice",
            "click .add-new-card" : "enablePopUp",
            "click .cross-icon" : "disablePopUp",
            "click .cancel-card" : "disablePopUp",
            "click .optionCard" : "selectCard",
            "click .complete-pay-button" : "completepayment",
            "click .save-card" : "saveCard",
            "click .print-invoice" : "printInvoice",
            "click .print-success-invoice":"printCompletedInvoices",
            "click .success-cross-icon" : "successBackToInvoices",
            "click .back-to-invoices" : "successBackToInvoices",
            "focus .search-box":"onSearchFieldFocus",
            "blur .search-box":"onSearchFocusOut"
        },
        onSearchFieldFocus:function(e){
            if($(window).width()<768){
                $(document).find('.filter-by-cointainer,.sort-by-cointainer').hide();
                $(e.currentTarget).css("width","96%"); 
                $(e.currentTarget).parent().animate({'width':'100%'},500,"swing");
            }
        }, 
        onSearchFocusOut:function(e){
            if($(window).width()<768){
                $(document).find('.filter-by-cointainer,.sort-by-cointainer').show();
                $(e.currentTarget).css("width","90%"); 
                $(e.currentTarget).parent().css({'width':'35%'});
            }
        }, 
        onsearchfield : function(e){
            var self = this;
            if (window.timer) {
                clearTimeout(window.timer);
            }
            window.timer = setTimeout(function(){self.autosuggest(e);}, 1000);   
        },
        autosuggest : function(e){
            var queryval = $(e.target).val(), newInvoiceList = {}, self = this, counter = 0; 
            this.model.set('query',queryval);
            this.model.set('sortselected',{"value": "default","label": "Default"});
            this.model.set('filterselected',{"value": "all","label": "All"});
            this.model.get('invoices').filter(function(v,k){
                if(v.indexOf(queryval) > -1){
                    counter++;
                    newInvoiceList[v] = self.model.get('originalData')[v];
                }
            });
            this.model.set('resultCount',counter);
            this.model.set('items',newInvoiceList);
            this.render();
            $(document).find('.search-box').focus(function(){
                var that = this;
                setTimeout(function(){ that.selectionStart = that.selectionEnd = 10000; }, 0);
            });
            // console.log(this.model.get('items'));
            // $(document).find('.search-box').focus().setCursorToTextEnd();
        },
        sortInvoices : function(e){
            var list = [], self = this;
            this.model.get('invoices').filter(function(v,k){
                if(self.model.get('query') !== "" && v.indexOf(self.model.get('query')) > -1){
                    list.push(v);
                }else if(self.model.get('query') === ""){
                    list.push(v);    
                }
            });
            if($(e.target).parents().hasClass('sort-by-cointainer')){
                var newInvoiceList = {}, ele=e, counter = 0, dateOne, dateTwo; 
                if($(ele.target).attr('value') != "default"){
                    list.sort(function(a,b){
                        if($(ele.target).attr('value') == "lowtoheigh"){
                            return self.model.get('originalData')[a].invoiceTotal > self.model.get('originalData')[b].invoiceTotal ? 1 : -1;
                        }else if($(ele.target).attr('value') == "heightolow"){
                            return self.model.get('originalData')[a].invoiceTotal < self.model.get('originalData')[b].invoiceTotal ? 1 : -1;
                        }else if($(ele.target).attr('value') == "oldtonew"){
                            dateOne = new Date(self.model.get('originalData')[a].InvoiceDate).getTime();
                            dateTwo = new Date(self.model.get('originalData')[b].InvoiceDate).getTime();
                            return dateOne > dateTwo ? 1 : -1;
                        }else if($(ele.target).attr('value') == "newtoold"){
                            dateOne = new Date(self.model.get('originalData')[a].InvoiceDate).getTime();
                            dateTwo = new Date(self.model.get('originalData')[b].InvoiceDate).getTime();
                            return dateOne < dateTwo ? 1 : -1;
                        }
                    });
                }
                list.filter(function(v,k){
                    newInvoiceList[v] = self.model.get('originalData')[v];  
                });
                this.model.get('sortValue').filter(function(v,k){
                    if(v.value == $(ele.target).attr('value')){
                        self.model.set('sortselected', v);
                    }
                });
                this.model.set('items',newInvoiceList);
                this.render();
            }
        },
        filterInvoices : function(e){
            var list = [], self = this;
            this.model.get('invoices').filter(function(v,k){
                if(self.model.get('query') !== "" && v.indexOf(self.model.get('query')) > -1){
                    list.push(v);
                }else if(self.model.get('query') === ""){
                    list.push(v);    
                }
            });
            if($(e.target).parents().hasClass('filter-by-cointainer')){
                var newInvoiceList = {}, ele = e, counter = 0;
                list.filter(function(v,k){
                    if($(ele.target).attr('value') == "paid"){
                        if(self.model.get('originalData')[v].paid){
                            counter++;
                            newInvoiceList[v] = self.model.get('originalData')[v];
                        }
                    }else if($(ele.target).attr('value') == "unpaid"){
                        if(!self.model.get('originalData')[v].paid){
                            counter++;
                            newInvoiceList[v] = self.model.get('originalData')[v];
                        }
                    }else{
                        counter++;
                        newInvoiceList[v] = self.model.get('originalData')[v];
                    }
                });
                this.model.get('filterValue').filter(function(v,k){
                    if(v.value == $(ele.target).attr('value')){
                        self.model.set('filterselected', v);
                    }
                });
                this.model.set('resultCount',counter);
                this.model.set('items',newInvoiceList);
                this.render();
            }
        },
        selectInvoice : function(e){
            if(!this.model.get('items')[$(e.target).attr('data-attr-invoice')].paid){
                this.model.get('items')[$(e.target).attr('data-attr-invoice')].isSelected = this.model.get('items')[$(e.target).attr('data-attr-invoice')].isSelected ? false : true;
                if(this.model.get('items')[$(e.target).attr('data-attr-invoice')].isSelected){
                    this.model.set('selectedTotal',(parseFloat(this.model.get('selectedTotal'))+parseFloat(this.model.get('items')[$(e.target).attr('data-attr-invoice')].invoiceTotal)).toFixed(4));
                }else{
                    this.model.set('selectedTotal',(parseFloat(this.model.get('selectedTotal'))-parseFloat(this.model.get('items')[$(e.target).attr('data-attr-invoice')].invoiceTotal)).toFixed(4));
                }
                this.render();
            } 
        },
        accordionFun : function(e){
            if(!($(e.target).hasClass('check-box-releative-ele') || $(e.target).parents().hasClass('check-box-releative-ele'))){
                var self = this;
                this.model.get('invoices').filter(function(v,k){
                    if($(e.currentTarget).attr('data-attr-invoice') == v && self.model.get('items')[v] && !self.model.get('items')[v].isActive){
                        self.model.get('items')[v].isActive = true;
                    }else if(self.model.get('items')[v]){
                        self.model.get('items')[v].isActive = false;
                    }
                });
                this.render();
            }
        },
        loadMore : function(e){
            var lastindex = this.model.get('lastIndex');
            var totalCount = this.model.get('invoiceCount');
            var pageSize = this.model.get('pageSize');
            var newLastindex = (totalCount > (lastindex+pageSize) ? (lastindex+pageSize) : totalCount);
            this.model.set('lastIndex', newLastindex);
            this.render();
        },
        showOptions : function(e){
            $(document).find('.options').removeClass('active');
            $(e.currentTarget).next('.options').addClass('active');
        }, 
        startPayment : function(e){
            if(this.model.get('selectedTotal') > 0){
                var items = this.model.get('items'),
                keys = Object.keys(items),selectedItems = [];
                for(var i=0;i<keys.length;i++){
                    if(items[keys[i]].isSelected){
                        selectedItems.push(items[keys[i]]);
                    }
                }
                window.selectedItems  = selectedItems;
                
                this.model.set('isPayment', true);
                this.render();
                if(this.model.get('isMobile')){
                    setTimeout(function(){ 
                        $('html, body').animate({scrollTop:$('body').position().top}, 'slow');
                    },500);
                }
            }
        },
        backToInvoice : function(e){
            this.model.set('isPayment', false);
            this.render();   
        },
        enablePopUp : function(e){
            this.model.set('newCardPopup', true);
            $(document).find('body').addClass('hasPopUp');
            this.render();    
        },
        disablePopUp : function(e){
            this.model.set('newCardPopup', false);
            $(document).find('body').removeClass('hasPopUp');
            this.render();   
        },
        selectCard : function(e){
            var token = $(e.target).attr('data-token'), self = this;
            this.model.get('SavedCards').filter(function(v,k){
                if(v.token == token){
                    self.model.set('selectedCard', v);
                }
            }); 
            this.render();   
        },
        completepayment : function(e){
            var self = this;
            var requestData = {
                method : "PAYInvoice",
                data : {
                    ERPCustomerNumber :  require.mozuData('user').lastName,
                    ProfileId : this.model.get('selectedCard').profileid,
                    TokenId : this.model.get('selectedCard').token,
                    NotificationEmail : decodeURIComponent($.cookie('userData')),
                    PaymentAmount : this.model.get('selectedTotal'),
                    Invoices : []
                }
            };
            self.model.get('invoices').filter(function(v,k){
                if(self.model.get('items')[v].isSelected){
                    self.model.get('items')[v].orders.filter(function(a,b){
                        requestData.data.Invoices.push(a);   
                    });
                }  
            });
            Api.request('POST','svc/getInvoices', requestData).then(function(res){
                if(res.Status == "Success"){
                    requestData = {method : "InvoicePAYMENT",customerNumber : require.mozuData('user').lastName};
                    // requestData = {method : "InvoicePAYMENT",customerNumber : 10000010};
                    var myInvoices = {}, count=0, amountPending = 0, invoiceIds = []; 
                    Api.request('POST','svc/getInvoices', requestData).then(function(payments){
                        self.model.set('selectedTotal', 0); 
                        self.model.set('isPayment', false);
                        self.model.get('invoices').filter(function(v,k){
                            if(self.model.get('items')[v].isSelected){
                                self.model.get('items')[v].isSelected = false;
                                self.model.get('items')[v].paid = false;
                                self.model.get('items')[v].isPending = false; 
                                self.model.get('items')[v].isCCS = false;        
                                if(payments.length > 0){
                                    payments.filter(function(a,b){ 
                                        if(a.Invoices.indexOf(self.model.get('items')[v].invoiceNumber) >= 0 && a.IsPaid){
                                            self.model.get('items')[v].paid = true;                                       
                                        }else if(a.Invoices.indexOf(self.model.get('items')[v].invoiceNumber) >= 0 && a.IsPending){
                                            self.model.get('items')[v].isPending = true; 
                                        }else if(a.Invoices.indexOf(self.model.get('items')[v].invoiceNumber) >= 0){
                                            self.model.get('items')[v].isCCS = true; 
                                        }
                                    });
                                }else{
                                    self.model.get('items')[v].isCCS = true;
                                }
                            }                        
                        });
                        self.model.set('paymentError',false); 
                        self.model.set('SuccessPopup',true);
                        console.log(self.model); 
                        self.render(); 
                    },function(er){
                        self.model.set('selectedTotal', 0); 
                        self.model.set('isPayment', false);
                        self.model.get('invoices').filter(function(v,k){
                            if(self.model.get('items')[v].isSelected){
                                self.model.get('items')[v].isSelected = false;
                                self.model.get('items')[v].isCCS = true; 
                            }                        
                        });
                        self.model.set('paymentError',false); 
                        self.model.set('SuccessPopup',true);                        
                        self.render(); 
                    });
                }else{
                    self.model.set('paymentError',true);
                    self.render();  
                } 
            });
        },
        expDateValidation : function(expMonth,expYear){
            var exp, thisMonth, isValid;
            if (isNaN(expMonth) || isNaN(expYear) || expMonth === 0 || expYear === 0) return false;
            exp = new Date(expYear, expMonth - 1, 1, 0, 0, 0, 0);
            thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);
            isValid = exp >= thisMonth;
            if (!isValid){ return false; }else{ return true; }  
        },
        saveCard : function(e){
            var inputList = $(document).find('.form-data').find('input,select'), flag = false, expYear = "", expMonth = "", temp = {}, self = this, card = {};
            $(document).find('.error').removeClass('active');
            inputList.filter(function(){
                var value = $(this).val();
                if($(this).attr('name') == "payment_expiration_month" || $(this).attr('name') == "payment_expiration_year" || $(this).attr('name') == "address2"){
                    if($(this).attr('name') !== "address2"){
                        if($(this).attr('name') == "payment_expiration_month"){
                            expMonth = value;
                        }else{
                            expYear = value;
                        }
                        if(expYear == 'Year' && expMonth == 'Month'){
                            flag = true;
                            $(document).find('.payment_expiration_year-err').removeClass('active');
                            $(document).find('.payment_expiration_month-err').removeClass('active');
                            $(document).find('.payment_expiration_year_month-err').addClass('active');
                        }else{
                            if(expYear == 'Year'){ 
                                flag = true;                               
                                $(document).find('.payment_expiration_year-err').addClass('active');
                            }else if(expMonth == 'Month'){
                                flag = true;
                                $(document).find('.payment_expiration_month-err').addClass('active');
                            }else if(expYear !== 'Year' && expMonth !== 'Month'){
                                if(self.expDateValidation(expMonth,expYear)){
                                    temp.expirationMonth = expMonth;
                                    temp.expirationYear = expYear;
                                    $(document).find('.payment_expiration_year_month_validation-err').removeClass('active');
                                }else{
                                    $(document).find('.payment_expiration_year_month_validation-err').addClass('active');
                                }
                            }
                        }
                    } 
                }else if(value === ""){
                    flag = true;
                    $(document).find('.'+$(this).attr('name')+'-err').addClass('active');
                }else{
                    temp[$(this).attr('data-attr-name')] = value;
                }
            });
            if(!flag){                
                this.model.set('newCardData', temp);
                temp.profile = this.model.get('paymentProfileId');
                Api.request('POST','/svc/payments',temp).then(function(res){
                    console.log(res);
                    var cardsList = res.res,cardL = [];
                    cardsList.filter(function(v,k){
                        v.formatedCardnumber = v.token.replace(/(\d{12})(\d{4})/, "XXXXXXXXXXXX$2");
                        v.formatedData = v.expiry.substring(0,2)+"/20"+v.expiry.substring(2);
                        cardL.push(v);
                    });
                    self.model.set('selectedCard',cardL[0]);    
                    self.model.set('SavedCards',cardL);
                    self.model.set('newCardPopup', false);
                    self.model.set('paymentError', false);
                    $(document).find('body').removeClass('hasPopUp');
                    self.render();  
                },function(err){
                    self.model.set('newCardPopup', false);
                    self.model.set('paymentError', true);
                    $(document).find('body').removeClass('hasPopUp');  
                    self.render();  
                    console.log(err); 
                });
            }  
        },
        printInvoice : function(e){
            window.print();
        },
        printCompletedInvoices:function(e){
            var items = window.selectedItems;
            for(var i=0;i<items.length;i++){
                $(document).find('.invoice-item#printArea-'+items[i].invoiceNumber).addClass('active').find('.invoice-details').addClass('active');
            }
            window.print();
        },
        successBackToInvoices : function(e){
            this.model.set('SuccessPopup', false);
            this.model.set('isPayment', false);
            this.render();
        },
        render: function() {       
            Backbone.MozuView.prototype.render.apply(this);
        } 
    });

    $(document).ready(function () {    
        // Invoice view
        var Data = {};
        Data.isMobile = $(window).width() < 768 ? true : false;
        Data.isTablet = $(window).width() < 1025 && $(window).width() > 767 ? true : false;
        Data.isDesktop = $(window).width() > 1024 ? true : false;
        var invoiceModelData = Backbone.MozuModel.extend({});
        var requestData = {method : "GETInvoice",customerNumber : require.mozuData('user').lastName};
        Api.request('POST','svc/getInvoices', requestData).then(function(invoices){
            requestData = {method : "InvoicePAYMENT",customerNumber : require.mozuData('user').lastName};
            // requestData = {method : "InvoicePAYMENT",customerNumber : 10000010};
            var myInvoices = {}, count=0, amountPending = 0, invoiceIds = []; 
            Api.request('POST','svc/getInvoices', requestData).then(function(payments){
                invoices.filter(function(v,k){ 
                    if(myInvoices[v.InvoiceNumber]){
                        amountPending = v.Paid ? amountPending+0 : amountPending+v.Amount;
                        myInvoices[v.InvoiceNumber].orders.push(v);
                        myInvoices[v.InvoiceNumber].invoiceTotal = myInvoices[v.InvoiceNumber].invoiceTotal+v.Amount;
                        myInvoices[v.InvoiceNumber].isSelected = false;
                        myInvoices[v.InvoiceNumber].isCCS = false; 
                        if(payments.length > 0){
                            payments.filter(function(a,b){ 
                                if(a.Invoices.indexOf(v.InvoiceNumber) >= 0 && a.IsPaid){
                                    myInvoices[v.InvoiceNumber].paid = true;
                                    myInvoices[v.InvoiceNumber].isPending = false; 
                                    myInvoices[v.InvoiceNumber].isCCS = false; 
                                }else if(a.Invoices.indexOf(v.InvoiceNumber) >= 0 && a.IsPending){
                                    myInvoices[v.InvoiceNumber].paid = false;
                                    myInvoices[v.InvoiceNumber].isPending = true; 
                                    myInvoices[v.InvoiceNumber].isCCS = false; 
                                }else if(a.Invoices.indexOf(v.InvoiceNumber) >= 0){
                                    myInvoices[v.InvoiceNumber].paid = false;
                                    myInvoices[v.InvoiceNumber].isPending = false; 
                                    myInvoices[v.InvoiceNumber].isCCS = true; 
                                }
                            });
                        }
                    }else{  
                        count++;
                        invoiceIds.push(v.InvoiceNumber);
                        amountPending = v.Paid ? amountPending+0 : amountPending+v.Amount; 
                        myInvoices[v.InvoiceNumber] = {};
                        myInvoices[v.InvoiceNumber].invoiceNumber = v.InvoiceNumber;
                        myInvoices[v.InvoiceNumber].ERPCustomerNumber = v.ERPCustomerNumber;
                        myInvoices[v.InvoiceNumber].InvoiceDate = v.InvoiceDate;
                        myInvoices[v.InvoiceNumber].DueDate = v.DueDate;
                        myInvoices[v.InvoiceNumber].invoiceTotal = v.Amount;
                        myInvoices[v.InvoiceNumber].paid = v.Paid;
                        myInvoices[v.InvoiceNumber].orders = [];
                        myInvoices[v.InvoiceNumber].orders.push(v);
                        myInvoices[v.InvoiceNumber].isActive = false;
                        myInvoices[v.InvoiceNumber].isSelected = false;
                        myInvoices[v.InvoiceNumber].isCCS = false; 
                        if(payments.length > 0){
                            payments.filter(function(a,b){ 
                                if(a.Invoices.indexOf(v.InvoiceNumber) >= 0 && a.IsPaid){
                                    myInvoices[v.InvoiceNumber].paid = true;
                                    myInvoices[v.InvoiceNumber].isPending = false; 
                                    myInvoices[v.InvoiceNumber].isCCS = false; 
                                }else if(a.Invoices.indexOf(v.InvoiceNumber) >= 0 && a.IsPending){
                                    myInvoices[v.InvoiceNumber].paid = false;
                                    myInvoices[v.InvoiceNumber].isPending = true; 
                                    myInvoices[v.InvoiceNumber].isCCS = false; 
                                }else if(a.Invoices.indexOf(v.InvoiceNumber) >= 0){
                                    myInvoices[v.InvoiceNumber].paid = false;
                                    myInvoices[v.InvoiceNumber].isPending = false; 
                                    myInvoices[v.InvoiceNumber].isCCS = true; 
                                }
                            });
                        }
                    }
                });
                Data.selectedTotal = 0;
                Data.invoiceCount = count;
                Data.resultCount = count;
                Data.pageSize = 5;
                Data.startIndex = 1;
                Data.pendingAmount = amountPending; 
                Data.invoices = invoiceIds;
                Data.lastIndex = count > Data.pageSize ? Data.pageSize : count;
                Data.items = myInvoices;
                Data.originalData = myInvoices;
                Data.noitemsMessage = "";
                Data.query = "";
                Data.isPayment = false;
                Data.newCardPopup = false;
                Data.SuccessPopup = false;
                Data.paymentError = false;
                Data.sortValue = [{"value": "default","label": "Default"},
                                  {"value": "oldtonew","label": "Oldest to Newest"},
                                  {"value": "newtoold", "label":"Newest to Oldest"},
                                  {"value": "heightolow", "label": "Highest $ to Lowest $"},
                                  {"value": "lowtoheigh", "label": "Lowest $ to Highest $"}];
                Data.sortselected = {"value": "default","label": "Default"};
                Data.filterValue = [{"value": "all", "label": "All"},
                                  {"value": "unpaid","label": "Unpaid"},
                                  {"value": "paid", "label":"Paid"}];
                Data.filterselected = {"value": "all","label": "All"};
                Data.billingName = require.mozuData("user").firstName+" "+require.mozuData("user").lastName;
                // Static data  
                var CardData = {customerNumber:require.mozuData('user').lastName};
                // Dynamic data
                // var CardData = {customerNumber:require.mozuData('user').lastName};
                try {
                    Api.request('POST','/svc/payments',CardData).then(function(res){
                        if(res.error && res.error !== ""){
                            if((res.error && res.error.indexOf('no profile')>-1) || ( res.res && res.res[0].respstat === "C" && res.res[0].resptext.indexOf("Profile not found")>-1)){
                                Data.isPaymentEnabled = false;
                            }else{
                                Data.isPaymentEnabled = true;
                                Data.paymentProfileId = res.profileid;
                            }
                            Data.SavedCards = [];
                        }else{
                            // Dynamic data
                            var cardsList = res.res;
                            Data.paymentProfileId = res.res[0].profileid;
                            if(!((res.error && res.error.indexOf('no profile')>-1) || ( cardsList && cardsList[0].respstat === "C" && cardsList[0].resptext.indexOf("Profile not found")>-1))){
                                Data.isPaymentEnabled = true;
                                var cardL = [];
                                cardsList.filter(function(v,k){
                                    v.formatedCardnumber = v.token.replace(/(\d{12})(\d{4})/, "XXXXXXXXXXXX$2");
                                    v.formatedData = v.expiry.substring(0,2)+"/20"+v.expiry.substring(2);
                                    if(validateExp(parseInt(v.expiry.substring(0,2),10),parseInt("20"+v.expiry.substring(2),10))){
                                        cardL.push(v);
                                    }
                                });
                                Data.selectedCard = cardL[0];
                                Data.SavedCards = cardL;
                            }else{
                                Data.isPaymentEnabled = false; 
                                Data.SavedCards = [];
                            }
                        }
                        var invoiceModel = new InvoiceView({
                            el: $(".mz-invoices"),
                            model: new invoiceModelData(Data) 
                        });
                        invoiceModel.render(); 
                    },function(err){
                        Data.isPaymentEnabled = false; 
                        Data.SavedCards = [];
                        var invoiceModel = new InvoiceView({ 
                            el: $(".mz-invoices"),
                            model: new invoiceModelData(Data)
                        }); 
                        invoiceModel.render();   
                    });   
                    // Api.on('error', function (badPromise, xhr, requestConf) {
                        
                    // });
                }catch(error){ 
                    Data.isPaymentEnabled = false; 
                    Data.SavedCards = [];
                    var invoiceModel = new InvoiceView({
                        el: $(".mz-invoices"),
                        model: new invoiceModelData(Data)
                    });
                    invoiceModel.render();       
                } 
            },function(err){
                invoices.filter(function(v,k){
                    if(myInvoices[v.InvoiceNumber]){
                        amountPending = v.Paid ? amountPending+0 : amountPending+v.Amount;
                        myInvoices[v.InvoiceNumber].orders.push(v);
                        myInvoices[v.InvoiceNumber].invoiceTotal = myInvoices[v.InvoiceNumber].invoiceTotal+v.Amount;
                        myInvoices[v.InvoiceNumber].isPending = false;
                    }else{  
                        count++;
                        invoiceIds.push(v.InvoiceNumber);
                        amountPending = v.Paid ? amountPending+0 : amountPending+v.Amount; 
                        myInvoices[v.InvoiceNumber] = {};
                        myInvoices[v.InvoiceNumber].invoiceNumber = v.InvoiceNumber;
                        myInvoices[v.InvoiceNumber].ERPCustomerNumber = v.ERPCustomerNumber;
                        myInvoices[v.InvoiceNumber].InvoiceDate = v.InvoiceDate;
                        myInvoices[v.InvoiceNumber].DueDate = v.DueDate;
                        myInvoices[v.InvoiceNumber].invoiceTotal = v.Amount;
                        myInvoices[v.InvoiceNumber].paid = v.Paid;
                        myInvoices[v.InvoiceNumber].orders = [];
                        myInvoices[v.InvoiceNumber].orders.push(v);
                        myInvoices[v.InvoiceNumber].isActive = false;
                        myInvoices[v.InvoiceNumber].isSelected = false;
                        myInvoices[v.InvoiceNumber].isPending = false;
                    }
                });
                Data.selectedTotal = 0;
                Data.invoiceCount = count;
                Data.resultCount = count;
                Data.pageSize = 5;
                Data.startIndex = 1;
                Data.pendingAmount = amountPending; 
                Data.invoices = invoiceIds;
                Data.lastIndex = count > Data.pageSize ? Data.pageSize : count;
                Data.items = myInvoices;
                Data.originalData = myInvoices;
                Data.noitemsMessage = "";
                Data.query = "";
                Data.isPayment = false;
                Data.newCardPopup = false;
                Data.SuccessPopup = false;
                Data.paymentError = false;
                Data.sortValue = [{"value": "default","label": "Default"},
                                  {"value": "oldtonew","label": "Oldest to Newest"},
                                  {"value": "newtoold", "label":"Newest to Oldest"},
                                  {"value": "heightolow", "label": "Highest $ to Lowest $"},
                                  {"value": "lowtoheigh", "label": "Lowest $ to Highest $"}];
                Data.sortselected = {"value": "default","label": "Default"};
                Data.filterValue = [{"value": "all", "label": "All"},
                                  {"value": "unpaid","label": "Unpaid"},
                                  {"value": "paid", "label":"Paid"}];
                Data.filterselected = {"value": "all","label": "All"};
                Data.billingName = require.mozuData("user").firstName+" "+require.mozuData("user").lastName;
                // Static data  
                var CardData = {customerNumber:require.mozuData('user').lastName};
                // Dynamic data
                // var CardData = {customerNumber:require.mozuData('user').lastName};
                try {
                    Api.request('POST','/svc/payments',CardData).then(function(res){
                        if(res.error && res.error !== ""){
                            if((res.error && res.error.indexOf('no profile')>-1) || ( res.res && res.res[0].respstat === "C" && res.res[0].resptext.indexOf("Profile not found")>-1)){
                                Data.isPaymentEnabled = false;
                            }else{
                                Data.isPaymentEnabled = true;
                                Data.paymentProfileId = res.profileid;
                            }
                            Data.SavedCards = [];
                        }else{
                            // Dynamic data
                            var cardsList = res.res;
                            Data.paymentProfileId = res.res[0].profileid;
                            if(!((res.error && res.error.indexOf('no profile')>-1) || ( cardsList && cardsList[0].respstat === "C" && cardsList[0].resptext.indexOf("Profile not found")>-1))){
                                Data.isPaymentEnabled = true;
                                var cardL = [];
                                cardsList.filter(function(v,k){
                                    v.formatedCardnumber = v.token.replace(/(\d{12})(\d{4})/, "XXXXXXXXXXXX$2");
                                    v.formatedData = v.expiry.substring(0,2)+"/20"+v.expiry.substring(2);
                                    if(validateExp(parseInt(v.expiry.substring(0,2),10),parseInt("20"+v.expiry.substring(2),10))){
                                        cardL.push(v);
                                    }
                                });
                                Data.selectedCard = cardL[0];
                                Data.SavedCards = cardL;
                            }else{
                                Data.isPaymentEnabled = false; 
                                Data.SavedCards = [];
                            }
                        }
                        var invoiceModel = new InvoiceView({
                            el: $(".mz-invoices"),
                            model: new invoiceModelData(Data) 
                        });
                        invoiceModel.render(); 
                    },function(err){
                        Data.isPaymentEnabled = false; 
                        Data.SavedCards = [];
                        var invoiceModel = new InvoiceView({ 
                            el: $(".mz-invoices"),
                            model: new invoiceModelData(Data)
                        }); 
                        invoiceModel.render();   
                    });  
                    // Api.on('error', function (badPromise, xhr, requestConf) {
                        
                    // });
                }catch(error){ 
                    Data.isPaymentEnabled = false; 
                    Data.SavedCards = [];
                    var invoiceModel = new InvoiceView({
                        el: $(".mz-invoices"),
                        model: new invoiceModelData(Data)
                    });
                    invoiceModel.render();       
                }      
            });   
        });  
        
        // date validation 
        function validateExp(expMonth,expYear){
            var exp, thisMonth, isValid;
            if (isNaN(expMonth) || isNaN(expYear) || expMonth === 0 || expYear === 0) return false;
            exp = new Date(expYear, expMonth - 1, 1, 0, 0, 0, 0);
            thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);
            isValid = exp >= thisMonth;
            if (!isValid){ return false; }else{ return true; }  
        }

        // setCursorToTextEnd
        (function($){
            $.fn.setCursorToTextEnd = function() {
                var $initialVal = this.val();
                this.val($initialVal);
            };
        })(jQuery);

        // hide the custom drop down option on document click
        $(document).on('click',function(e){
            if(!($(e.target).parents().hasClass('custom-dropdown') || $(e.target).hasClass('custom-dropdown'))){
                $(document).find('.options').removeClass('active');
            }
        });

        var accountModel = window.accountModel = CustomerModels.EditableCustomer.fromCurrent();        
        var updateDates = window.updateDates= {};
        updateDates.getAvailableShipDates = function() {
            var items = this.setupSKUForOrderHistory();
            if(items.length > 0) {
                Api.request("post","/sfo/get_dates",{data: items})
                .then(function(r) {
                    var getDates = window.getDates = r;
                    window.accountViews.orderHistory.updateShippingDates();
                    window.accountViews.orderHistory.render();
                },function(er) {
                    console.error(er.message);
                });
            }
        };

        updateDates.setupSKUForOrderHistory = function() {
            var items=[];
            accountModel.get("orderHistory").get("items").models.map(function(order) {
                order.get("items").map(function(prod) {
                    items.push(prod.get("product").get("productCode"));
                });
            });
            return items.filter(function(el,i) {
                return items.indexOf(el) == i;
            });
        };       
       
        updateDates.getAvailableShipDates();        
        $(document).on('click','.show-futureprod-alert', function(e) {
            if(typeof $.cookie("isSubscriptionActive") !== "undefined") {
                AlertPopup.AlertView.fillmessage("future-dailog",Hypr.getLabel('futureSubscription'), function(result) {
                    if(!result) {
                        AlertPopup.AlertView.closepopup();
                    }else{
                        AlertPopup.AlertView.closepopup();
                    } 
                }); 
            }else{
                var $target = $(e.currentTarget), productCode = $target.attr('quickorderproductcode');
                var location = $target.attr('locationcode'), inventory = $target.attr('inventory'),name = $target.attr('name');
                var qty = $target.prevAll(".quick-order-quantity").find("input.quantity-field").val();
                var count = parseInt(qty,10);
                var myDate = $target.prevAll(".mz-itemlisting-details").find("strong").text();
                $(document).find('.confirmation-popup').find('.bold-text').html(myDate);
                $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('mz-productCode',productCode);
                $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('mz-quentity',count); 
                $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('locationcode',location); 
                $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('inventory',inventory);
                $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('name',name); 
                $(document).find('.confirmation-popup').addClass('active');
                $(document).find('.confirm-popup-body').addClass('active');
                $(document).find('body').addClass('has-popup');
            }    
        });
        $(document).on('click', '.times-circle, .cancel-atc', function(e) {
            $(document).find('.confirmation-popup').removeClass('active');
            $(document).find('.confirm-popup-body').removeClass('active');
            $(document).find('body').removeClass('has-popup');
            $(document).find('.addtocartoverlay').hide();
        });
        $(document).on('click', '.add-to-cart-popup', function(e){
            var orderNumber = $(document).find('.inline-add-to-cart ').filter(':visible').parents('.mz-orderlisting-items').attr('orderid');
            var temp = {};
            temp.productCode =  $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('mz-productCode');
            temp.quantity = $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('mz-quentity');
            temp.location =  $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('locationcode');
            temp.inventory = $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('inventory');
            temp.name = $(document).find('.confirmation-popup').find('.add-to-cart-popup').attr('name');
            var data = [];
            data.push(temp);
            $(document).find('.confirmation-popup').removeClass('active');
            $(document).find('body').removeClass('has-popup'); 
            // $(document).find('.addtocartoverlay').hide();
            window.accountViews.orderHistory.makeQuickOrder(data,orderNumber);
            // $(document).find('.confirm-popup-body').removeClass('active');
        });
        
        var $accountSettingsEl = $('#x-account-settings'),
        $orderHistoryEl = $('#x-account-orderhistory'),
        $returnHistoryEl = $('#x-account-returnhistory'),
        $paymentMethodsEl = $('#x-account-paymentmethods'),
        $addressBookEl = $('#x-account-addressbook'),
        $wishListEl = $('#x-account-wishlist'),
        $messagesEl = $('#account-messages'),
        $storeCreditEl = $('#x-account-storecredit'),
        orderHistory = accountModel.get('orderHistory'),
        returnHistory = accountModel.get('returnHistory'),
        $quickOrderHistoryEl = $('#x-quick-order');
        
        var accountViews = window.accountViews = {
            settings: new AccountSettingsView({
                el: $accountSettingsEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            orderHistory: new OrderHistoryView({
                el: $orderHistoryEl.find('[data-mz-orderlist]'),
                model: orderHistory
            }),
            orderHistoryPagingControls: new PagingViews.PagingControls({
                templateName: 'modules/my-account/order-history-paging-controls',
                el: $orderHistoryEl.find('[data-mz-pagingcontrols]'),
                model: orderHistory
            }),
            orderHistoryPageNumbers: new PagingViews.PageNumbers({
                el: $orderHistoryEl.find('[data-mz-pagenumbers]'),
                model: orderHistory
            }),
            returnHistory: new ReturnHistoryView({
                el: $returnHistoryEl.find('[data-mz-orderlist]'),
                model: returnHistory
            }),
            returnHistoryPagingControls: new PagingViews.PagingControls({
                templateName: 'modules/my-account/order-history-paging-controls',
                el: $returnHistoryEl.find('[data-mz-pagingcontrols]'),
                model: returnHistory
            }),
            returnHistoryPageNumbers: new PagingViews.PageNumbers({
                el: $returnHistoryEl.find('[data-mz-pagenumbers]'),
                model: returnHistory
            }),
            paymentMethods: new PaymentMethodsView({
                el: $paymentMethodsEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            addressBook: new AddressBookView({
                el: $addressBookEl,
                model: accountModel,
                messagesEl: $messagesEl
            }),
            storeCredit: new StoreCreditView({
                el: $storeCreditEl,
                model: accountModel,
                messagesEl: $messagesEl 
            }),
            quickOrderHistoryView : new QuickOrderHistoryView({
                el: $quickOrderHistoryEl.find('[data-mz-quick-orderlist]'),
                model: orderHistory,
                messagesEl: $messagesEl
            })
        };
        
        
        if (Hypr.getThemeSetting('allowWishlist')) accountViews.wishList = new WishListView({
            el: $wishListEl,
            model: accountModel.get('wishlist'),
            messagesEl: $messagesEl
        });
         
        // TODO: upgrade server-side models enough that there's no delta between server output and this render,
        // thus making an up-front render unnecessary.
        _.invoke(window.accountViews, 'render');
        var customerId = require.mozuData("user").userId,existingEntityData = [],
        subscriptionModel = Backbone.MozuModel.extend({}); 
        try {
            Api.request('POST', 'svc/getSubscription',{method:"GETLIST"}).then(function(res) {
                 if (!res.error && res.res.subscriptionModel!==null && res.res.subscriptionModel.orderDetails.length > 0) {
                    existingEntityData = res.res.subscriptionModel;
                }

                var myaccountSubscription = new MyaccountSubscriptionView({
                    el: $(".mz-subscription-section"),
                    model: new subscriptionModel(existingEntityData)
                }); 
                myaccountSubscription.render();     
             });
        } catch (e) {
            console.error(e);
        }
        //Mask for phone number field - 
        $('input[name="shippingphone"]').mask("(999) 999-9999");
        // Handler to open-close order return panels
        $(document).on('click','[returnorderhead]', function(e){
            var orderID = e.currentTarget.getAttribute('returnorderhead');
            
            e.preventDefault();
            e.stopPropagation();
            $('[returnorderhead]').removeClass('active');
            if($(e.currentTarget).find('a[returnOrderID="'+orderID+'"]').text()=='+'){
                $('[returnorderdetails]').parent().slideUp();
                $('[returnorderdetails="'+orderID+'"]').parent().slideDown();
                $('[returnorderhead]').find('a[returnOrderID]').text('+');
                $('[returnorderhead]').find('a[returnOrderID="'+orderID+'"]').text(' -');
                $(e.currentTarget).addClass('active');
            }else{
                $('[returnorderdetails]').parent().slideUp();
                $('[returnorderhead]').find('a[returnOrderID]').text('+');
            }
        });
        
        //order history close hide
        $('[orderID]').hide();
        $(document).on('click','[orderidhead]', function(e){
            e.preventDefault();
            e.stopPropagation();
            $('[orderidhead]').removeClass('active');
            
            var orderID = e.currentTarget.getAttribute('orderidhead');
            if($('a[orderidhead="'+orderID+'"]').text() == '+'){ 
                $('[orderID]').hide();
                $('a[orderidhead]').text('+');
                $('a[orderidhead="'+orderID+'"]').text(' -');
                $('[orderID="'+orderID+'"]').slideDown();
                $(e.currentTarget).addClass('active');
            }else{
                $('a[orderidhead="'+orderID+'"]').text('+');
                $('[orderID="'+orderID+'"]').slideUp();
            }
        });
        
        $("body").on("click", "[data-remove-item-button]", function(e){
                    var productId = e.currentTarget.getAttribute('removeItemNumber');
                    //alert(productId);
                });
                
                
        $('#move-to-cart-button').attr('disabled',true);

         $(".subsc-cancel-alert").on('click','.continue', function() {
            $(".subsc-cancel-alert").hide();
        });
         /*$('.blurness').keyup(function(){ 
             //alert("asd");
        if($(this).val().length !==0) {
            $('#move-to-cart-button').attr('disabled', false);            
        }else {
            $('#move-to-cart-button').attr('disabled',true);
            }
            
    }); */

    });
});

