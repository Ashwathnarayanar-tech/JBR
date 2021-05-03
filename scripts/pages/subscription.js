/* Subscription Setup page
** Defines logic for interaction handling and data control at page-level
** Author: v.r.s
** Owner: Echidna Inc.
*/
define([
    "modules/jquery-mozu",
    "hyprlive",
    "modules/backbone-mozu",
    "underscore",
    "modules/api",
    'modules/models-product',
    "modules/alert-popup",
    "modules/models-cart",
    'modules/cart-monitor',
    'modules/minicart',
    "vendor/jquery-ui.min"
], function($, Hypr, Backbone, _,api, ProductModels, alertPopup, CartModels, CartMonitor,MiniCart) {

    // Accordian and depending function object - Lhs
    var Assortment = function() {
        var me = this;
        this.toggleAccordian = function() {
            if (!$(this).next().is(':visible')) {
                $(".accordion").next().slideUp();
                $(".accordion").removeClass("active");
                $(this).addClass("active");
                $(this).next().slideDown();
            } else {
                $(this).removeClass("active");
                $(this).next().slideUp();
            }
        };
        this.selectLineItem = function(el) {
            if (el.is(':checked')) {
                el.parents('tr').find('td').css('font-weight', 'bold');
            } else {
                el.parents('tr').find('td').css('font-weight', 'normal');
            }
        };
        this.toggleSelectAllItems = function() {
            var $this = $(this);
            if ($this.is(':checked')) {
                if ($this.parents('tr').hasClass('desktop')) {
                    $this.parents('thead').next().find('tr.desktop input[type="checkbox"]').not(':disabled').prop('checked', true);
                    //$this.
                } else {
                    $this.parents('thead').next().find('tr.mobile input[type="checkbox"]').not(':disabled').prop('checked', true);
                }
                me.selectLineItem($this);
            } else {
                if ($this.parents('tr').hasClass('desktop')) {
                    $this.parents('thead').next().find('tr.desktop input[type="checkbox"]').not(':disabled').prop('checked', false);
                } else {
                    $this.parents('thead').next().find('tr.mobile input[type="checkbox"]').not(':disabled').prop('checked', false);
                }
                me.selectLineItem($this);
            }
        };
        this.toggleAddtoListBtn = function() {
            var $this = $(this);
            if ($this.parents('.assort-table').find('input[type="checkbox"]:checked').length > 0) {
                $this.parents('.assort-table').next().find('button.addToList').prop('disabled', false);
            } else {
                $(this).parents('.assort-table').next().find('button.addToList').prop('disabled', true);
            }
        };
        this.addToList = function() {
            $(".overlay-for-complete-page").addClass("overlay-shown");
            $(".main-content").addClass("is-loading");
            var items = (typeof window.assortSummary.model.get("items") == "undefined") ? [] : window.assortSummary.model.get("items");
            var $this = $(this).parent().prev(),
                checkedItems = $this.find('input[type="checkbox"]:checked:visible:not(.header)'); // gives table with data
            checkedItems.map(function() {
                var itemsObj = {};
                var currItem = $(this).parents('tr');
                var productCode = "",
                    productName = "",
                    price = 0,
                    isColdPack = false,
                    qty = 0,
                    productstock = 0,
                    itemTotal = 0;
                var currItemPrice = currItem.find('.price').data("price");
                productCode = currItem.find('[assort-itemcode]').attr('assort-itemcode');
                productName = $(window).width() > 767 ? currItem.find('[assort-itemcode]').find('.assort-itemname').html() : currItem.find('[assort-itemname]').find('.item-content>span').html();
                price = (parseFloat(currItemPrice) === 0) ? currItemPrice : (Math.round(currItemPrice * 100) / 100);

                if (currItem.find('div.coldpack').length > 0) {
                    isColdPack = currItem.find('div.coldpack').data("coldpack");
                }
                qty = parseInt(currItem.find('select').val(), 10);
                var prod = _.findWhere(items, {productCode: productCode});
                if(prod){
                    if((qty+parseInt(prod.qty,10))<=prod.productstock){
                        productstock = parseInt(currItem.data('mz-productstock'), 10);
                        itemTotal = (Math.round(price * qty * 100) / 100);
                        itemsObj.productCode = productCode;
                        itemsObj.productName = productName;
                        itemsObj.price = price; 
                        itemsObj.isColdPack = isColdPack;
                        itemsObj.qty = qty;
                        itemsObj.productstock = productstock;
                        itemsObj.itemTotal = itemTotal;
                        if (items.length > 0) {
                            var itemToPush = me.checkforExistingItemsinList(items, itemsObj);
                            
                        } else
                            items.push(itemsObj);
                    }else{
                        alertPopup.AlertView.fillmessage("future-dailog", "Our current inventory levels won’t support your request, so we have not added to the subscription list.", function(userChoice) {
                            if (!userChoice) {
                                alertPopup.AlertView.closepopup();
                            } else {
                                alertPopup.AlertView.closepopup();
                            }
                        });
                    }
                }else{
                    productstock = parseInt(currItem.data('mz-productstock'), 10);
                    itemTotal = (Math.round(price * qty * 100) / 100);
                    itemsObj.productCode = productCode;
                    itemsObj.productName = productName;
                    itemsObj.price = price;
                    itemsObj.isColdPack = isColdPack;
                    itemsObj.qty = qty;
                    itemsObj.productstock = productstock;
                    itemsObj.itemTotal = itemTotal;
                    if (items.length > 0) {
                        var itemToPushs = me.checkforExistingItemsinList(items, itemsObj);
                    } else
                        items.push(itemsObj);
                }       
            });
            
            window.assortSummary.model.set("items", items);
            me.generateTotal(items);
            checkedItems.map(function() {
                $(this).prop('checked', false);
            });
            $this.find('input[type="checkbox"]').prop('checked', false);
            $this.next().find('button.addToList').prop('disabled',true);

            setTimeout(function() {
                $(".overlay-for-complete-page").removeClass("overlay-shown");
                $(".main-content").removeClass("is-loading");
                window.assortSummary.render();
                $('html, body').animate({
                    scrollTop: $("#scroller").offset().top
                }, 1500);
            }, 700);

        };
        this.generateTotal = function(modelItems) {
            var total = 0;
            if (modelItems.length > 0) {
                $.each(modelItems, function() {
                    total += this.itemTotal;
                });
            }
            window.assortSummary.model.set("total", total);
        };
        this.checkforExistingItemsinList = function(modelItems, listItem) {
            var flag = true;
            modelItems.find(function(ele) {

                if (listItem.productCode === ele.productCode) {
                    ele.qty = parseInt(ele.qty, 10) + parseInt(listItem.qty, 10);
                    ele.itemTotal = (Math.round(ele.price * ele.qty * 100) / 100);
                    flag = false;
                }
            });
            if (flag) {
                modelItems.push(listItem);
            }
        };
        this.notify = function() {
            if (me.validateEmail($('#mz-instock-request-email').val())) {
                var locationCodes = "";
                $(document).find('.err-msg-notify').html("");
                if (window.location.host.indexOf("s16708") > -1 || window.location.host.indexOf("east.jellybellyretailer.com") > -1) {
                    locationCodes = "MDC";
                } else if (window.location.host.indexOf("s21410") > -1 || window.location.host.indexOf("west.jellybellyretailer.com") > -1) {
                    locationCodes = "FDC";
                }
                api.create('instockrequest', {
                    email: $('#mz-instock-request-email').val(),
                    customerId: require.mozuData('user').accountId,
                    productCode: $('[data-mz-notify]').data('mz-notify'),
                    locationCode: locationCodes
                }).then(function() {
                    $(".err-msg-notify").html("Thank you! We'll let you know when we have more.").css('color','green');
                    setTimeout(function() {
                        $(".err-msg-notify").html("");
                        me.hideNotifyDialog();
                    }, 3000);
                }, function(err) {
                    if(err.errorCode.indexOf("ITEM_ALREADY_EXISTS") > -1) {
                        $(".err-msg-notify").html("InStockNotification: You are already subscribed for notification.").css('color','red');
                        setTimeout(function() {
                            $(".err-msg-notify").html("");
                        },3000);
                    } else {
                        $(".err-msg-notify").html("Something went wrong, Please try again later.").css('color','red');
                        setTimeout(function() {
                            $(".err-msg-notify").html("");
                        }, 3000);
                    }
                });
            } else {
                if ($('#mz-instock-request-email').val().length === 0) {
                    $(document).find('.err-msg-notify').html("Error: Please enter the email address and submit.").css('color','red');
                } else {
                    $(document).find('.err-msg-notify').html("Error: Please be sure to provide your Email Address. Make sure you have included the '@' and the '.' in the address.").css('color','red');
                }
            }
        };
        this.validateEmail = function(email) {
            var validity = true;
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            var patt = new RegExp(re);
            if (email.length === 0) {
                validity = false;
            } else if (patt.test(email)) {} else if (!(patt.test(email))) {
                validity = false;
            } else {}
            return validity;
        };
        this.showNotifyDialog = function() {
            var prdCode = $(this).parents('tr').attr('data-mz-productcode');
            $('[data-mz-notify]').data('mz-notify',prdCode);
            $('[data-mz-notify]').show();
            $('[data-mz-notify]').find('input[type="email"]').val(decodeURIComponent($.cookie('userData')));
        };
        this.hideNotifyDialog = function() {
            $(".err-msg-notify").html("");
            $('[data-mz-notify]').hide();
        };
    };

    // Summary view object - Rhs
    var AssortSummary = Backbone.MozuView.extend({
        templateName: "modules/assortment-summary",
        additionalEvents: {
            // this.model.set("":"")
            'change .mz-quantity': "updateQuantity",
            'click .remove-item': "removeItem",
            'click .clear-list': "clearList",
            'click .mz-subscribe': "createSubscription"

        },
        updateQuantity: function(e) {
            var current = $(e.target).parents('[data-prdcode]').data('prdcode'),
                quantity = $(e.target).val();
            $.each(this.model.get("items"), function() {
                if (current == this.productCode) {
                    this.qty = quantity;
                    this.itemTotal = (this.price * this.qty);
                }
            });

            window.assortment.generateTotal(this.model.get("items"));

            this.render();
        },
        removeItem: function(e) {
            var current = $(e.target).parents('[data-prdcode]').data('prdcode'),
                modelItems = this.model.get("items");
            $.each(modelItems, function(index) {
                if (current == this.productCode) {
                    modelItems.splice(index, 1);
                    return;
                }
            });
            if(modelItems.length>0 && $(document).find('[coldpack=true]').length>0){
                var coldProduct = 0, coldPack=0;
                $.each(modelItems, function(index) {
                    if(this.isColdPack){
                        coldProduct++;
                    }else if($(document).find('[coldpack=true]').attr('data-prdcode').toString() === this.productCode){
                        coldPack = index;
                    }
                });
                if (coldProduct<1) { 
                    modelItems.splice(coldPack, 1);
                }
            }
            window.assortment.generateTotal(this.model.get("items"));
            if(modelItems.length<1){
                this.clearCart();
            }
            this.render();
        },
        clearList: function() {
            var me = this;
            alertPopup.AlertView.fillmessage("first-dailog", "Are you sure you want to clear the subscription list?", function(userChoice) {
                if (userChoice) {
                    me.model.get("items").length = 0;
                    window.assortment.generateTotal(me.model.get("items"));
                    me.clearCart();
                    alertPopup.AlertView.closepopup();
                    me.render();
                } else {
                    alertPopup.AlertView.closepopup();
                }
            });


            // if (this.model.get("items").length > 0) {
            //     this.model.get("items").length = 0;
            // }

        },
        clearCart:function(){
            if($.cookie('isSubscriptionActive') && $.cookie("scheduleInfo")){
                var cartModel = new CartModels.Cart(); 
                cartModel.apiEmpty().then(function(){
                    $.removeCookie("isSubscriptionActive");
                    $.removeCookie("scheduleInfo");
                    CartMonitor.update();
                    MiniCart.MiniCart.updateMiniCart();
                },function(err){
                    console.log(err); 
                });
            }
        },    
        getScheduleInfo: function(form) {
            var obj = {};
            var isformValidated = true;
            var elements = form.find("input, select");
            elements.each(function(k, v) {
                var element = v;
                var name = v.name;
                var value = v.value;
                
                if (name && value) {
                    obj[name] = value;
                } else {
                    form.find('[name="' + name + '"]').css('border', '1px solid red');
                    form.find('[name="' + name + '"]').parent().append('<p style="color: red; font-size: smaller; float: left; margin: 0 0.2em;">This field can not be empty.</p>');
                    isformValidated = false;
                    return false;
                }
            });
            if (isformValidated){
                obj.endDate = null;
                return JSON.stringify(obj);
            }else{
                return false;
            }    
        },
        addSubscriptionToCart: function(subscriptionItems, schedule) {
            var me = this;
            var prodList = [],isColdPack=false;
            var coldPack = Hypr.getThemeSetting('codePack');
            subscriptionItems.forEach(function(item) {
                var product = {
                    productcode: item.productCode,
                    quantity: item.qty
                };
                prodList.push(product);
            });
            api.request('POST', 'svc/bulkadd', prodList).then(function(res){
                if(res.status == "success"){
                    $.cookie("isSubscriptionActive", true);
                    $.cookie("scheduleInfo", JSON.stringify(schedule));
                    me.redirectToCheckout();
                }else{
                    alert("Application timeout! Please reload the page and try again.");
                    $(".overlay-for-complete-page").removeClass("overlay-shown");
                    $(".main-content").removeClass("is-loading");
                } 
            }); 
        },
        createSubscription: function() {
            $(".overlay-for-complete-page").addClass("overlay-shown");
            $(".main-content").addClass("is-loading");
            var me = this;
            var cartModel = new CartModels.Cart();
            var currentCart = "";
            /*for non-subs products, check for cart and cookie. clear cart on user accept and add selected subscr items to cart. If subs products, then continue adding products to cart*/
            var schedule = me.getScheduleInfo(me.$el.find('.mz-subscription-interval-container>form'));
            if (schedule) {
                var subscriptionItems = this.model.get("items");
                cartModel.apiGet().then(function(i) {
                    currentCart = i.data.items;
                    if (currentCart.length > 0) {
                        // when items in cart
                        // check if items are non-subscription
                        if (typeof $.cookie("isSubscriptionActive") === "undefined") {
                            alertPopup.AlertView.fillmessage("first-dailog", "We can't mix Subscription and non-subscription items at this time. Do you want to Subscribe to everything you have in Cart?", function(userChoice) {
                                // when user doesn't want to subscribe for non-sub items in cart
                                if (!userChoice) {
                                    alertPopup.AlertView.fillmessage("second-dailog", "To create a Subscription, you must have only Subscription items in the Cart. Do you want to remove the non-subscription items from the Cart and proceed to checkout?", function(secondChoice) {
                                        // when user agress to remove non-sub items from cart
                                        if (secondChoice) {
                                            alertPopup.AlertView.closepopup();
                                            $(".overlay-for-complete-page").addClass("overlay-shown");
                                            $(".main-content").addClass("is-loading");

                                            // cartModel.apiEmpty();

                                            // me.addSubscriptionToCart(subscriptionItems, schedule);

                                            cartModel.apiEmpty().then(function(res) {
                                                me.addSubscriptionToCart(subscriptionItems, schedule);
                                            }, function(er) {
                                                console.log(er);
                                            });


                                        } else {
                                            // when user doesn't agree to remove non-sub items
                                            alertPopup.AlertView.fillmessage("third-dailog", "Proceeding will ignore your Subscription List and allow you to purchase your one-time order.", function(thirdChoice) {
                                                // proceed with one-time order
                                                if (thirdChoice) {
                                                    alertPopup.AlertView.closepopup();
                                                    $(".overlay-for-complete-page").addClass("overlay-shown");
                                                    $(".main-content").addClass("is-loading");
                                                    me.redirectToCheckout('onetimeOrder');
                                                } else {
                                                    // stay back on setup page
                                                    alertPopup.AlertView.closepopup();
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    alertPopup.AlertView.closepopup();
                                    $(".overlay-for-complete-page").addClass("overlay-shown");
                                    $(".main-content").addClass("is-loading");
                                    me.getFutureProduct(subscriptionItems, schedule,currentCart);
                                    //me.addSubscriptionToCart(subscriptionItems, schedule);
                                }
                            });
                        } else {
                            // alertPopup.AlertView.fillmessage("first-dailog", "You have already started building a Subscription. Do you want to add these products to that Subscription?", function(firstChoice) {
                            //     if (!firstChoice) {
                            //         alertPopup.AlertView.fillmessage("third-dailog", "Proceeding will ignore your previously-started Subscription and allow you to start a new Subscription.", function(secondChoice) {
                            //             if (secondChoice) {
                            //                 alertPopup.AlertView.closepopup();
                                            $(".overlay-for-complete-page").addClass("overlay-shown");
                                            $(".main-content").addClass("is-loading");

                                            cartModel.apiEmpty().then(function(res) {
                                                me.addSubscriptionToCart(subscriptionItems, schedule);
                                            }, function(er) {
                                                console.log(er);
                                            });

                                //         } else {
                                //             alertPopup.AlertView.closepopup();
                                //         }
                                //     });
                                // } else {
                                //     // alertPopup.AlertView.closepopup();
                                //     $(".overlay-for-complete-page").addClass("overlay-shown");
                                //     $(".main-content").addClass("is-loading");

                                //     me.addSubscriptionToCart(subscriptionItems, schedule);
                                // }

                            // });
                        }
                    } else {
                        // when no items in cart, add all selected and proceed to checkout
                        $(".overlay-for-complete-page").addClass("overlay-shown");
                        $(".main-content").addClass("is-loading");

                        me.addSubscriptionToCart(subscriptionItems, schedule);
                    }

                }, function(e) {
                    console.warn(e);
                });
            }

            $(".overlay-for-complete-page").removeClass("overlay-shown");
            $(".main-content").removeClass("is-loading");
        },
        getFutureProduct:function(subscriptionItems, schedule, currentCart){
            var items = currentCart.map(function(item){ return item.product.productCode; }),
            futureProduct=false,futureProductList=[],me=this;
            if(items.length>0){    
                api.request("post","/sfo/get_dates",{data: items}).then(function(r) {
                    var blackoutDates = [];
                    if(r.BlackoutDates.length > 0) {
                        blackoutDates = r.BlackoutDates.map(function(d) {
                            return me.formatDate(d);
                        });
                    }
                    $.each(r.Items,function(i,v){
                        if(me.getFutureDates(v.FirstShipDate,blackoutDates)){
                            futureProduct=true;
                            _.find(currentCart, function(property) {
                                if (property.product.productCode === v.SKU) {
                                    futureProductList.push(property);
                                }
                            });
                        }
                    });
                    if(futureProduct){
                        alertPopup.AlertView.fillmessage("fourth-dailog", "You cannot subscribe to Future-available products. Do you want us to remove those products from the cart?", function(userChoice) {
                            if (userChoice){
                                alertPopup.AlertView.closepopup();
                                $(".overlay-for-complete-page").addClass("overlay-shown");
                                $(".main-content").addClass("is-loading");
                                me.removeFutureProducts(futureProductList,subscriptionItems, schedule);
                                //me.addSubscriptionToCart(subscriptionItems, schedule);
                            }else{
                                alertPopup.AlertView.closepopup();
                                 $(".overlay-for-complete-page").removeClass("overlay-shown");
                                $(".main-content").removeClass("is-loading");
                            }
                        });
                    }else{
                        $(".overlay-for-complete-page").addClass("overlay-shown");
                        $(".main-content").addClass("is-loading");
                        me.addSubscriptionToCart(subscriptionItems, schedule);
                    }
                },function(er){
                    console.error(er);
                });
            }      
        },
        removeFutureProducts:function(futureProductList,subscriptionItems, schedule){
            var cartModel = new CartModels.Cart(),removed=0,me=this; 
            me.removeCartItems(futureProductList,removed,0,subscriptionItems,schedule); 
        },
        removeCartItems:function(futureProductList,removed,index,subscriptionItems,schedule){
            var me = this;
            if(futureProductList.length>removed){
                api.request('DELETE','api/commerce/carts/current/items/'+futureProductList[index].id).then(function(r){
                    removed++;
                    me.removeCartItems(futureProductList,removed,(index+1),subscriptionItems,schedule);
                },function(err){
                    console.log(err);
                });
            }else{
                me.addSubscriptionToCart(subscriptionItems, schedule);
            }
        },
        getFutureDates:function(FirstShipDate,blackoutDates){
            var udate =  new Date(FirstShipDate),
            date = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());     
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
            if(date > nextday) {
                return true;
            } else {
                return false;
            }
        },
        formatDate: function(date) {
            var udate = new Date(date),
                sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());     
            var startdate = ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
            return startdate;
        },
        redirectToCheckout: function(isOnetimeOrder) {
            var cartModel = new CartModels.Cart();
            var self = this;
            try {
                cartModel.apiGet().then(function(cart) {
                    console.info(cart.data);
                    cartModel.apiCheckout().then(function(cartId) {
                        
                        if (self.model.get("isEditSubscription")) {
                            var subscriptionId = window.location.hash.split('=')[1];
                        window.location.href = "/checkout/" + cartId.data.id + "?chktSub=true&edit=" + subscriptionId;
                            $.cookie("chktSub",'true',{path:'/'});
                            $.cookie("chktEdit",subscriptionId,{path:'/'});
                        } else if (isOnetimeOrder === "onetimeOrder") {
                            if (typeof $.cookie("isSubscriptionActive") != "undefined") {
                                $.cookie("isSubscriptionActive", '', {
                                    path: '/',
                                    expires: -1
                                });
                                $.cookie("scheduleInfo", '', {
                                    path: '/',
                                    expires: -1
                                });
                            }
                            window.location.href = "/checkout/" + cartId.data.id + "?chktSub=true&OnetimeOrder=yes";
                        } else
                            window.location.href = "/checkout/" + cartId.data.id + "?chktSub=true";
                        $(".overlay-for-complete-page").removeClass("overlay-shown");
                        $(".main-content").removeClass("is-loading");
                    }, function(err) {
                        console.warn(err);
                        // $(".subscribe-container").append('<p style="color:red; font-size: smaller">Somthing went wrong, try again later.</p>');
                        // setTimeout(function() {
                        //     $(".subscribe-container p").slideUp();
                        // }, 4000);
                        $(".overlay-for-complete-page").removeClass("overlay-shown");
                        $(".main-content").removeClass("is-loading");
                    });
                }, function(err) {
                    console.log("cart error" + err);
                });
            } catch (e) {
                console.warn(e);
            }
        },
        dateSelector: function() {
            var finaldate;
            var heat;
            var finalDate;
            var me = this;
            if (this.isHeatSensitive()) {
                finaldate = this.heatSensitvieDatePicker();
                finalDate = finaldate.replace(/-/g, '/');
                heat = true;
            } else {
                finaldate = this.datePicker();
                finalDate = finaldate.replace(/-/g, '/');
                heat = false;
            }

            // Date Picker 
            $('#interval-startdate').datepicker({
                beforeShowDay: heatSensitive,
                minDate: '0',
                maxDate: '+11m',
                dateFormat: "mm-dd-yy",
                autoclose:true,
                onSelect: function(dateText, inst) {
                    var date = $(this).datepicker('getDate'),
                        day = date.getDate(),
                        month = date.getMonth() + 1,
                        year = date.getFullYear();
                    var shipdate = ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2) + '-' + year;
                    // window.isPreviouslyStarted = false;
                    window.shipdate = shipdate;
                    $('#interval-startdate').datepicker("setDate", shipdate);
                    $('#interval-startdate').val(shipdate);
                    //$('.estimateddate').text(shipdate);  
                    //me.render(); 
                },
                beforeShow: function () { 
                    $(document).find('body').removeClass('smooth-scroll');
                    $(document).find('#ui-datepicker-div').show();
                },onClose:function(){
                    $(document).find('body').addClass('smooth-scroll');
                    $(document).find('#ui-datepicker-div').hide();
                }
            });

            //if (window.shipdate && !window.isPreviouslyStarted) {
            var selectedDate = window.shipdate;
            if (window.shipdate == finaldate) {
                if(this.isHeatSensitive()) {
                    var currentHeatDate = new Date(window.shipdate);
                    if( heatSensitive(currentHeatDate)[0] === true ) {
                        $('#interval-startdate').val(window.shipdate);
                    } else {
                        $('#interval-startdate').datepicker("setDate", finaldate);
                        $('#interval-startdate').val(finaldate);
                        window.shipdate = finaldate;
                    }
                } else {
                    $('#interval-startdate').datepicker("setDate", window.shipdate);
                    if(me.model.get("scheduleInfo")) {
                        $('#interval-startdate').val(me.model.get("scheduleInfo").startDate);
                    }
                }
            } else {
                $('#interval-startdate').datepicker("setDate", finaldate);
                $('#interval-startdate').val(finaldate);
            }

            function heatSensitive(date) {
                //var restDates = Hypr.getThemeSetting('shipping_date');
                //var blackoutdates = restDates.split(',');
                var blackoutdates = window.blockedShippingDates;
                var day;
                var m = date.getMonth();
                var d = date.getDate();
                var y = date.getFullYear();

                var dd = new Date();
                var mm = dd.getMonth();
                var ddd = dd.getDate();
                var yy = dd.getFullYear();

                var shipdate = new Date(finalDate);
                var currentDate = ('0' + (mm + 1)).slice(-2) + "/" + ('0' + ddd).slice(-2) + "/" + yy;
                var compareDate = ('0' + (m + 1)).slice(-2) + '/' + ('0' + d).slice(-2) + '/' + y;
                if (heat) {
                    if ($.inArray(compareDate, blackoutdates) != -1 || new Date() > date || shipdate > date) {
                       // console.log("blackoutdates --- ",$.inArray(compareDate, blackoutdates),compareDate);
                        return [false];
                    }
                    else{
                        day = date.getDay();
                        //console.log(" day ---",day);
                        if (day === 3 || day === 4 || day === 5 || day === 6 || day === 0) {
                            return [false];
                        } else {
                            return [true];
                        }
                    }   
                } else {
                    if ($.inArray(compareDate, blackoutdates) != -1 || new Date() > date || shipdate > date) {
                        return [false];
                    }
                    else{
                        day = date.getDay();
                        if (day === 6 || day === 0) {
                            return [false];
                        } else {
                            return [true];
                        }
                    }
                    
                }
            }
        },
        datePicker: function() {
            var date = new Date();
            var businessdays = 2;
            //var restDates = Hypr.getThemeSetting('shipping_date');
            //var blackoutdates = restDates.split(',');
            var blackoutdates = window.blockedShippingDates;
            console.log("blackoutdates ----",blackoutdates);
            var day, month, year, fulldate, currentDate, comparedate;
            while (businessdays) {
                date.setFullYear(date.getFullYear(), date.getMonth(), (date.getDate() + 1));
                day = date.getDay();
                month = date.getMonth();
                year = date.getFullYear();
                currentDate = date.getDate();
                fulldate = ('0' + (month + 1)).slice(-2) + '-' + ('0' + currentDate).slice(-2) + '-' + year;
                comparedate = ('0' + (month + 1)).slice(-2) + '/' + ('0' + currentDate).slice(-2) + '/' + year;


                if (day === 0 || day === 6 || blackoutdates.indexOf(comparedate) !== -1 || new Date() > comparedate) {
                    date.setFullYear(year, month, currentDate);
                } else {
                    businessdays--;
                }
            }
            date.setFullYear(year, month, (date.getDate()));
            var finaldate = ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + '-' + date.getFullYear();
            $('.earliest-date span').text(finaldate);
            //$('#interval-startdate').datepicker("setDate",final);
            return finaldate;
        },
        heatSensitvieDatePicker: function() {
            var date = new Date();
            var businessdays = 2;
            //var restDates = Hypr.getThemeSetting('shipping_date');
            //var blackoutdates = restDates.split(',');
            var blackoutdates = window.blockedShippingDates;
            var day, month, year, currentDate, comparedate;
            while (businessdays) {
                date.setFullYear(date.getFullYear(), date.getMonth(), (date.getDate() + 1));
                day = date.getDay();
                month = date.getMonth();
                year = date.getFullYear();
                currentDate = date.getDate();
                // fulldate= ('0'+(month+1)).slice(-2)+ '-' + ('0'+currentDate).slice(-2) + '-' + year;
                comparedate = ('0' + (month + 1)).slice(-2) + '/' + ('0' + currentDate).slice(-2) + '/' + year;

                if (day === 0 || day === 6 || day === 3 || day === 4 || day === 5 || blackoutdates.indexOf(comparedate) !== -1) {
                    date.setFullYear(year, month, (currentDate));
                } else {
                    businessdays--;
                }
            }
            date.setFullYear(year, month, (currentDate));
            var finaldate = ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2) + '-' + date.getFullYear();
            $('.earliest-date span').text(finaldate);
            return finaldate;
        },
        isHeatSensitive: function() {
            if (Hypr.getThemeSetting('heatsensitive')) {
                var items = (typeof window.assortSummary.model.get('items') == "undefined") ? 0 : window.assortSummary.model.get('items');
                var heatCount = 0;
                for (var i = 0; i < items.length; i++) {
                    if (items[i].isColdPack) {
                        heatCount++;
                    }
                }
                if (heatCount > 0) {
                    return true;
                } else return false;

            } else {
                return false;
            }
        },
        getBlockOutDates :function(){
            var items = [];
            var _this = this;
            $.each($('[data-mz-productcode]'),function(i,v){
                if(items.length> 0 && items.indexOf($(v).attr('data-mz-productcode'))<0){
                    items.push($(v).attr('data-mz-productcode'));
                }else if(items.length<1){
                    items.push($(v).attr('data-mz-productcode'));
                }
            });
            var apiResult = {dates:[],isSuccess:false,blockoutDates:[]};
            api.request("post","/sfo/get_dates",{data:items}).then(function(result){
                console.log( " result ---",result);
                var formatedDates = window.formatApiData(result);
                window.blockedShippingDates = formatedDates;
                window.getDatesItems = result.Items;
                _this.dateSelector();
                window.getDates();
                return (apiResult);
            },function(er){
                console.log("error ---",er);
             return (apiResult);
            });
        },
        initialize: function () {
           console.log(" alter changes");
           this.getBlockOutDates();
        },
        render: function() {
            var scheduleInfoForm = this.$el.find('.mz-subscription-interval-container>form'),
                formInfo = "";
            if(!scheduleInfoForm.find('input, select').is(':disabled')) {
                formInfo = JSON.parse(this.getScheduleInfo(scheduleInfoForm,'setInfo'));
            }
            Backbone.MozuView.prototype.render.call(this);
            //$("#interval-startdate").datepicker();
            $.each($(".mz-sumamry-table").find("tbody td.desc"), function(){
                $(this).html($(this).text());
            });
            if(formInfo) {
                scheduleInfoForm = $(document).find('.mz-subscription-interval-container>form');
                
                if(this.model.get("isEditSubscription") &&  window.formRenderFlag ) {
                    var editScheduleInfo = this.model.get("scheduleInfo");
                         window.formRenderFlag  = ! window.formRenderFlag ;
                        scheduleInfoForm.find('[name="frequency"]').find('option[value="'+editScheduleInfo.frequency+'"]').attr("selected",true);
                        scheduleInfoForm.find('[name="frequencyType"]').find('option[value="'+editScheduleInfo.frequencyType+'"]').attr("selected",true);
                        scheduleInfoForm.find('[name="endType"]').find('option[value="'+editScheduleInfo.endType+'"]').attr("selected",true);
                } else {
                    scheduleInfoForm.find('[name="frequency"]').find('option[value="'+formInfo.frequency+'"]').attr("selected",true);
                    scheduleInfoForm.find('[name="frequencyType"]').find('option[value="'+formInfo.frequencyType+'"]').attr("selected",true);
                    scheduleInfoForm.find('[name="endType"]').find('option[value="'+formInfo.endType+'"]').attr("selected",true);
                }
            } 
            /*else if(this.model.get("isEditSubscription")) {
                scheduleInfoForm = $(document).find('.mz-subscription-interval-container>form');
                scheduleInfoForm.find('[name="frequency"]').find('option[value="'+formInfo.frequency+'"]').attr("selected",true);
                scheduleInfoForm.find('[name="frequencyType"]').find('option[value="'+formInfo.frequencyType+'"]').attr("selected",true);
                scheduleInfoForm.find('[name="endDate"]').find('option[value="'+formInfo.endDate+'"]').attr("selected",true);
            }*/
            if(window.blockedShippingDates && window.blockedShippingDates.length>0)
                 this.dateSelector();
           
        }
    });

    // Data object
    var dataModel = {
        author: "Echidna"
    };
    var AssortModel = Backbone.MozuModel.extend({});
    var assortSummary = new AssortSummary({
        el: $(".mz-assortment-summary"),
        model: new AssortModel(dataModel)
    });
    window.assortSummary = assortSummary;
    assortSummary.render();

    
    var count = 0, cartItems = [];
    function getCartItemsforSubsOrder(currentCart, locationCodes) {
        if(window.location.hash.length === 0 || window.location.search.length === 0) {
            if(typeof $.cookie("isSubscriptionActive") != "undefined") {
                if(count <= currentCart.length - 1) {
                    var prdCode = currentCart[count].product.productCode,
                        prdName = currentCart[count].product.name,
                        prdQty = currentCart[count].quantity,
                        prdTotal = currentCart[count].subtotal,
                        prdPrice = currentCart[count].product.price.salePrice,
                        prdStock = 0,
                        prdIsCold = _.findWhere(currentCart[count].product.properties, {attributeFQN: "tenant~IsHeatSensitive"}).values[0].value;
                            
                    api.request("get", "api/commerce/catalog/storefront/products/" + prdCode + "/locationinventory?locationCodes=" + locationCodes).then(function(ress) {
                        prdStock = ress.items[0].stockAvailable;

                        var qObj = {
                            "productCode": prdCode,
                            "productName": prdName,
                            "price": prdPrice,
                            "isColdPack": prdIsCold,
                            "qty": prdQty,
                            "productstock": prdStock,
                            "itemTotal": prdTotal
                        };
                        cartItems.push(qObj);
                        count++;
                        getCartItemsforSubsOrder(currentCart, locationCodes);
                    });

                } else {
                    window.assortSummary.model.set("items", cartItems);
                    //window.assortSummary.model.set("isEditSubscription", true);
                        if(typeof $.cookie("scheduleInfo") != "undefined") {
                            var schedule = JSON.parse(JSON.parse(($.cookie("scheduleInfo"))));
                            window.assortSummary.model.set("scheduleInfo", schedule);
                            $('#interval-startdate').val(JSON.parse(window.assortSummary.getScheduleInfo($('.mz-assortment-summary form'))).startDate);
                        }
                    window.assortment.generateTotal(window.assortSummary.model.get("items"));

                    $(".overlay-for-complete-page").removeClass("overlay-shown");
                    $(".main-content").removeClass("is-loading");
                    window.assortSummary.render();
                }
               
            }
        }
        else {
            console.info("hmm, well, you must be editing");
        }
    }


    $(document).ready(function() {
        //display instructions modal
        if(typeof ($.cookie('instructions-popup'))=="undefined"){
            $(document).find('.instructions-popup').show();
        }
        if (navigator.appVersion.indexOf("Chrome/") != -1) {
        // modify button 
            $(document).find('body').addClass("is-chrome");
        } else if(navigator.userAgent.indexOf("Trident/") > -1) {
            $(document).find('body').addClass("is-ie");
        } else {
            $(document).find('body').addClass("is-firefox");
        }
        /*Detect IE browser and add js Array.find*/
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) || navigator.userAgent.indexOf("Trident/") > -1) {
            if (!Array.prototype.find) {
                Object.defineProperty(Array.prototype, 'find', {
                    value: function(predicate) {
                        if (this === null) {
                            throw new TypeError('"this" is null or not defined');
                        }

                        var o = Object(this);

                        var len = o.length >>> 0;

                        if (typeof predicate !== 'function') {
                            throw new TypeError('predicate must be a function');
                        }

                        var thisArg = arguments[1];
                        var k = 0;

                        while (k < len) {
                            var kValue = o[k];
                            if (predicate.call(thisArg, kValue, k, o)) {
                                return kValue;
                            }
                            k++;
                        }
                        return undefined;
                    },
                    configurable: true,
                    writable: true
                });
            }
        }

        /* identifies subscription order items from cart and prefills the subs model */
        CartModels.Cart.fromCurrent().apiGet().then(function(d) {
            if(d.data.items.length > 0) {
                var locationCodes = "";
                if (window.location.host.indexOf("s16708") > -1 || window.location.host.indexOf("east.jellybellyretailer.com") > -1) {
                    locationCodes = "MDC";
                } else if (window.location.host.indexOf("s21410") > -1 || window.location.host.indexOf("west.jellybellyretailer.com") > -1) {
                    locationCodes = "FDC";
                }
                getCartItemsforSubsOrder(d.data.items,locationCodes);
            }
        });

        var query = "",
            editSub = "";
        /* creates Model object for order summary if url type is search pattern or
           back to subscr setup page from checkout!!!
           (params): api response, optional url type
         */
        function buildModelObjectOnUrlType(data, type) {
            var items = [];
            if(data) {
                var prdcode = data.get('productCode'),
                    prdName = data.get('content.productName'),
                    prdPrice = data.get('price.salePrice'),
                    prdIsCold = false,
                    prdQty = 1,
                    prdStock = data.get('inventoryInfo').onlineStockAvailable,
                    prdTotal = prdPrice;
                    prdIsCold = isHeatSensitiveProperty(data.get('properties'));
                var qObj = {
                    "productCode": prdcode,
                    "productName": prdName,
                    "price": prdPrice,
                    "isColdPack": prdIsCold,
                    "qty": prdQty,
                    "productstock": prdStock,
                    "itemTotal": prdTotal
                };
                items.push(qObj);
                window.assortSummary.model.set("items", items);
                window.assortment.generateTotal(window.assortSummary.model.get("items"));
            }
            
        }

        function isHeatSensitiveProperty(properties) {
            properties.find(function(k) {
                if(k.attributeFQN === "tenant~IsHeatSensitive") {
                    return k.values[0].value;
                    //return true;
                }
            });
            return false;
        }

        window.getDates = function(){
            var blackoutDates =  window.blockedShippingDates;
            var Items = window.getDatesItems;
            console.log("items ---",Items);
            if(Items && Items.length>0){
                var len = Items.length,i=0;
                for(i;i<len;i++){
                    productDisplay(Items[i].FirstShipDate,blackoutDates,Items[i].SKU);
                } 
            }
           
        };
        function productDisplay(firstDate,blackoutDates,pcode){
            var udate =  new Date(firstDate),
                date = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());     
            var m = date.getMonth(),
                d = date.getDate(),
                y = date.getFullYear(),
                startdate = ('0'+(m+1)).slice(-2)+ '/' + ('0'+d).slice(-2) + '/' + y;
            
            var nextday = new Date(),businessdays=2,day,month,year,currentDate,comparedate;
                while(businessdays){
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
            if(date > nextday) {
                $('[data-mz-productcode='+pcode+']').find('.assort-error').text(Hypr.getLabel('futureProductSubscription'));
                $('[data-mz-productcode='+pcode+']').find('.magic-checkbox').attr('disabled','disabled');
                $('[data-mz-productcode='+pcode+']').find('.qnty select').attr('disabled','disabled');
            }
          
        }
        function formatDate(date) {
            var udate = new Date(date),
                sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());     
            var startdate = ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
            return startdate;
        }
        // check if url pattern has search product    
        if (window.location.search.length > 0) {
            query = (typeof window.location.search.split("=")[1] == "undefined") ? " " : window.location.search.split("=")[1];
        }
        // check for single product to add
        if (query.length > 1) {
            
            // search for product
            try {
                api.get('product', query).then(function(sdkProduct) {
                    var PRODUCT = new ProductModels.Product(sdkProduct.data);
                    
                    buildModelObjectOnUrlType(PRODUCT);
                    window.assortSummary.render();
                });
            } catch (e) {
                console.warn(e);
            }
        }


        // recursive function to loop through each prodObject and build model array from the entity data.
        var counter = 0;
        var items = [];

        function makeSubscriptionObjectforEdit(currentSubsItem, locationCodes, schedule) {
            if (counter <= currentSubsItem.length - 1) {
                var prdcode = currentSubsItem[counter].product.productCode,
                    prdName = currentSubsItem[counter].product.name,
                    prdPrice = currentSubsItem[counter].product.price.salePrice,
                    prdIsCold = false,
                    prdQty = currentSubsItem[counter].quantity,
                    prdTotal = currentSubsItem[counter].total,
                    prdStock = "";
                    currentSubsItem[counter].product.properties.filter(function(a){
                        if(a.attributeFQN == "tenant~IsHeatSensitive"){
                            prdIsCold = a.values[0].value;
                        }
                    });

                // get inventory info for the given productCode
                api.request("get", "api/commerce/catalog/storefront/products/" + prdcode + "/locationinventory?locationCodes=" + locationCodes).then(function(ress) {
                    prdStock = ress.items[0].stockAvailable;

                    var qObj = {
                        "productCode": prdcode,
                        "productName": prdName,
                        "price": prdPrice,
                        "isColdPack": prdIsCold,
                        "qty": prdQty,
                        "productstock": prdStock,
                        "itemTotal": prdTotal
                    };
                    items.push(qObj);
                    
                    counter++;
                    makeSubscriptionObjectforEdit(currentSubsItem, locationCodes, schedule);
                });
            } else {
                window.assortSummary.model.set("items", items);
                window.assortSummary.model.set("isEditSubscription", true);
                window.assortSummary.model.set("scheduleInfo", schedule);
                window.assortment.generateTotal(window.assortSummary.model.get("items"));

                $(".overlay-for-complete-page").removeClass("overlay-shown");
                $(".main-content").removeClass("is-loading");
                /* rendering explictly ro solve display issues.[ Need to monitor side-effects ] */
                window.assortSummary.render();
                $("#interval-startdate").val(assortSummary.model.get("scheduleInfo").startDate);
            }
        }

        // Check if the url pattern has edit subscription
        if (window.location.hash.indexOf("edit") > -1) {
            $(".overlay-for-complete-page").addClass("overlay-shown");
            $(".main-content").addClass("is-loading");
            editSub = window.location.hash.split('=')[1];
            var customerId = require.mozuData("user").userId,
                currentSubsItem = null, 
                formRenderFlag = window.formRenderFlag = true; // flag to handle form update
            // retrieve data from entity    
            try {
                api.request('POST', 'svc/getSubscription',{method:"GET",subscriptionId:editSub}).then(function(res) { 
               // api.request('GET', '/api/platform/entitylists/createsubscription@jbellyretailer/entities?filter=customerId eq ' + customerId).then(function(res) {
                   
                    if (!res.error &&  res.res.subscriptionId !== undefined) {
                        currentSubsItem = res.res;
                        var date  = new Date(currentSubsItem.schedule.startDate),
                            startDate = new Date((date.getUTCMonth()+1)+'/'+date.getUTCDate()+'/'+date.getUTCFullYear()),
                            fdate = ('0'+(startDate.getMonth()+1)).slice(-2)+ '-' + ('0'+startDate.getDate()).slice(-2) + '-' + startDate.getFullYear();
                            currentSubsItem.schedule.startDate = fdate;
                    }

                    var locationCodes = "";
                    if (window.location.host.indexOf("s16708") > -1 || window.location.host.indexOf("east.jellybellyretailer.com") > -1) {
                        locationCodes = "MDC";
                    } else if (window.location.host.indexOf("s21410") > -1 || window.location.host.indexOf("west.jellybellyretailer.com") > -1) {
                        locationCodes = "FDC";
                    }

                    makeSubscriptionObjectforEdit(currentSubsItem.order.items, locationCodes, currentSubsItem.schedule);

                }, function(err) {
                    console.log("get error " + err);
                });
            } catch (e) {
                console.error(e);
                $(".overlay-for-complete-page").removeClass("overlay-shown");
                $(".main-content").removeClass("is-loading");
            }
        }

        // Check if page redirected from checkout
        if(window.location.search.split("?")[1] == "returnUrl") {
            console.info("returned from checkout");
        }

        var assortment = window.assortment = new Assortment();
        $(".accordion").on('click', assortment.toggleAccordian);
        $(document).on('click', 'input[type="checkbox"].body-item', function(event){
         assortment.selectLineItem($(event));   
        });
        $(document).find('.assort-table thead').find('input[type="checkbox"]').on('click', assortment.toggleSelectAllItems);
        $(document).on('click', 'input[type="checkbox"]', assortment.toggleAddtoListBtn);
        $(document).on('click', 'button.addToList', assortment.addToList);
        $(document).on('click', '.mz-notify-popup .mz-btn-accept', assortment.notify);
        $(document).on('click touchstart', 'span.notify', assortment.showNotifyDialog);
        $(document).on('click', '.mz-notify-popup .mz-close', assortment.hideNotifyDialog);

        // miscellenious adjustments
        $(".hasDatepicker").blur(function(e) { $(this).datepicker("hide"); });
        
        //restricting user to go away from subscription page before creating the subscrption list
        // $(document).find('.jb-column-mainlist a, .jb-footer-evrgreen a, .rapid-button a, .mz-storebranding a, .mz-utilitynav-link, .mz-utilitynav-link-cart, .megamenu a').on('click',function(e){
        //     if(typeof $.cookie("isSubscriptionActive") === "undefined"){
        //       return false;
        //     }
        // });
       /* $('.jb-footer-evrgreen').find('a')
        $('.megamenu')
        $('.mz-utilitynav-link-cart')
        $('.rapid-button').find('a')
        $('.mz-storebranding').find('a')*/
        //instruction Close
        $(document).on('click','.got-it,.close-popup',function(){
            $(document).find('.instructions-popup').hide();
            $.cookie('instructions-popup',true,{expires:1});
        });
    }); // End of ready

    $(window).on('load', function() {
        setTimeout(function(){
            if(typeof $.cookie("scheduleInfo") != "undefined") {
                var prevDate = JSON.parse(JSON.parse($.cookie("scheduleInfo"))).startDate;
                window.shipdate = prevDate;
                $("#interval-startdate").val(prevDate);
            }
        },2000);
    });

    return {
        assortmentView: assortSummary
    };

});


