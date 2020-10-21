require([
    "modules/jquery-mozu",
    "underscore",
    "hyprlive",
    "modules/backbone-mozu",
    "modules/api",
    "pages/subscription",
    "modules/alert-popup",
    "shim!vendor/owl.carousel[jquery=jQuery]>jQuery"
], function($, _, Hypr, Backbone, Api, assortmentView,alertPopup) {


    $(document).ready(function() {
        /*Detect IE browser and add js Array.find*/
        if (/MSIE (\d+\.\d+);/.test(navigator.userAgent) || navigator.userAgent.indexOf("Trident/") > -1) {
            console.log("IE detected");
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

        function removeSearchResults(options) {
            if ($(".mz-assortment-search-result").html().length > 0) {
				$(".mz-assortment-search-result").hide();
                //$(".mz-assortment-search-result").slideUp("slow");
                $(".mz-assortment-search-result").html("");
                $(".mz-assortment-search-result-container").removeClass("result");
                if (options && options.showTerm)
                    console.log(options);
                else
                    $("input#assortment-search").val("");
            }
        }

        /* Add searched item to list*/
        function addSearchedItem() {
            $(".overlay-for-complete-page").addClass("overlay-shown");
            $(".main-content").addClass("is-loading");
            var items = (typeof window.assortSummary.model.get("items") == "undefined") ? [] : window.assortSummary.model.get("items");
            var $lineItem = $(this).parents(".mz-searchresult-selection");
            var prdCode = $lineItem.data("prdt-code"),singleItem,
                prdQty = parseInt($lineItem.find('select').val(), 10),
                prdName = $lineItem.find('td.desc>span.item-name').text(),
                isColdPack = $lineItem.data('iscoldpack'),
                //isHeatsensitive = $lineItem.data('isheatsensitive'),
                prdStock = $lineItem.data('stock'),
                prdPrice = $lineItem.data('price'),
                prdTotal = (prdQty * prdPrice);

             var prod = _.findWhere(items, {productCode: prdCode.toString()});
                if(prod){
                    if((prdQty+parseInt(prod.qty,10))<=prod.productstock){
                        singleItem = {
                            "productCode": prdCode.toString(),
                            "productName": prdName,
                            "price": prdPrice,
                            "isColdPack": isColdPack,
                            //"isHeatsensitive": isHeatsensitive,
                            "qty": prdQty,
                            "productstock": prdStock,
                            "itemTotal": prdTotal
                        };
                        if (items.length > 0) {
                            checkforExistingItemsinList(items, singleItem);
                            console.log(items);
                        } else {
                            items.push(singleItem);
                        }
                        window.assortSummary.model.set("items", items);
                        generateTotal(items);
                        setTimeout(function() {
                            $(".overlay-for-complete-page").removeClass("overlay-shown");
                            $(".main-content").removeClass("is-loading");
                            if($(window).width() < 768) {
                                $('html, body').animate({
                                    scrollTop: $(".mz-assortment-summary-container").offset().top
                                }, 500);
                            }
                        }, 1000);
                        window.assortSummary.render();
                    }else{
                        alertPopup.AlertView.fillmessage("future-dailog", "Few of your products inventory is less than selected quantity. So those products are not added to subscription list.", function(userChoice) {
                            if (!userChoice) {
                                alertPopup.AlertView.closepopup();
                            } else {
                                alertPopup.AlertView.closepopup();
                            }
                            $(".overlay-for-complete-page").removeClass("overlay-shown");
                            $(".main-content").removeClass("is-loading");
                        });
                    }    
                }else{
                    singleItem = {
                        "productCode": prdCode.toString(),
                        "productName": prdName,
                        "price": prdPrice,
                        "isColdPack": isColdPack,
                        //"isHeatsensitive": isHeatsensitive,
                        "qty": prdQty,
                        "productstock": prdStock,
                        "itemTotal": prdTotal
                    };
                    if (items.length > 0) {
                        checkforExistingItemsinList(items, singleItem);
                        console.log(items);
                    } else {
                        items.push(singleItem);
                    }
                    window.assortSummary.model.set("items", items);
                    generateTotal(items);
                    setTimeout(function() {
                        $(".overlay-for-complete-page").removeClass("overlay-shown");
                        $(".main-content").removeClass("is-loading");
                        if($(window).width() < 768) {
                            $('html, body').animate({
                                scrollTop: $(".mz-assortment-summary-container").offset().top
                            }, 500);
                        }
                    }, 1000);
                    window.assortSummary.render();
                }
            }    

        // **TODO**
        function checkforExistingItemsinList(modelItems, listItem) {
            var flag = true;
            modelItems.find(function(ele) {

                if (listItem.productCode == ele.productCode) {
					ele.qty = parseInt(ele.qty, 10) + parseInt(listItem.qty, 10);
                    ele.itemTotal = (Math.round(ele.price * ele.qty * 100) / 100);
                    flag = false;
                }
            });
            if (flag) {
                modelItems.push(listItem);
            }
        }

        function generateTotal(modelItems) {
            var total = 0;
            if (modelItems.length > 0) {
                $.each(modelItems, function() {
                    total += this.itemTotal;
                });
            }
            window.assortSummary.model.set("total", total);
        }

        function productDisplay(firstDate,blackoutDates,pcode,b){
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
                return false;
            }else{
                return true;
            }
        }
        function formatDate(date) {
            var udate = new Date(date),
                sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());     
            var startdate = ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
            return startdate;
        }
        function suggestionListFn(b,term){
            var suggestionList = "",
                prdCode = "",
                prdName = "",
                price = 0,
                isColdPack = "false",
                //isHeatsensitive = "false",
                stock = 0;
            if (b.length > 0) {
                b.forEach(function(productInfo) {
                    //if(!productInfo.isFutureProduct){
                        prdCode = productInfo.productCode;
                        prdName = productInfo.productName;
                        price = parseFloat(productInfo.price.salePrice) && parseFloat(productInfo.price.price)>parseFloat(productInfo.price.salePrice)?parseFloat(productInfo.price.salePrice):parseFloat(productInfo.price.price);
                        stock = productInfo.inventoryInfo.manageStock?productInfo.inventoryInfo.onlineStockAvailable:50;
                        isColdPack = productInfo.isheatsensitive?true:false;
                        suggestionList += '<li class="mz-prodname" tabindex="0" data-prdt-code="' + prdCode + '" data-price="' + price + '" data-available-stock="' + stock + '" data-iscoldpack="' + isColdPack + '"data-futureproduct="'+productInfo.isFutureProduct+'">' + prdName + '</li>';
                    //}
                });
                if(suggestionList.length<1){
                    suggestionList = '<li class="no-search-result">Sorry no products found with the keyword "' + term + '"</li>';
                    removeSearchResults();
                }
                removeSearchResults({
                    showTerm: true
                });
            } else {
                suggestionList = '<li class="no-search-result">Sorry no products found with the keyword "' + term + '"</li>';
                removeSearchResults();
            }
            // productslist.items.length=0;    
            // for(var k=0;k<b.length;k++){

            //     productslist.items.push(b[k]);
            // }
            $(".mz-assortment-search-result-container").addClass("result");
            $(".mz-assortment-search-result").append(suggestionList);
			$(".mz-assortment-search-result").show();
            //$(".mz-assortment-search-result").slideDown('slow');
        }    


        var searchItemsFn = _.debounce(function(term) {
            Api.request('POST','svc/rofSearch',{"query":term}).then(function(response){
                console.log(response);
                var b = response.items;
                suggestionListFn(b,term);
                // var facetingModel = new FacetingModels.FacetedProductCollection(productslist);
                // var productRecentView = new ProductRecentView({
                //     el:$('#recent'),
                //     model:facetingModel
                // });
                //     window.productRecentView = productRecentView;
                //     productRecentView.render();
            });
        }, 200);

        /* Search for items based on prd-name/code and update */
        $("#assortment-search").on("keyup", function(e) {
            // if(e.keyCode == 32) {
            var term = $(this).val();
            if (term.length > 2) {
                searchItemsFn(term);
            } else {
                removeSearchResults();
            }
        });

        /* hide results on input-blur */
        $("#assortment-search").on('blur', function(e) {
            if ($(e.currentTarget).parents(".mz-assortment-search-container").is(':not(div.mz-assortment-search-container)')) {
                removeSearchResults();
            }
        });

        /* on selection of search result, update DOM with details */
        $(document).find(".mz-assortment-search-result").on("click", "li.mz-prodname", function() {
            var productTable = "",options ='';
            var prdName = $(this).text(),
                prdCode = $(this).data("prdt-code"),
                price = parseFloat($(this).data("price")).toFixed(2),
                isColdPack = $(this).data("iscoldpack"),
                //isHeatsensitive = $(this).data("isheatsensitive"),
                stock = $(this).data("available-stock"),
                future = $(this).data("futureproduct");
    
            if(stock>1 && !future){
                for(var i=0;i<stock;i++){
                    if(options===''){
                        options = '<option value="1" selected>1</option>';
                    }else{
                        options += '<option value="'+(i+1)+'">'+(i+1)+'</option>';
                    } 
                    i = i>=49?stock:i;    
                }
            }     
            if ($(".mz-searchresult-selection").length > 0) { 
                $(".mz-searchresult-selection").remove();
            }
            if($(window).width() > 767) {  
               
                productTable += '<div class="mz-searchresult-selection" data-prdt-code="' + prdCode + '" data-price="' + price + '" data-iscoldpack="' + isColdPack + '" data-stock="' + stock + '"><table class="desktop" data><thead><th class="item">Item #</th><th class="desc">Description</th><th class="price">Price</th><th class="coldpack">Cold pack</th><th class="qnty">Order Qty</th></thead><tbody><tr><td class="item" data-prdt-code="' + prdCode + '">' + prdCode + '</td><td class="desc"><span class="item-name">' + prdName;
                if(stock>0 && future){
                    productTable += '</span><br/><span style="color: red;font-size:12px;">'+Hypr.getLabel('futureProductSubscription')+'</span></td><td class="price">$' + price + '</td><td class="coldpack">';
                    if (isColdPack) {
                        productTable += '&#x2714;</td><td class="qnty"><select class="mz-suggestion-qty" disabled><option value="1" selected>1</option></select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList" disabled>Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    } else {
                        productTable += '</td><td class="qnty"><select class="mz-suggestion-qty" disabled><option value="1" selected>1</option></select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList" disabled>Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    }
                }
                else if (stock < 1) {
                    productTable += '</span><br/><span style="color: red;font-size:12px;">Item out of stock.</span></td><td class="price">$' + price + '</td><td class="coldpack">';
                    if (isColdPack) {
                        productTable += '&#x2714;</td><td class="qnty"><select class="mz-suggestion-qty" disabled><option value="1" selected>1</option></select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList" disabled>Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    } else {
                        productTable += '</td><td class="qnty"><select class="mz-suggestion-qty" disabled><option value="1" selected>1</option></select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList" disabled>Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    }
                } else if (stock == 1) {
                    productTable += '</span><br/><span style="color: red;font-size:12px;">Only 1 in stock.</span></td><td class="price">$' + price + '</td><td class="coldpack">';
                    if (isColdPack) {
                        productTable += '&#x2714;</td><td class="qnty"><select class="mz-suggestion-qty"><option value="1" selected>1</option></select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList">Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    } else {
                        productTable += '</td><td class="qnty"><select class="mz-suggestion-qty"><option value="1" selected>1</option></select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList">Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    }
                } else if (stock > 1) {
                    productTable += '</span></td><td class="price">$' + price + '</td><td class="coldpack">';
                    if (isColdPack) {
                        productTable += '&#x2714;</td><td class="qnty"><select class="mz-suggestion-qty">'+options+'</select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList">Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    } else {
                        productTable += '</td><td class="qnty"><select class="mz-suggestion-qty">'+options+'</select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList">Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    }
                }
            } else {
                productTable += '<div class="mz-searchresult-selection" data-prdt-code="' + prdCode + '" data-price="' + price + '" data-iscoldpack="' + isColdPack + '" data-stock="' + stock + '"><table class="mobile" data><tbody><tr class="row row1"><td class="item">Item #</td><td class="item-content" data-prdt-code="' + prdCode + '">' + prdCode + '</td></tr><tr class="row row2"><td class="item">Description</td><td class="item-content desc"><span class="item-name">' + prdName;
                 if(stock>0 && future){
                    productTable += '</span><br/><span style="color: red;font-size:12px;">'+Hypr.getLabel('futureProductSubscription')+'</span></td></tr><tr class="row row3"><td class="item">Price</td><td class="item-content price">$' + price + '</td></tr><tr class="row row4"><td class="item">Cold Pack</td><td class="item-content coldpack">';
                    if (isColdPack) {
                        productTable += '&#x2714;</td></tr><tr class="row row5"><td class="item">Order Qty</td><td class="item-content qnty"><select class="mz-suggestion-qty" disabled><option value="1" selected>1</option></select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList" disabled>Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    } else {
                        productTable += '-</td></tr><tr class="row row5"><td class="item">Order Qty</td><td class="item-content qnty"><select class="mz-suggestion-qty" disabled><option value="1" selected>1</option></select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList" disabled>Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    }
                }
                else if (stock < 1) {
                    productTable += '</span><br/><span style="color: red;font-size:12px;">Item out of stock.</span></td></tr><tr class="row row3"><td class="item">Price</td><td class="item-content price">$' + price + '</td></tr><tr class="row row4"><td class="item">Cold Pack</td><td class="item-content coldpack">';
                    if (isColdPack) {
                        productTable += '&#x2714;</td></tr><tr class="row row5"><td class="item">Order Qty</td><td class="item-content qnty"><select class="mz-suggestion-qty" disabled><option value="1" selected>1</option></select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList" disabled>Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    } else {
                        productTable += '-</td></tr><tr class="row row5"><td class="item">Order Qty</td><td class="item-content qnty"><select class="mz-suggestion-qty" disabled><option value="1" selected>1</option></select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList" disabled>Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    }
                } else if (stock == 1) {
                    productTable += '</span><br/><span style="color: red;font-size:12px;">Only 1 in stock.</span></td></tr><tr class="row row3"><td class="item">Price</td><td class="item-content price">$' + price + '</td></tr><tr class="row row4"><td class="item">Cold Pack</td><td class="item-content coldpack">';
                    if (isColdPack) {
                        productTable += '&#x2714;</td></tr><tr class="row row5"><td class="item">Order Qty</td><td class="item-content qnty"><select class="mz-suggestion-qty"><option value="1" selected>1</option></select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList">Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    } else {
                        productTable += '-</td><tr class="row row5"><td class="item">Order Qty</td><td class="item-content qnty"><select class="mz-suggestion-qty"><option value="1" selected>1</option></select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList">Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    }
                } else if (stock > 1) {
                    productTable += '</span></td><tr class="row row3"><td class="item">Price</td><td class="item-content price">$' + price + '</td></tr><tr class="row row4"><td class="item">Cold Pack</td><td class="item-content coldpack">';
                    if (isColdPack) {
                        productTable += '&#x2714;</td></tr><tr class="row row5"><td class="item">Order Qty</td><td class="item-content qnty"><select class="mz-suggestion-qty">'+options+'</select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList">Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    } else {
                        productTable += '-</td></tr><tr class="row row5"><td class="item">Order Qty</td><td class="item-content qnty"><select class="mz-suggestion-qty">'+options+'</select></td></tr></tbody></table><div class="action-btns"><button class="mz-btn-remove">Remove</button><button class="mz-btn-addToList">Add To Subscription</button><div class="clear-fix"></div></div></div>';
                    }
                }
            }



            $('.mz-search-area').append(productTable);
            removeSearchResults();
        });

        $(document).on('click', '.mz-btn-remove', function() {
            $(this).parents(".mz-searchresult-selection").remove();
        });

        $(document).on('click', '.mz-btn-addToList', addSearchedItem);

        $(document).on("click", "body", function(e) {
            if (!(($(e.target).is('li.mz-prodname')) || ($(e.target).is('input#assortment-search')))) {
                removeSearchResults();
            }
        });

    });
});

