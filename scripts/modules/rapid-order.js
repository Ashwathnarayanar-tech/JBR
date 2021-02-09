require(['modules/backbone-mozu', 'underscore', 'modules/jquery-mozu', 'modules/api', 
    'modules/models-product', 'modules/models-cart', 'modules/cart-monitor',  'modules/minicart',"modules/alert-popup"],
    function(Backbone, _, $, Api, ProductModels, CartModels, CartMonitor, MiniCart,alertPopup) {
        var reapidOrder = Backbone.MozuView.extend({
            templateName: "modules/rapid-order",
            additionalEvents: {
                "keyup .skuInput" : "search",
                "keydown .skuInput" : "handelTab",
                "change .qty-select" : "changeQty",
                "click .remove" : "removeItemfromList",
                "click .tab-item" : "topsellerstabchange",
                "click .future-select-top" : "futureConfirmationtop",
                "click .notify-me-top" : "notifymetop",
                "click .instock-select-top" : "addtoListTopseller",
                "click .spinnerInc" : "increseQty",
                "click .spinnerDec" : "decreaseQty",
                "click .removeTopItem" : "removeItemfromtopseller",
                "click .clearList" : "clearList",
                "click .addAllToCart" : "addAllToCartCheck",
                "click .spinnerIncmob" : "mobincreseQty",
                "click .spinnerDecMob" : "mobdecreaseQty",
                "click .scan-img" : "triggerCamara",
                "click .rescan" : "rescanBtn",
                "click .cancelscan" : "cancelScan",
                "click .valueMargin" : "moveBack",
                // "keyup .suggestionItem" : "navigateSuggestion", 
                "keydown .suggestionItem" : "preventScroll",
                "keyup .remove" : "keyremoveitemFromList",
                "keydown .addAllToCart" : "handelTabOnaddAll"
            },
            returnEmptyrow : function(id){
                var temp = {};
                temp.rowId = id +1;
                temp.productName = "";
                temp.sku = null;
                temp.inventoryInfo = null;
                temp.firstShipDate = null;
                temp.isFutureProduct = null;
                temp.isfilled = false;
                temp.price = null;
                temp.salesPrice = null;
                temp.qty = null;
                temp.lineTotal = null;
                temp.isheatsensitive = null; 
                temp.productImages = null;
                temp.error = null; 
                return temp; 
            },
            moveBack : function(){
                history.back();
            },
            cancelScan : function(){
                $(document).find('#could-get-barcode-fromimage').removeClass("active");  
                $(document).find('.normal-overlay-beforescann').removeClass('active');
                $(document).find('body').removeClass("has-popup"); 
                $(document).find('.overlay-for-complete-page').hide();  
            },
            rescanBtn : function(){
                $(document).find('#could-get-barcode-fromimage').removeClass("active"); 
                $(document).find('body').removeClass("has-popup");
                $(document).find('#getimage').click(); 
            },
            getProductFeomBarcode : function(code){ 
                var self = this, item = {}, QOModel = {};
                var modelItems = window.modelRapidOrder.model.get('items');
                var modelTopSellerItems = window.modelRapidOrder.model.get('topSellAddedItems');
                Api.request('GET', '/svc/barcode_mapping?barcode='+code).then(function(stuff){  
                    if(stuff.status == 200){
                        stuff = stuff.data; 
                        $(document).find('.overlay-for-complete-page').hide(); 
                        var existingRow = null; 
                        var isExistTOP = modelTopSellerItems.length > 0 ? modelTopSellerItems.filter(function(temp){ existingRow = temp.rowId; return stuff.productCode == temp.sku ? true : false;}).length : 0;
                        var isExistROF = modelItems.length > 0 ? modelItems.filter(function(temp){ existingRow = temp.rowId; return stuff.productCode == temp.sku ? true : false;}).length : 0;
                        if(isExistROF <= 0 && isExistTOP <= 0){
                            if(stuff.inventoryInfo && stuff.inventoryInfo.onlineStockAvailable > 0){
                                if(stuff.isFutureProduct){
                                    item = {};
                                    item = stuff; 
                                    item.listType = "rofForm";
                                    QOModel = Backbone.MozuModel.extend({}); 
                                    var confirmationPopup = window.confirmationPopup = new futureConfirm({
                                        el: $('.data-future'),
                                        model: new QOModel(item)
                                    });
                                    confirmationPopup.render(); 
                                }else{
                                    var emptyitem = null, flag = true, emptyCount = 0;
                                    var items = modelItems.map(function(temp){
                                        if(!temp.isfilled){
                                            if(flag){  
                                                flag = false;
                                                temp.productName = stuff.productName;
                                                temp.sku = stuff.productCode;
                                                temp.inventoryInfo = stuff.inventoryInfo;
                                                temp.firstShipDate = stuff.firstShipDate; 
                                                temp.isFutureProduct = stuff.isFutureProduct;
                                                temp.isfilled = true;
                                                temp.productImages = stuff.productImages;
                                                temp.price = (stuff.price.price).toFixed(2);
                                                temp.salesPrice = (stuff.price.salePrice).toFixed(2);
                                                temp.qty = 1;
                                                temp.isheatsensitive = stuff.isheatsensitive; 
                                                temp.lineTotal = typeof(stuff.price.salePrice) && stuff.price.price > stuff.price.salePrice ? (temp.qty*stuff.price.salePrice).toFixed(2) : (temp.qty*stuff.price.price).toFixed(2);
                                            }else{
                                                emptyCount++;
                                            }
                                        }
                                        return temp;
                                    });
                                    if(emptyCount < 2){
                                        var temp = self.returnEmptyrow(items[items.length-1].rowId);
                                        items.push(temp);   
                                    }
                                    window.modelRapidOrder.model.set('items',items);
                                    window.modelRapidOrder.render();
                                }
                            }else{
                                item = {};
                                item = stuff;
                                item.isMobile = $(window).width() < 768 ? true : false;
                                item.isTablet = $(window).width() < 1025 && $(window).width() > 767 ? true : false;
                                item.isDesktop = $(window).width() > 1024 ? true : false; 
                                item.userEmail = decodeURIComponent(jQuery.cookie('userData')); 
                                item.customerId = require.mozuData('user').accountId;
                                item.error = "";
                                item.success = false;
                                QOModel = Backbone.MozuModel.extend({}); 
                                if(window.notifymePopUpData){
                                    window.notifymePopUpData.destoryMe();
                                }
                                var notifymePopUpData = window.notifymePopUpData = new notifymePopUp({
                                    el: $('.data-notify'),
                                    model: new QOModel(item)
                                });
                                notifymePopUpData.render(); 
                            }
                        }else{
                            var msg = "";
                            if(isExistROF > 0){
                                msg = "Item you selected is already selected in ROF form.";
                            }else{
                                msg = "Item you selected is already selected in Top seller section.";
                            }
                            self.model.set('customMsg',msg);
                            self.model.set('showCustompopup',true);                    
                            setTimeout(function(){
                                self.model.set('customMsg',null);
                                self.model.set('showCustompopup',false);
                                self.render();
                            },3000);
                            self.render();   
                        }
                    }else{
                        $(document).find('.overlay-for-complete-page').hide(); 
                        window.modelRapidOrder.model.set('customMsg',stuff.message);
                        window.modelRapidOrder.model.set('showCustompopup',true);  
                        window.modelRapidOrder.render();                  
                        setTimeout(function(){
                            window.modelRapidOrder.model.set('customMsg',null);
                            window.modelRapidOrder.model.set('showCustompopup',false); 
                            window.modelRapidOrder.render();
                        },3000);    
                    } 
                });
            },
            triggerCamara : function(e){
                $(document).find('#getimage').click(); 
            },
            mobdecreaseQty : function(e){
                var itemCode = $(e.target).attr("data-attr-code");
                var msg = "", flag = false;
                var items = window.modelRapidOrder.model.get('items').map(function(v){
                    if(v.sku == itemCode){
                        if((v.qty-1) < 1){
                            msg = "You can not reduce the quantity less than 1, instead you can remove the product from the list.";
                            flag = true;
                        }else{
                            v.qty = v.qty-1;
                            v.lineTotal = typeof(v.salesPrice) && v.price > v.salesPrice ? (v.qty*v.salesPrice).toFixed(2) : (v.qty*v.price).toFixed(2);
                        }
                    }
                    return v;
                }); 
                if(flag){ 
                    window.modelRapidOrder.model.set('customMsg',msg);
                    window.modelRapidOrder.model.set('showCustompopup',true);                    
                    setTimeout(function(){
                        window.modelRapidOrder.model.set('customMsg',null);
                        window.modelRapidOrder.model.set('showCustompopup',false);
                        window.modelRapidOrder.render();
                    },3000);
                }
                window.modelRapidOrder.model.set('items',items);
                window.modelRapidOrder.render();    
            },
            mobincreseQty : function(e){
                var itemCode = $(e.target).attr("data-attr-code");
                var msg = "", flag = false;
                var items = window.modelRapidOrder.model.get('items').map(function(v){
                    if(v.sku == itemCode){
                        if((v.qty+1) > 50){
                            msg = "You can not add more than 50 quantity per product.";
                            flag = true;
                        }else{
                            v.qty = v.qty+1;
                            v.lineTotal = typeof(v.salesPrice) && v.price > v.salesPrice ? (v.qty*v.salesPrice).toFixed(2) : (v.qty*v.price).toFixed(2);
                        }
                    }
                    return v;
                });
                if(flag){
                    window.modelRapidOrder.model.set('customMsg',msg);
                    window.modelRapidOrder.model.set('showCustompopup',true);                    
                    setTimeout(function(){
                        window.modelRapidOrder.model.set('customMsg',null);
                        window.modelRapidOrder.model.set('showCustompopup',false);
                        window.modelRapidOrder.render();
                    },3000);
                }
                window.modelRapidOrder.model.set('items',items);
                window.modelRapidOrder.render();   
            },
            addAllToCartCheck:function(e){
                var _this= this;
                if(typeof $.cookie("isSubscriptionActive") !== "undefined"){
                    /*alertPopup.AlertView.fillmessage("first-dailog","You have already started building a Subscription. Do you want to remove the subscription products and add this product to the cart?", function(result) {
                        if(!result) {
                             alertPopup.AlertView.closepopup();
                        }else{
                            var cartModel = new CartModels.Cart(); 
                            cartModel.apiEmpty().then(function(){
                                $.removeCookie("isSubscriptionActive");
                                $.removeCookie("scheduleInfo");
                                CartMonitor.update();
                                MiniCart.MiniCart.updateMiniCart();
                                alertPopup.AlertView.closepopup();
                                _this.addAllToCart();
                            },function(err){
                                console.log("cartModels api empty error",err); 
                            });
                        } 
                    }); */
                    alertPopup.AlertView.fillmessage("addall-dailog","You have started building a Subscription. Do you want to add this item to your Subscription?", function(result) {
                        if(!result) {
                            alertPopup.AlertView.fillmessage("second-dailog","We can't mix Subscription and non-Subscription items at this time. Do you want to remove the Subscription item(s) from the cart?", function(result1) {
                                if(result1) {
                                    var cartModel = new CartModels.Cart();
                                    try {
                                        // empty cart
                                        cartModel.apiEmpty().then(function(){
                                            $.removeCookie("isSubscriptionActive");
                                            $.removeCookie("scheduleInfo");
                                            CartMonitor.update();
                                            MiniCart.MiniCart.updateMiniCart();
                                            alertPopup.AlertView.closepopup();
                                            _this.addAllToCart();
                                        },function(err){
                                            console.log("cartModels api empty error",err); 
                                        });
                                    }
                                    catch(e){
                                        console.error(e);
                                    }
                                }
                                else {
                                    alertPopup.AlertView.closepopup();
                                    $('.addtocartoverlay').hide();
                                }
                            });
                        } else {
                            // add product as subscription
                            alertPopup.AlertView.closepopup();
                            $('.addtocartoverlay').hide(); 
                            _this.addAllToCart();
                        }
                    });
                
                }
                else{
                    _this.addAllToCart();
                }
            },
            addAllToCart : function(e){
                var itemsROF = window.modelRapidOrder.model.get('items').filter(function(e){return e.isfilled;});
                var itemsTOP = window.modelRapidOrder.model.get('topSellAddedItems');  
                var cartItems = MiniCart.MiniCart.getRenderContext().model.items; 
                var products = itemsROF.concat(itemsTOP);
                var productAdded = 0, productCodes = [],locationCodes=[],productData=[], popdata = {},subscriptionPopup = false;
                window.modelRapidOrder.model.set('hasProgressbar',cartItems.length > 0 ? true : false);
                popdata.msg = "You have successfully added to your cart";
                popdata.isShowpopUp = true;
                popdata.itemsNotAddes = [];
                if(products.length > 0){
                    products.filter(function(e){
                        if(e.isFutureProduct){
                            subscriptionPopup = true;
                        }
                        var temp = {}, error = "",tempVar = {};
                        var item = _.find(cartItems, function(property) {
                                if (property.product.productCode == e.sku) {
                                    return property; 
                                } 
                            });
                        if(!e.inventoryInfo.manageStock || (e.inventoryInfo.manageStock && e.inventoryInfo.onlineSoftStockAvailable > 0)){
                            if(item && e.inventoryInfo.manageStock && (parseFloat(e.qty,10)+parseFloat(item.quantity,10)) <= e.inventoryInfo.onlineSoftStockAvailable){
                                if(item.product.price.price > 0){
                                    if((parseFloat(e.qty,10)+parseFloat(item.quantity,10)) <= 50){
                                        temp.productcode = e.sku;
                                        temp.quantity = parseFloat(e.qty,10);
                                        productData.push(temp); 
                                        productAdded++;
                                    }else{
                                        tempVar = {};
                                        tempVar.sku = e.sku;
                                        tempVar.name = e.productName;
                                        tempVar.msg = "Sorry, but you can't order more than 50 at a time.";
                                        popdata.itemsNotAddes.push(tempVar);   
                                    }
                                }else{
                                    tempVar = {};
                                    tempVar.sku = e.sku;
                                    tempVar.name = e.productName;
                                    tempVar.msg = "Sorry, but free items are one-per-order. If you need more, please call Customer Service at 800-323-9380.";
                                    popdata.itemsNotAddes.push(tempVar); 
                                } 
                            }else if(!item && e.inventoryInfo.manageStock && parseFloat(e.qty,10) <= e.inventoryInfo.onlineSoftStockAvailable){
                                if(parseFloat(e.qty,10) <= 50){
                                    temp.productcode = e.sku;
                                    temp.quantity = parseFloat(e.qty,10);
                                    productData.push(temp); 
                                    productAdded++;
                                }else{
                                    tempVar = {};
                                    tempVar.sku = e.sku;
                                    tempVar.name = e.productName;
                                    tempVar.msg = "Sorry, but you can't order more than 50 at a time.";
                                    popdata.itemsNotAddes.push(tempVar); 
                                }
                            }else if(item && !e.inventoryInfo.manageStock){
                                if(item.product.price.price > 0){
                                    if((parseFloat(e.qty,10)+parseFloat(item.quantity,10)) <= 50){
                                        temp.productcode = e.sku;
                                        temp.quantity = parseFloat(e.qty,10);
                                        productData.push(temp); 
                                        productAdded++;
                                    }else{ 
                                        tempVar = {};
                                        tempVar.sku = e.sku;
                                        tempVar.name = e.productName;
                                        tempVar.msg = "Sorry, but you can't order more than 50 at a time.";
                                        popdata.itemsNotAddes.push(tempVar); 
                                    }
                                }else{
                                    tempVar = {};
                                    tempVar.sku = e.sku;
                                    tempVar.name = e.productName;
                                    tempVar.msg = "Sorry, but free items are one-per-order. If you need more, please call Customer Service at 800-323-9380.";
                                    popdata.itemsNotAddes.push(tempVar); 
                                } 
                            }else if(!item && !e.inventoryInfo.manageStock){
                                if(parseFloat(e.qty,10) <= 50){
                                    temp.productcode = e.sku;
                                    temp.quantity = parseFloat(e.qty,10);
                                    productData.push(temp); 
                                    productAdded++;
                                }else{
                                    tempVar = {};
                                    tempVar.sku = e.sku;
                                    tempVar.name = e.productName;
                                    tempVar.msg = "Sorry, but you can't order more than 50 at a time.";
                                    popdata.itemsNotAddes.push(tempVar); 
                                }
                            }else{
                                tempVar = {};
                                tempVar.sku = e.sku;
                                tempVar.name = e.productName;
                                tempVar.msg = "This item is currently out of stock.";
                                popdata.itemsNotAddes.push(tempVar); 
                            }
                        }else{
                            tempVar = {};
                            tempVar.sku = e.sku;
                            tempVar.name = e.productName;
                            tempVar.msg = "This item is currently out of stock.";
                            popdata.itemsNotAddes.push(tempVar);  
                        }
                    });
                    if(typeof $.cookie("isSubscriptionActive") === "undefined"){
                        if(productData.length > 0){
                            window.modelRapidOrder.model.set("isLoading",true);
                            window.modelRapidOrder.render();
                            Api.request('POST', 'svc/bulkadd', productData).then(function(res){
                                if(res.status == "success"){
                                    window.modelRapidOrder.clearList();
                                    window.modelRapidOrder.model.set("isLoading",false);
                                    window.modelRapidOrder.model.set("addtocartpopup",popdata);
                                    window.modelRapidOrder.render();
                                    setTimeout(function(){
                                        window.modelRapidOrder.model.set("addtocartpopup",null);
                                        window.modelRapidOrder.render($(document).find('input.skuInput').first().attr('class'), $(document).find('input.skuInput').first().attr('data-index'));
                                    },3000);
                                    CartMonitor.update();
                                    MiniCart.MiniCart.showMiniCart(); 
                                }else{
                                    window.modelRapidOrder.clearList();
                                    window.modelRapidOrder.model.set("isLoading",false);
                                    window.modelRapidOrder.model.set("addtocartpopup",popdata);
                                    window.modelRapidOrder.render();
                                    setTimeout(function(){
                                        window.modelRapidOrder.model.set("addtocartpopup",null);
                                        window.modelRapidOrder.render($(document).find('input.skuInput').first().attr('class'), $(document).find('input.skuInput').first().attr('data-index'));
                                    },3000);
                                    CartMonitor.update();
                                    MiniCart.MiniCart.showMiniCart();
                                } 
                            }); 
                        }else{
                            popdata.msg = "None of the product are added to cart."; 
                            popdata.isShowpopUp = true;
                            window.modelRapidOrder.clearList();
                            window.modelRapidOrder.model.set("addtocartpopup",popdata); 
                            window.modelRapidOrder.render();
                            setTimeout(function(){
                                window.modelRapidOrder.model.set("addtocartpopup",null);
                                window.modelRapidOrder.render($(document).find('input.skuInput').first().attr('class'), $(document).find('input.skuInput').first().attr('data-index'));
                            },3000);
                        }  
                    }else if(subscriptionPopup && typeof $.cookie("isSubscriptionActive") !== "undefined"){
                        alertPopup.AlertView.fillmessage("future-dailog","You have future products in the list so you cannot subscribe the future products.", function(result) {
                            if(!result) {
                                 alertPopup.AlertView.closepopup();
                            }else{
                                alertPopup.AlertView.closepopup();
                            } 
                        }); 
                    
                    }else if(!subscriptionPopup && typeof $.cookie("isSubscriptionActive") !== "undefined"){
                         if(productData.length > 0){
                            window.modelRapidOrder.model.set("isLoading",true);
                            window.modelRapidOrder.render();
                            Api.request('POST', 'svc/bulkadd', productData).then(function(res){
                                if(res.status == "success"){
                                    window.modelRapidOrder.clearList();
                                    window.modelRapidOrder.model.set("isLoading",false);
                                    window.modelRapidOrder.model.set("addtocartpopup",popdata);
                                    window.modelRapidOrder.render();
                                    setTimeout(function(){
                                        window.modelRapidOrder.model.set("addtocartpopup",null);
                                        window.modelRapidOrder.render($(document).find('input.skuInput').first().attr('class'), $(document).find('input.skuInput').first().attr('data-index'));
                                    },3000);
                                    CartMonitor.update();
                                    MiniCart.MiniCart.showMiniCart(); 
                                }else{
                                    window.modelRapidOrder.clearList();
                                    window.modelRapidOrder.model.set("isLoading",false);
                                    window.modelRapidOrder.model.set("addtocartpopup",popdata);
                                    window.modelRapidOrder.render();
                                    setTimeout(function(){
                                        window.modelRapidOrder.model.set("addtocartpopup",null);
                                        window.modelRapidOrder.render($(document).find('input.skuInput').first().attr('class'), $(document).find('input.skuInput').first().attr('data-index'));
                                    },3000);
                                    CartMonitor.update();
                                    MiniCart.MiniCart.showMiniCart();
                                } 
                            }); 
                        }else{
                            popdata.msg = "None of the product are added to cart."; 
                            popdata.isShowpopUp = true;
                            window.modelRapidOrder.clearList();
                            window.modelRapidOrder.model.set("addtocartpopup",popdata); 
                            window.modelRapidOrder.render();
                            setTimeout(function(){
                                window.modelRapidOrder.model.set("addtocartpopup",null);
                                window.modelRapidOrder.render($(document).find('input.skuInput').first().attr('class'), $(document).find('input.skuInput').first().attr('data-index'));
                            },3000);
                        } 
                    }           
                }else{
                    // alert("non of the products are added"); 
                }
            },
            clearList : function(e){
                var emptyCount = 4, items = [],counter = 1;
                while(emptyCount){
                    var temp = this.returnEmptyrow(counter-1); 
                    items.push(temp);  
                    emptyCount--; counter++; 
                } 
                window.modelRapidOrder.model.set('items',items);
                window.modelRapidOrder.model.set('topSellAddedItems',[]); 
                window.modelRapidOrder.render($(document).find('input.skuInput').first().attr('class'), $(document).find('input.skuInput').first().attr('data-index')); 
            },
            keyremoveitemFromList : function(e){
                e.preventDefault();
                var self = this, keyCode = e.keyCode, ele;
                if(keyCode == 13 || keyCode == 32){
                    this.removeItemfromList(e);
                }
            },
            removeItemfromList : function(e){
                var rowId = $(e.target).attr('data-attr-row');
                var modelItems = window.modelRapidOrder.model.get('items');
                var items = modelItems.map(function(temp){ 
                    if(temp.rowId == rowId){
                        temp.productName = "";
                        temp.sku = null;
                        temp.inventoryInfo = null;
                        temp.firstShipDate = null; 
                        temp.isFutureProduct = null;
                        temp.isfilled = false;
                        temp.price = null;
                        temp.salesPrice = null;
                        temp.qty = null;
                        temp.lineTotal = null;
                        temp.productImages = null;
                        temp.isheatsensitive = null; 
                    } 
                    return temp;
                });
                window.modelRapidOrder.model.set('items',items); 
                window.modelRapidOrder.render('skuInput',$(e.target).attr('data-index'));
            },
            changeQty : function(e){
                var rowId = $(e.target).attr('data-attr-row'); 
                var qty = $(e.target).val();
                var modelItems = window.modelRapidOrder.model.get('items');
                var items = modelItems.map(function(temp){
                    if(temp.rowId == rowId){
                        temp.qty = qty;
                        temp.lineTotal = typeof(temp.salesPrice) && temp.price > temp.salesPrice ? (temp.qty*temp.salesPrice).toFixed(2) : (temp.qty*temp.price).toFixed(2);
                    }
                    return temp;
                });
                window.modelRapidOrder.model.set('items',items); 
                window.modelRapidOrder.render($(e.target).attr('class'),$(e.target).attr('data-index'));
            }, 
            search : function(e){
                var self = this, keyCode = e.keyCode;
                if($(e.target).val().length >= 3){
                    if(!(e.which === 9 && !e.shiftKey)){
                        Api.request('POST','svc/rofSearch',{"query":$(e.target).val()}).then(function(res){
                            res.items.filter(function(v,k){
                                if(v.productName.indexOf($(e.target).val()) >= 0 || v.productCode.indexOf($(e.target).val()) >= 0){
                                    return true;
                                }else{
                                    return false;
                                }
                            });
                            res.items.sort(function(a,b){
                                if(a.productName.indexOf($(e.target).val()) >= 0 && b.productName.indexOf($(e.target).val()) >= 0){
                                    return a.productName.indexOf($(e.target).val()) - b.productName.indexOf($(e.target).val());
                                }else if(a.productCode.indexOf($(e.target).val()) >= 0 && b.productCode.indexOf($(e.target).val()) >= 0){
                                    return a.productCode.indexOf($(e.target).val()) - b.productCode.indexOf($(e.target).val());
                                }
                            });
                            window.modelRapidOrder.model.set("searchSuggetion",res);
                            if(window.searchSuggesation){
                                window.searchSuggesation.model.set('firstShipDate',window.modelRapidOrder.model.get('searchSuggetion').firstShipDate);
                                window.searchSuggesation.model.set('items',window.modelRapidOrder.model.get('searchSuggetion').items);
                                window.searchSuggesation.model.set('shipDates',window.modelRapidOrder.model.get('searchSuggetion').shipDates);
                                window.searchSuggesation.render();
                            }else{
                                var QOModel = Backbone.MozuModel.extend({});
                                window.modelRapidOrder.model.get('searchSuggetion').isMobile = $(window).width() < 768 ? true : false;
                                window.modelRapidOrder.model.get('searchSuggetion').isTablet = $(window).width() < 1025 && $(window).width() > 767 ? true : false;
                                window.modelRapidOrder.model.get('searchSuggetion').isDesktop = $(window).width() > 1024 ? true : false;
                                var Suggesation = window.searchSuggesation = new searchSuggesation({
                                    el: $('.suggestion-'+$(e.target).attr('data-attr-rowId')),  
                                    model: new QOModel(window.modelRapidOrder.model.get('searchSuggetion')) 
                                });
                                Suggesation.render(); 
                                self.stopScroll(); 
                            }
                        });
                    }else{
                        e.preventDefault();
                    }
                } 
            },
            handelTab : function(e){
                var self = this, keyCode = e.keyCode; 
                if((e.which === 9 && !e.shiftKey)){
                    var dataEl = $(document).find('.suggestionItem').first().addClass('active'); 
                    if(dataEl.length){
                        e.preventDefault(); 
                        if(dataEl.find('.item-dataAction').hasClass('both')){
                            dataEl.find('.item-dataAction').find('button').first().focus();  
                        }else{                            
                            dataEl.find('.item-dataAction').find('button').focus();    
                        }                        
                        self.navigateSuggestion();  
                    }else if($(document).find('.skuInput').last().attr('data-index') == $(e.target).attr('data-index')){
                        e.preventDefault();
                        $(document).find('.addAllToCart ').focus();
                    }
                }
            },
            navigateSuggestion : function(e){
                var btnList = $(document).find('.suggestion-data').find('button');
                var self = this, 
                firstBtn = btnList.first(),
                lastBtn = btnList.last();

                // tab on inputs
                btnList.on('keydown', function (e){
                    e.preventDefault(); 
                    var index = $(e.target).attr('data-index');
                    var className = $(e.target).attr('class');
                    var elementIndex;
                    btnList.filter(function(i,v){
                        if($(this).attr('data-index') == index && $(this).attr('class') == className){
                            elementIndex = i;
                        }
                    }); 
                    $(document).find('.suggestionItem').removeClass('active');
                    if ((e.which === 9 && !e.shiftKey)) {
                        if(elementIndex <= btnList.length-2){
                            $(btnList[elementIndex+1]).focus();
                            $(btnList[elementIndex+1]).parents('.suggestionItem').addClass('active');
                        }else{
                            $(btnList[0]).focus();
                            $(btnList[0]).parents('.suggestionItem').addClass('active');
                        }
                        //firstBtn.focus(); 
                    } 
                    if ((e.which === 9 && e.shiftKey)) {   
                        if(elementIndex > 0){
                            $(btnList[elementIndex-1]).focus();
                            $(btnList[elementIndex-1]).parents('.suggestionItem').addClass('active');
                        }else{
                            $(btnList[btnList.length-1]).focus();  
                            $(btnList[btnList.length-1]).parents('.suggestionItem').addClass('active'); 
                        }                         
                        // lastBtn.focus();  
                    }
                    if(e.which == 13 || e.which == 32){
                        $(e.target).trigger('click'); 
                    }
                    if(e.which == 27){
                        $(e.target).parents('.items').find('.skuInput').focus();
                    } 
                });
            },
            preventScroll : function(e){
                e.preventDefault();    
            },
            stopScroll : function(){
                this.$el.find('.mobile-cointainer').addClass("noscroll");
            },
            startScroll : function(){
                this.$el.find('.mobile-cointainer').removeClass("noscroll");
            },
            calculateTotal : function(e){
                var itemCount = 0, itemTotal = 0, futureDates = [], iscoldPack = false, hasFutureProd = false;
                if(this.model.get('items').length){
                    this.model.get('items').filter(function(v){
                        if(v.isfilled){
                            itemCount++; 
                            itemTotal = itemTotal + parseFloat(v.lineTotal,10); 
                            if(v.isFutureProduct){
                                hasFutureProd = true;
                                futureDates.push(v.firstShipDate);
                            } 
                            if(v.isheatsensitive){
                                iscoldPack = true;
                            }
                        }
                    });  
                } 
                if(this.model.get('topSellAddedItems').length){
                    this.model.get('topSellAddedItems').filter(function(v){
                        if(v.isfilled){
                            itemCount++; 
                            itemTotal = itemTotal + parseFloat(v.lineTotal,10); 
                            if(v.isFutureProduct){
                                hasFutureProd = true;
                                futureDates.push(v.firstShipDate);
                            } 
                            if(v.isheatsensitive){
                                iscoldPack = true;
                            }
                        }
                    });     
                }
                var datetoShow = null;
                if(futureDates.length){
                    datetoShow = futureDates.reduce(function (pre, cur) {
                        return Date.parse(pre) < Date.parse(cur) ? cur : pre;
                    });
                }
                this.model.set('listItemCount',itemCount);
                this.model.set('hasHeatsensitive',iscoldPack);
                this.model.set('hasFutureProduct',hasFutureProd);
                this.model.set('listTotal',itemTotal);
                this.model.set('ListFirstshipdate',datetoShow);
            },
            topsellerstabchange : function(e){
                var catCode = $(e.target).attr('data-attr-catcode');
                this.model.get('topSellers').filter(function(v){
                    if(v.catCode == catCode){
                        v.activeStatus = true;
                    }else{
                        v.activeStatus = false; 
                    }
                });
                this.render();
            },
            addtoListTopseller : function(e){
                var self = this;
                var modelItems = window.modelRapidOrder.model.get('items');
                var modelTopSellerItems = window.modelRapidOrder.model.get('topSellAddedItems');
                var item = _.find(self.model.get('topSellersItems'), function(property) {
                            if (property.productCode == $(e.target).attr('data-attr-code')) {
                                return property;
                            }
                        }); 
                item.listType = "topSeller";
                var existingRow = null;
                var isExistTOP = modelTopSellerItems.length > 0 ? modelTopSellerItems.filter(function(temp){ existingRow = temp.rowId; return item.productCode == temp.sku ? true : false;}).length : 0;
                var isExistROF = modelItems.length > 0 ? modelItems.filter(function(temp){ existingRow = temp.rowId; return item.productCode == temp.sku ? true : false;}).length : 0;
                if(isExistROF <= 0 && isExistTOP <= 0){
                    var temp = {}; 
                    temp.productName = item.productName;
                    temp.sku = item.productCode;
                    temp.inventoryInfo = item.inventoryInfo;
                    temp.firstShipDate = item.firstShipDate; 
                    temp.isFutureProduct = item.isFutureProduct;
                    temp.isfilled = true;
                    temp.price = item.price.price;
                    temp.salesPrice = item.price.salePrice;
                    temp.qty = 1;
                    temp.isheatsensitive = item.isheatsensitive; 
                    temp.lineTotal = typeof(item.price.salePrice) && item.price.price > item.price.salePrice ? (temp.qty*item.price.salePrice).toFixed(2) : (temp.qty*item.price.price).toFixed(2);
                    window.modelRapidOrder.model.get('topSellAddedItems').push(temp);
                    window.modelRapidOrder.render();       
                }else{ 
                    var msg = "";
                    if(isExistROF > 0){
                        msg = "Item you selected is already selected in ROF form.";
                    }else{
                        msg = "Item you selected is already selected in Top seller section.";
                    }
                    this.model.set('customMsg',msg);
                    this.model.set('showCustompopup',true);                    
                    setTimeout(function(){
                        self.model.set('customMsg',null);
                        self.model.set('showCustompopup',false);
                        self.render();
                    },3000);
                    this.render();
                }
            },
            futureConfirmationtop : function(e){
                var self = this;
                var modelItems = window.modelRapidOrder.model.get('items');
                var modelTopSellerItems = window.modelRapidOrder.model.get('topSellAddedItems');
                var item = _.find(self.model.get('topSellersItems'), function(property) {
                            if (property.productCode == $(e.target).attr('data-attr-code')) {
                                return property;
                            }
                        }); 
                item.listType = "topSeller";
                var existingRow = null;
                var isExistTOP = modelTopSellerItems.length > 0 ? modelTopSellerItems.filter(function(temp){ existingRow = temp.rowId; return item.productCode == temp.sku ? true : false;}).length : 0;
                var isExistROF = modelItems.length > 0 ? modelItems.filter(function(temp){ existingRow = temp.rowId; return item.productCode == temp.sku ? true : false;}).length : 0;
                if(isExistROF <= 0 && isExistTOP <= 0){
                    var QOModel = Backbone.MozuModel.extend({}); 
                    var confirmationPopup = window.confirmationPopup = new futureConfirm({
                        el: $('.data-future'),
                        model: new QOModel(item)
                    });
                    confirmationPopup.render(); 
                }else{ 
                    var msg = "";
                    if(isExistROF > 0){
                        msg = "Item you selected is already selected in ROF form.";
                    }else{
                        msg = "Item you selected is already selected in Top seller section.";
                    }
                    this.model.set('customMsg',msg);
                    this.model.set('showCustompopup',true);                    
                    setTimeout(function(){
                        self.model.set('customMsg',null);
                        self.model.set('showCustompopup',false);
                        self.render();
                    },3000);
                    this.render();
                }
            }, 
            notifymetop : function(e){
                var self = this;
                var item = _.find(self.model.get('topSellersItems'), function(property) {
                            if (property.productCode == $(e.target).attr('data-attr-code')) {
                                return property;
                            }
                        }); 
                item.isMobile = $(window).width() < 768 ? true : false;
                item.isTablet = $(window).width() < 1025 && $(window).width() > 767 ? true : false;
                item.isDesktop = $(window).width() > 1024 ? true : false; 
                item.userEmail = decodeURIComponent(jQuery.cookie('userData')); 
                item.customerId = require.mozuData('user').accountId;
                item.error = "";
                item.success = false;
                var QOModel = Backbone.MozuModel.extend({}); 
                if(window.notifymePopUpData){
                    window.notifymePopUpData.destoryMe();
                }
                var notifymePopUpData = window.notifymePopUpData = new notifymePopUp({
                    el: $('.data-notify'),
                    model: new QOModel(item)
                });
                notifymePopUpData.render(); 
            },
            increseQty : function(e){
                var itemCode = $(e.target).attr("data-attr-code");
                var msg = "", flag = false;
                var items = window.modelRapidOrder.model.get('topSellAddedItems').map(function(v){
                    if(v.sku == itemCode){
                        if((v.qty+1) > 50){
                            msg = "You can not add more than 50 quantity per product.";
                            flag = true;
                        }else{
                            v.qty = v.qty+1;
                            v.lineTotal = typeof(v.salePrice) && v.price > v.salePrice ? (v.qty*v.salePrice).toFixed(2) : (v.qty*v.price).toFixed(2);
                        }
                    }
                    return v;
                });
                if(flag){
                    window.modelRapidOrder.model.set('customMsg',msg);
                    window.modelRapidOrder.model.set('showCustompopup',true);                    
                    setTimeout(function(){
                        window.modelRapidOrder.model.set('customMsg',null);
                        window.modelRapidOrder.model.set('showCustompopup',false);
                        window.modelRapidOrder.render();
                    },3000);
                }
                window.modelRapidOrder.model.set('topSellAddedItems',items);
                window.modelRapidOrder.render();
            },
            decreaseQty : function(e){
                var itemCode = $(e.target).attr("data-attr-code");
                var msg = "", flag = false;
                var items = window.modelRapidOrder.model.get('topSellAddedItems').map(function(v){
                    if(v.sku == itemCode){
                        if((v.qty-1) < 1){
                            msg = "You can not reduce the quantity less than 1, instead you can remove the product from the list.";
                            flag = true;
                        }else{
                            v.qty = v.qty-1;
                            v.lineTotal = typeof(v.salePrice) && v.price > v.salePrice ? (v.qty*v.salePrice).toFixed(2) : (v.qty*v.price).toFixed(2);
                        }
                    }
                    return v;
                });
                if(flag){ 
                    window.modelRapidOrder.model.set('customMsg',msg);
                    window.modelRapidOrder.model.set('showCustompopup',true);                    
                    setTimeout(function(){
                        window.modelRapidOrder.model.set('customMsg',null);
                        window.modelRapidOrder.model.set('showCustompopup',false);
                        window.modelRapidOrder.render();
                    },3000);
                }
                window.modelRapidOrder.model.set('topSellAddedItems',items);
                window.modelRapidOrder.render();
            },
            removeItemfromtopseller : function(e){
                var itemCode = $(e.target).attr("data-attr-code");
                var msg = "";
                var items = window.modelRapidOrder.model.get('topSellAddedItems').filter(function(v){ return v.sku == itemCode ? false : true;}); 
                window.modelRapidOrder.model.set('topSellAddedItems',items);
                window.modelRapidOrder.render();   
            },
            handelTabOnaddAll : function(e){
                var self = this, keyCode = e.keyCode; 
                if((e.which === 9 && !e.shiftKey)){
                    e.preventDefault();
                    var dataEl = $(document).find('.clearList').focus(); 
                }   
            },
            render : function(className,index){
                this.calculateTotal();
                var scrollPositionTop = $('.mobile-cointainer').scrollTop();
                var scrollPositionleft = $('.tab-heading-viewport').scrollLeft();
                Backbone.MozuView.prototype.render.apply(this);
                $('.mobile-cointainer').scrollTop(scrollPositionTop);
                $('.tab-heading-viewport').scrollLeft(scrollPositionleft);
                setTimeout(function(){
                    if(className && index){
                        $(document).find('.'+className+'[data-index='+index+']').focus();   
                    }else{
                        $(document).find('.'+className).focus();   
                    }
                },500);  
            } 
        });
        var searchSuggesation = Backbone.MozuView.extend({
            templateName : "modules/rofSearchSuggestion", 
            additionalEvents: {
                "click .instock-select": "addtoList",
                "click .notify-me" : "notifyme",
                "click .future-select" : "futureConfirmation"
            },
            futureConfirmation : function(e){
                var self = this;
                var modelItems = window.modelRapidOrder.model.get('items');
                var modelTopSellerItems = window.modelRapidOrder.model.get('topSellAddedItems');
                var item = _.find(self.model.get('items'), function(property) {
                            if (property.productCode == $(e.target).attr('data-attr-code')) {
                                return property;
                            }
                        }); 
                item.listType = "rofForm";
                var existingRow = null;
                var isExistTOP = modelTopSellerItems.length > 0 ? modelTopSellerItems.filter(function(temp){ existingRow = temp.rowId; return item.productCode == temp.sku ? true : false;}).length : 0;
                var isExistROF = modelItems.length > 0 ? modelItems.filter(function(temp){ existingRow = temp.rowId; return item.productCode == temp.sku ? true : false;}).length : 0;
                if(isExistROF <= 0 && isExistTOP <= 0){
                    var QOModel = Backbone.MozuModel.extend({}); 
                    var confirmationPopup = window.confirmationPopup = new futureConfirm({
                        el: $('.data-future'),
                        model: new QOModel(item)
                    });
                    confirmationPopup.render(); 
                }else{
                    var msg = "";
                    if(isExistROF > 0){
                        msg = "Item you selected is already selected in ROF form.";
                    }else{
                        msg = "Item you selected is already selected in Top seller section.";
                    }
                    window.modelRapidOrder.model.set('customMsg',msg);
                    window.modelRapidOrder.model.set('showCustompopup',true);                    
                    setTimeout(function(){
                        window.modelRapidOrder.model.set('customMsg',null);
                        window.modelRapidOrder.model.set('showCustompopup',false);
                        window.modelRapidOrder.render($(document).find('input.skuInput').first().attr('class'), $(document).find('input.skuInput').first().attr('data-index'));
                    },3000);
                    window.modelRapidOrder.render();  
                    delete window.searchSuggesation;                 
                }
            }, 
            notifyme : function(e){
                var self = this;
                var item = _.find(self.model.get('items'), function(property) {
                            if (property.productCode == $(e.target).attr('data-attr-code')) {
                                return property;
                            }
                        });
                item.isMobile = $(window).width() < 768 ? true : false;
                item.isTablet = $(window).width() < 1025 && $(window).width() > 767 ? true : false;
                item.isDesktop = $(window).width() > 1024 ? true : false; 
                item.userEmail = decodeURIComponent(jQuery.cookie('userData'));
                item.customerId = require.mozuData('user').accountId;
                item.error = "";
                item.success = false;
                var QOModel = Backbone.MozuModel.extend({}); 
                if(window.notifymePopUpData){
                    window.notifymePopUpData.destoryMe();
                }
                var notifymePopUpData = window.notifymePopUpData = new notifymePopUp({
                    el: $('.data-notify'),
                    model: new QOModel(item)
                });
                notifymePopUpData.render('notify-me-input'); 
            },
            addtoList : function(e){
                var modelItems = window.modelRapidOrder.model.get('items');
                var modelTopSellerItems = window.modelRapidOrder.model.get('topSellAddedItems');
                var emptyitem = null, flag = true, emptyCount = 0;
                var item = _.find(this.model.get('items'), function(property) {
                            if (property.productCode == $(e.target).attr('data-attr-code')) {  
                                return property;
                            }
                        }); 
                var existingRow = null;
                var isExistTOP = modelTopSellerItems.length > 0 ? modelTopSellerItems.filter(function(temp){ existingRow = temp.rowId; return item.productCode == temp.sku ? true : false;}).length : 0;
                var isExistROF = modelItems.length > 0 ? modelItems.filter(function(temp){ existingRow = temp.rowId; return item.productCode == temp.sku ? true : false;}).length : 0;
                if(isExistROF <= 0 && isExistTOP <= 0){
                    var items = modelItems.map(function(temp){
                        if(!temp.isfilled){
                            if(flag){
                                flag = false;
                                temp.productName = item.productName;
                                temp.sku = item.productCode;
                                temp.inventoryInfo = item.inventoryInfo;
                                temp.firstShipDate = item.firstShipDate; 
                                temp.isFutureProduct = item.isFutureProduct;
                                temp.isfilled = true;
                                temp.productImages = item.productImages;
                                temp.price = (item.price.price).toFixed(2);
                                temp.salesPrice = (item.price.salePrice).toFixed(2);
                                temp.qty = 1;
                                temp.isheatsensitive = item.isheatsensitive; 
                                temp.lineTotal = typeof(item.price.salePrice) && item.price.price > item.price.salePrice ? (temp.qty*item.price.salePrice).toFixed(2) : (temp.qty*item.price.price).toFixed(2);
                            }else{
                                emptyCount++;
                            }
                        }
                        return temp;
                    });
                    if(emptyCount < 2){
                        var temp = window.modelRapidOrder.returnEmptyrow(items[items.length-1].rowId);
                        items.push(temp);   
                    }
                    window.modelRapidOrder.model.set('items',items);
                    window.modelRapidOrder.render($(e.target).parents('.items').next().find('.tital-cointainer input').attr('class'),$(e.target).parents('.items').next().find('.tital-cointainer input').attr('data-index')); 
                    delete window.searchSuggesation;
                }else{ 
                    var msg = "";
                    if(isExistROF > 0){
                        msg = "Item you selected is already selected in ROF form.";
                    }else{
                        msg = "Item you selected is already selected in Top seller section.";
                    }
                    window.modelRapidOrder.model.set('customMsg',msg);
                    window.modelRapidOrder.model.set('showCustompopup',true);                    
                    setTimeout(function(){
                        window.modelRapidOrder.model.set('customMsg',null);
                        window.modelRapidOrder.model.set('showCustompopup',false);
                        window.modelRapidOrder.render($(e.target).parents('.items').find('.tital-cointainer input').attr('class'),$(e.target).parents('.items').find('.tital-cointainer input').attr('data-index'));
                    },3000);
                    window.modelRapidOrder.render();  
                    delete window.searchSuggesation;         
                }
            }, 
            render : function(){
                Backbone.MozuView.prototype.render.apply(this);
            } 
        });
        var notifymePopUp = Backbone.MozuView.extend({
            templateName : "modules/notifymePopup",
            additionalEvents: {
                "click .closePopup": "closePopup",
                "click .notify-me-btn": "notify",
                "keyup .closePopup" : "keyClosPopup"
            }, 
            destoryMe : function(e){
                //COMPLETELY UNBIND THE VIEW
                this.undelegateEvents();
                $(this.el).removeData().unbind(); 

                //Remove view from DOM
                // this.remove();  
                // Backbone.View.prototype.remove.call(this);
            },
            notify : function(e){
                var nSelf = this;
                var email = $(e.target).prev('input.notify-me-input').val();
                if(email !== ""){ 
                    this.model.set('error',"");
                    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    var patt = new RegExp(re);
                    if(patt.test(email)){                      
                        var obj = { 
                            email: email,   
                            customerId: this.model.get('customerId'),
                            productCode: this.model.get('productCode'), 
                            locationCode: this.model.get('inventoryInfo').onlineLocationCode  
                        }; 
                        Api.create('instockrequest',obj ).then(function (xhr) {
                            nSelf.model.set('success',true);
                            nSelf.model.set('userEmail',email);
                            nSelf.model.set('error',""); 
                            nSelf.render();
                            setTimeout(function(){nSelf.closePopup();},5000);
                        }, function (xhr) {
                            if(xhr.errorCode == "VALIDATION_CONFLICT"){
                                nSelf.model.set('success',false);
                                nSelf.model.set('userEmail',email);
                                nSelf.model.set('error',"Please enter valid email address.");
                                nSelf.render();
                            }else if(xhr.errorCode != "ITEM_ALREADY_EXISTS"){ 
                                nSelf.model.set('success',false);
                                nSelf.model.set('userEmail',email);
                                nSelf.model.set('error',"Email id you have provided already subscribed for back in stock notification."); 
                                nSelf.render();
                            }else{
                                nSelf.model.set('success',false);
                                nSelf.model.set('userEmail',email);
                                nSelf.model.set('error',"Email id you have provided already subscribed for back in stock notification.");                                     
                                nSelf.render();
                            }  
                        });
                    }else{
                        nSelf.model.set('success',false);
                        nSelf.model.set('userEmail',email);
                        nSelf.model.set('error',"Please enter a valid Email id.");
                        setTimeout(function(){nSelf.render();},500);                        
                    }
                }else{
                    nSelf.model.set('success',false);
                    nSelf.model.set('userEmail',email);
                    nSelf.model.set('error',"Please enter a valid Email id.");
                    setTimeout(function(){nSelf.render();},500);
                }
            },
            closePopup : function(e){
                this.$el.find('.notify-me-popup').remove();
                this.stopListening();
                setTimeout(function(){
                    $(document).find('.'+$(document).find('input.skuInput').first().attr('class')+'[data-index='+$(document).find('input.skuInput').first().attr('data-index')+']').focus();   
                },500);  
            },
            keyClosPopup : function(e){
                e.preventDefault();
                var self = this, keyCode = e.keyCode, ele;
                if(keyCode == 13 || keyCode == 32){
                    $(e.target).trigger('click'); 
                }
            },
            navigateinPopUp : function(){
                var inputList = $(document).find('.notify-me-popup').find('.closePopup, .notify-me-input, .notify-me-btn');
                var first = inputList.first();
                var last = inputList.last();

                // if current element is last, get focus to first element on tab press.
                // last.on('keydown', function (e) {
                //    if ((e.which === 9 && !e.shiftKey)) {
                //        e.preventDefault();
                //        first.focus(); 
                //    }
                // });
                
                // // if current element is first, get focus to last element on tab+shift press.
                // first.on('keydown', function (e) {
                //     if ((e.which === 9 && e.shiftKey)) {
                //         e.preventDefault();
                //         last.focus();  
                //     }
                // }); 

                // new function for looping
                inputList.on('keydown', function (e){
                    var index = $(e.target).attr('data-index');
                    var className = $(e.target).attr('class');
                    var elementIndex;
                    inputList.filter(function(i,v){
                        if($(this)[0] == $(e.target)[0]){
                            elementIndex = i; 
                        }  
                    }); 
                    $(document).find('.suggestionItem').removeClass('active');
                    if ((e.which === 9 && !e.shiftKey)) {
                        e.preventDefault(); 
                        if(elementIndex <= inputList.length-2){
                            $(inputList[elementIndex+1]).focus();
                        }else{
                            $(inputList[0]).focus();
                        }
                        //firstBtn.focus(); 
                    } 
                    if ((e.which === 9 && e.shiftKey)) {   
                        e.preventDefault(); 
                        if(elementIndex > 0){
                            $(inputList[elementIndex-1]).focus();
                        }else{
                            $(inputList[inputList.length-1]).focus(); 
                        }                         
                        // lastBtn.focus();  
                    }
                    if(e.which == 13 || e.which == 32){ 
                        e.preventDefault();  
                        $(e.target).trigger('click'); 
                    } 
                });  
            },
            render : function(className,index){
                var self = this;
                Backbone.MozuView.prototype.render.apply(this);
                setTimeout(function(){
                    if(className && index){
                        $(document).find('.'+className+'[data-index='+index+']').focus();   
                    }else{
                        $(document).find('.'+className).focus();   
                    }
                    self.navigateinPopUp();
                },500);  
            }      
        });
        var futureConfirm = Backbone.MozuView.extend({
            templateName : "modules/futurePopup",
            additionalEvents: {
                "click .closepopup-fun" : "closePopup",
                "click .savetoList-rof" : "saveToList",
                "click .savetoList-top" : "saveToTopList",
                "keyup .closePopup" : "keyClosPopup"
            },
            keyClosPopup : function(e){
                e.preventDefault();
                var self = this, keyCode = e.keyCode, ele;
                if(keyCode == 13 || keyCode == 32){
                    $(e.target).trigger('click'); 
                }
            },
            navigateinPopUp : function(){
                var inputList = $(document).find('.future-confirmation').find('.closePopup, .closepopup-fun, .savetoList-rof');
                var first = inputList.first();
                var last = inputList.last();

                // if current element is last, get focus to first element on tab press.
                // last.on('keydown', function (e) {
                //    if ((e.which === 9 && !e.shiftKey)) {
                //        e.preventDefault();
                //        first.focus(); 
                //    }
                // });
                
                // // if current element is first, get focus to last element on tab+shift press.
                // first.on('keydown', function (e) {
                //     if ((e.which === 9 && e.shiftKey)) {
                //         e.preventDefault();
                //         last.focus();  
                //     }
                // }); 

                inputList.on('keydown', function (e){
                    e.preventDefault(); 
                    var index = $(e.target).attr('data-index');
                    var className = $(e.target).attr('class');
                    var elementIndex;
                    inputList.filter(function(i,v){
                        if($(this)[0] == $(e.target)[0]){
                            elementIndex = i; 
                        }  
                    }); 
                    $(document).find('.suggestionItem').removeClass('active');
                    if ((e.which === 9 && !e.shiftKey)) {
                        if(elementIndex <= inputList.length-2){
                            $(inputList[elementIndex+1]).focus();
                        }else{
                            $(inputList[0]).focus(); 
                        }
                        //firstBtn.focus(); 
                    } 
                    if ((e.which === 9 && e.shiftKey)) {   
                        if(elementIndex > 0){
                            $(inputList[elementIndex-1]).focus();
                        }else{
                            $(inputList[inputList.length-1]).focus(); 
                        }                         
                        // lastBtn.focus();  
                    }
                    if(e.which == 13 || e.which == 32){ 
                        $(e.target).trigger('click'); 
                    } 
                });  
            },
            saveToList : function(e){ 
                var modelItems = window.modelRapidOrder.model.get('items');
                var emptyitem = null, flag = true, emptyCount = 0;  
                var item = this.model;
                var items = modelItems.map(function(temp){
                    if(!temp.isfilled){
                        if(flag){
                            flag = false;
                            temp.productName = item.get('productName');
                            temp.sku = item.get('productCode');
                            temp.inventoryInfo = item.get('inventoryInfo');
                            temp.firstShipDate = item.get('firstShipDate'); 
                            temp.isFutureProduct = item.get('isFutureProduct');
                            temp.isfilled = true;
                            temp.price = item.get('price').price;
                            temp.salesPrice = item.get('price').salePrice;
                            temp.productImages = item.get('productImages');
                            temp.qty = 1;
                            temp.isheatsensitive = item.get('isheatsensitive'); 
                            temp.lineTotal = typeof(item.get('price').salePrice) && item.get('price').price > item.get('price').salePrice ? (temp.qty*item.get('price').salePrice).toFixed(2) : (temp.qty*item.get('price').price).toFixed(2);
                        }else{
                            emptyCount++;
                        }  
                    }
                    return temp;
                });
                if(emptyCount < 2){
                    var temp = window.modelRapidOrder.returnEmptyrow(items[items.length-1].rowId);
                    items.push(temp);   
                }
                window.modelRapidOrder.model.set('items',items);
                window.modelRapidOrder.render($(document).find('input.skuInput').first().attr('class'), (parseInt($(document).find('input.skuInput').first().attr('data-index'),10)+1));
                delete window.searchSuggesation; 
            }, 
            saveToTopList : function(e){
                var item = this.model, temp = {};
                temp.productName = item.get('productName');
                temp.sku = item.get('productCode');
                temp.inventoryInfo = item.get('inventoryInfo');
                temp.firstShipDate = item.get('firstShipDate'); 
                temp.isFutureProduct = item.get('isFutureProduct');
                temp.isfilled = true;
                temp.price = item.get('price').price;
                temp.salesPrice = item.get('price').salePrice;
                temp.qty = 1;
                temp.isheatsensitive = item.get('isheatsensitive'); 
                temp.lineTotal = typeof(item.get('price').salePrice) && item.get('price').price > item.get('price').salePrice ? (temp.qty*item.get('price').salePrice).toFixed(2) : (temp.qty*item.get('price').price).toFixed(2);
                window.modelRapidOrder.model.get('topSellAddedItems').push(temp); 
                window.modelRapidOrder.render($(document).find('input.skuInput').first().attr('class'), (parseInt($(document).find('input.skuInput').first().attr('data-index'),10)+1));   
            },
            closePopup : function(e){
                this.$el.find('.future-confirmation').remove();
                this.stopListening();
                window.modelRapidOrder.render($(document).find('input.skuInput').first().attr('class'), $(document).find('input.skuInput').first().attr('data-index')); 
                delete window.confirmationPopup;   
            },
            render : function(){
                Backbone.MozuView.prototype.render.apply(this);
                setTimeout(function(){
                    $(document).find('.future-confirmation').find('.savetoList-rof').focus();
                },500);
                this.navigateinPopUp();
            }  
        });

        $(document).ready(function() {
            $(document).find('html,body').addClass('hideOverFlow');
            console.log("height",$(window).height());
            // alert($(window).height());
            // new ROF implimentation.
            var myModel = window.myModel = {};
            myModel.hasProgressbar = false;
            myModel.topSellers = [];
            myModel.isMobile = $(window).width() < 768 ? true : false;
            myModel.isTablet = $(window).width() < 1025 && $(window).width() > 767 ? true : false;
            myModel.isDesktop = $(window).width() > 1024 ? true : false;
            myModel.topSellersItems = [];
            myModel.items = []; 
            myModel.searchSuggetion = [];
            myModel.topSellAddedItems = [];
            myModel.listItemCount = 0;
            myModel.hasHeatsensitive = false;
            myModel.hasFutureProduct = false;
            myModel.listTotal = 0;
            myModel.ListFirstshipdate = null;
            myModel.customMsg = null;
            myModel.showCustompopup = false;
            myModel.addtocartpopup = null;
            myModel.isLoading = false;
            var emptyCount = 4,counter = 1;
            while(emptyCount){
                var temp = {};
                    temp.rowId = counter;
                    temp.productName = "";
                    temp.sku = null;
                    temp.inventoryInfo = null;
                    temp.firstShipDate = null;
                    temp.isFutureProduct = null;
                    temp.isfilled = false;
                    temp.price = null;
                    temp.salesPrice = null;
                    temp.qty = null;
                    temp.lineTotal = null;
                    temp.isheatsensitive = null;  
                    temp.error = null;
                myModel.items.push(temp);  
                emptyCount--; counter++;
            }
            var QOModel = Backbone.MozuModel.extend({}); 
            var modelRapidOrder = window.modelRapidOrder = new reapidOrder({
                el: $('#rapid-order-content'),
                model: new QOModel(myModel)
            });
            var intervalcartITems = setInterval(function() {
                var cartItems = MiniCart.MiniCart.getRenderContext().model.items;
                window.modelRapidOrder.model.set('hasProgressbar',cartItems.length > 0 ? true : false); 
                if(cartItems.length){
                    clearInterval(intervalcartITems);
                    modelRapidOrder.render($(document).find('.skuInput').first().attr('class'),$(document).find('.skuInput').first().attr('data-index'));     
                }
            },1000);
            modelRapidOrder.render($(document).find('.skuInput').first().attr('class'),$(document).find('.skuInput').first().attr('data-index'));
            Api.request('GET', '/svc/data_visualizations').then(function(res){
                var flagIndicator = true;
                res.filter(function(v,i){
                    var temp = {}, length = v.items ? ((v.items.length > 10) ? 10 : v.items.length) : 0;
                    temp.catName = v.categoryName;  
                    temp.catCode = v.category;
                    if(length && flagIndicator){
                        temp.activeStatus =  true;
                        flagIndicator = false;
                    }else{
                        temp.activeStatus =  false;
                    }
                    temp.items = [];
                    var tempFirestVal = 0;
                    for (var j = 0; j < length; j++) {
                        if(j === 0){
                            tempFirestVal = v.items[j].unitsSold;
                            v.items[j].popularity = 10; 
                        }else{
                            v.items[j].popularity = Math.floor((10*v.items[j].unitsSold)/tempFirestVal);
                        }
                        myModel.topSellersItems.push(v.items[j]);
                        temp.items.push(v.items[j]);  
                    } 
                    myModel.topSellers.push(temp); 
                });
                modelRapidOrder.render($(document).find('.skuInput').first().attr('class'),$(document).find('.skuInput').first().attr('data-index'));                
            });            
            // closing the search overlay.
            $(document).on('click',function(e){
                if(!($(e.target).hasClass("suggestion-data") || $(e.target).parents().hasClass("suggestion-data") || $(e.target).hasClass('data-notify') || $(e.target).parents().hasClass("data-notify") || $(e.target).parents().hasClass('data-future') || $(e.target).hasClass('data-future'))){
                    if(window.searchSuggesation){
                        window.modelRapidOrder.render();
                        delete window.searchSuggesation; 
                    } 
                }
            });
            // initilize barcode maping
            if($(window).width() < 1030){
                $(document).on('focus', '#barcodeval', function(e){
                    setTimeout(function(){
                        $(document).find('.overlay-for-complete-page').show();
                        window.modelRapidOrder.getProductFeomBarcode($(document).find('#barcodeval').val());
                    },500);   
                }); 
            }
            // get device name.
            function getMobileOperatingSystem() {
              var userAgent = navigator.userAgent || navigator.vendor || window.opera;
                  // Windows Phone must come first because its UA also contains "Android"
                if (/windows phone/i.test(userAgent)) {
                    return "Windows Phone";
                } 
                if (/android/i.test(userAgent)) {
                    return "Android";
                }
                // iOS detection from: http://stackoverflow.com/a/9039885/177710
                if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                    return "iOS";
                }
                return "unknown";
            }
            var device = getMobileOperatingSystem();
            if(device == "Android"){
                $(document).find('#rapid-order-content').addClass('android-mobile');
            }   			
        });
    });