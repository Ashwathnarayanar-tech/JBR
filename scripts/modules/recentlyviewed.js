define(['modules/backbone-mozu','hyprlive',"modules/api", 'underscore', 
        'modules/jquery-mozu','modules/models-product', 
        "modules/models-faceting", 'modules/cart-monitor','modules/minicart'],
        function(Backbone, Hypr, Api, _,$, ProductModels, FacetingModels,CartMonitor,MiniCart){
        
        var ProductRecentView = Backbone.MozuView.extend({
                templateName: 'modules/product/product-recently-viewed',
                    render: function(){
                        Backbone.MozuView.prototype.render.apply(this);
                        // $('.recentlyviewed .mz-l-carousel').owlCarousel({
                        //     items : 4,
                        //     scrollPerPage : true,
                        //     itemsCustom:      [[0, 1], [480,2], [700, 2], [1000, 3],[1025,4]],
                        //     navigation:       true,
                        //     rewindNav: false
                        // });
                },			
                events:{
                    'click .jb-add-to-cart':'addToCart',
                    'click .quick-img-overlay':'quick',
                     'mouseenter .recentview': "quickView",
                     'mouseenter .quick-img-overlay': "quickimgView",
                     'mouseleave .recentview': "quickviewleave",
                     'mouseleave .mz_recently_viewed': "quickviewleave"
                },
                
             
                quickimgView: function(e){
                    var $target = $(e.currentTarget);
                   $target.show();
                },
                quickView: function(e){
                   var $target = $(e.currentTarget);
                    $target.siblings('.quick-img-overlay').show();
                },
                quickviewleave: function(e){
                    $('.quick-img-overlay').hide();
                },
                quick:function(e){
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
                   
                }
                /*recentToCart: function(e){
                    e.preventDefault();
                    var me=this;
                    var $target = $(e.currentTarget), productCode = $target.data("jb-pid");
                    $('[data-mz-productlist],[data-mz-facets],.mz-productlisting').addClass('is-loading');
                    //$('[data-mz-message-bar]').hide();
                    $target.addClass('is-loading');
                    var count = 1;
            
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
                                showErrorMessage("Please choose the Gift Card amount before adding it to your cart. <br> Thanks for choosing to give a Jelly Belly Gift Card!");
                                $target.removeClass('is-loading');
                            }
                        }else{
                            me.addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                        }
                    });
                */
                //},
                
                 /*   addToCartAndUpdateMiniCart:function(PRODUCT,count,$target){
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
                    showErrorMessage(badPromise.message);
                    $target.removeClass('is-loading');
                });*/
        //}
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
                            var pro = PRODUCT;
                            var qntcheck = 0;
                            $.each(MiniCart.MiniCart.getRenderContext().model.items,function(k,v){
                                if(v.product.productCode == pro.get('productCode') && ((v.quantity + count) > 50)){ 
                                    qntcheck = 1;
                                }
                            });
                            if(pro.get('price.price') === 0 && MiniCart.MiniCart.getRenderContext().model.items.length > 0 ){
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
                                me.addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                            }else if(qntcheck){
                                $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                                $target.removeClass('is-loading');
                                $('.items-per-order').show();
                                return false; 
                            }else{
                                me.addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                            }
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
                        $('.modalDialog').hide();
                        CartMonitor.update();
                        MiniCart.MiniCart.showMiniCart();
                        PRODUCT = ''; 
                    });
                Api.on('error', function (badPromise, xhr, requestConf) {
                    //showErrorMessage(badPromise.message);
                    $target.removeClass('is-loading');
                });
        },
                    render: function(){
                    Backbone.MozuView.prototype.render.apply(this);
                    }
                    
                });
        $(document).ready(function(){
            var existingProducts =  $.cookie('recentProducts');
            if(existingProducts){
                var recentProducts = existingProducts.split(',');
                var pcode= require.mozuData('product').productCode;
                var filter='';
                if(recentProducts.length>0){ 
                    
                    if( recentProducts.indexOf(pcode)!== -1){
                        recentProducts.splice(recentProducts.indexOf(pcode),1);
                    }else{
                        recentProducts.splice(4,1);
                    }
                    for(var prdind=0;prdind<=4;prdind++){
                        if(prdind > 0) filter += ' or ';
                        filter += 'productCode+eq+'+recentProducts[prdind];
                    }
                }
                
            if(filter!=="" && filter!==undefined){
                var serviceurl = '/api/commerce/catalog/storefront/productsearch/search/?startIndex=0&pageSize=30&filter='+filter;
                   Api.request('GET',serviceurl).then(function(productslist){
                       var a=productslist.items; 
                       var b=[];
                        for(var i=0;i<recentProducts.length;i++){
                            for(var j=0;j<a.length;j++){
                                   if(recentProducts[i]==a[j].productCode){
                                       b.push(a[j]);
                                   }
                            }
                        }
                        productslist.items.length=0;    
                        for(var k=0;k<b.length;k++){
                            
                            productslist.items.push(b[k]);
                        }
                        var facetingModel = new FacetingModels.FacetedProductCollection(productslist);
                        var dataIds = [];
                        facetingModel.get('items').models.filter(function(ele){
                                dataIds.push(ele.get('productCode'));
                            }
                        );
                        if(dataIds.length>0){
                            var blackoutDates = [];
                            Api.request("post","/sfo/get_dates",{data: dataIds}).then(function(stuff){ 
                                if(stuff.BlackoutDates.length > 0) {
                                    blackoutDates = stuff.BlackoutDates.map(function(d) {
                                        return formatDate(d);
                                    });
                                }
                                for(var i = 0; i < facetingModel.get('items').models.length; i++){
                                    var foundEl = _.findWhere(stuff.Items, {SKU: facetingModel.get('items').models[i].get('productCode')});
                                    if(foundEl && foundEl.FirstShipDate){
                                        var firstShipDate = getFirstShipDate(foundEl.FirstShipDate,blackoutDates);
                                        if(firstShipDate.future){
                                            facetingModel.get('items').models[i].set('dateFirstAvailableInCatalog', firstShipDate.date); 
                                            facetingModel.get('items').models[i].set('daysAvailableInCatalog', -10); 
                                        }
                                    }  
                                }
                                var productRecentView = new ProductRecentView({
                                    el:$('#recent'),
                                    model:facetingModel
                                });
                                window.productRecentView = productRecentView;
                                productRecentView.render();
                            });
                        }    
                    });
                }
            }
            var formatDate = function(date){
                var udate = new Date(date),
                    sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear()),
                    startdate = ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
                return startdate;
            };
            var getFirstShipDate = function(fdate,blackoutDates){
                var udate  = new Date(fdate),
                    date =  new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());
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
                if(fdate>nextday){
                    return {date:fdate,future:true};
                }else{
                    return {future:false};
                }
                        
            };
        });
    });

