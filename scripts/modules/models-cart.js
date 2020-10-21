// Code changes made by amit on 3 july for coupon code at line no 76-108
define(['underscore', 'modules/api','modules/backbone-mozu', 'hyprlive', "modules/models-product", 'modules/cart-monitor'], function(_, api,Backbone, Hypr, ProductModels, CartMonitor) {

    var CartItemProduct = ProductModels.Product.extend({  
        helpers: ['mainImage'],
        mainImage: function() {
            var imgs = this.get("productImages"),
                img = imgs && imgs[0],
                imgurl = 'http://placehold.it/160&text=' + Hypr.getLabel('noImages');
            return img || { ImageUrl: imgurl, imageUrl: imgurl }; // to support case insensitivity
        },
        initialize: function() {
            var url = "/product/" + this.get("productCode");
            this.set({ Url: url, url: url });
        }
    }),
  
    CartItem = Backbone.MozuModel.extend({
        relations: {
            product: CartItemProduct
        },
        validation: {
            quantity: {
                min: 1  
            }
        },
        dataTypes: {
            quantity: Backbone.MozuModel.DataTypes.Int
        },
        mozuType: 'cartitem',
        handlesMessages: true,
        helpers: ['priceIsModified'],
        priceIsModified: function() {
            var price = this.get('unitPrice');
            return price.baseAmount != price.discountedAmount;
        },
        // saveQuantity: function() {
        //     if (this.hasChanged("quantity")) this.apiUpdateQuantity(this.get("quantity"));
        // }
        saveQuantity: function() {
            var self = this;
            var oldQuantity = this.previous("quantity");
            if (this.hasChanged("quantity")) {
                this.apiModel.updateQuantity(this.get("quantity"))
                    .then(function(){
                      self.collection.parent.fetch().then(function(cart){
                        // add a free product js
                        cart.checkBOGA();
						brontoObj.build(api);
                      });

                    }, function() { 
                        // Quantity update failed, e.g. due to limited quantity or min. quantity not met. Roll back.
                        self.set("quantity", oldQuantity);
                        self.trigger("quantityupdatefailed", self, oldQuantity);

                    });
            }
            //if (this.hasChanged("quantity")) this.apiUpdateQuantity(this.get("quantity"));
        }
    }),

    Cart = Backbone.MozuModel.extend({
        mozuType: 'cart',
        handlesMessages: true,
        helpers: ['isEmpty','count'],
        relations: {
            items: Backbone.Collection.extend({
                model: CartItem
            })
        },
        
        initialize: function() {
            this.get("items").on('sync remove', this.fetch, this)
                             .on('loadingchange', this.isLoading, this);
        },
        // add a free product js
        checkBOGA: function(){ 
            //Called whenever we would need to add an additional item to the cart
            //due to a BOGA discount (cart initialization and after application
            // of a coupon code)
            var me = this;
            var suggestedDiscounts = this.get("suggestedDiscounts");

            // First we filter our list down to
            // just the products we know we want added.
            var productsToAdd = [];
            if(suggestedDiscounts){
                suggestedDiscounts.forEach(function(discountItem){
                    var cartHasDiscountItem = me.get('items').some(function(cartItem){
                        return discountItem.productCode === cartItem.productCode;
                    });

                    if (discountItem.autoAdd && !cartHasDiscountItem){
                        productsToAdd.push(discountItem);
                    }
                });           
            }    

            // We now have a list of productsToAdd.
            // We'll define a function to fetch and re render the cart after
            // each of the product fetches have been completed.

            var renderCartWhenFinished = _.after(productsToAdd.length, function(){
                me.fetch().then(function(){
                    me.trigger('render');
                    CartMonitor.update(); 
                });
            });
            // We define a recursive function to assure that each product code
            // gets added to the cart sequentially.
            var addProductsToCart = function(productIndex){  
                var totalLength = productsToAdd.length;
                var currentIndex = productIndex || 0;

                if (productsToAdd[currentIndex]){
                    var productToAdd = productsToAdd[currentIndex];
                    var bogaProduct = new CartItemProduct({productCode: productToAdd.productCode});
                    bogaProduct.fetch().then(function(){
                        bogaProduct.apiAddToCart({autoAddDiscountId: productToAdd.discountId}).then(function(cartItem){
                            var nextProductIndex = currentIndex + 1;
                            renderCartWhenFinished();
                            // Minicart.MiniCart.updateMiniCart();
                            addProductsToCart(nextProductIndex);
                        });
                    }, function(error){
                        // Something went wrong with fetching one of the products.
                        // We don't want this to halt the whole process.
                        var nextProductIndex = currentIndex + 1;
                        renderCartWhenFinished();
                        //Minicart.MiniCart.updateMiniCart(); 
                        addProductsToCart(nextProductIndex);
                    });
                }
            };

            addProductsToCart();
        },
        isEmpty: function() {
            return this.get("items").length < 1;
        },
        count: function() { 
            return this.apiModel.count();
            //return this.get("Items").reduce(function(total, item) { return item.get('Quantity') + total; },0);
        },
        toOrder: function() {
            var me = this;
            me.apiCheckout().then(function(order) {
                me.trigger('ordercreated', order);
            });
        },
        removeItem: function (id) {
            var self = this;
            this.get('items').get(id).apiModel.del().then(function() {
				brontoObj.build(api);
                return self.fetch();
            });
            //$('.overlay').hide();
            //return this.get('items').get(id).apiModel.del();  
        },
        
        addCoupon: function () {   
            var me = this;
            var code = this.get('couponCode');
            var orderDiscounts = me.get('orderDiscounts');
            if (orderDiscounts && _.findWhere(orderDiscounts, { couponCode: code })) {
                // to maintain promise api
                var deferred = api.defer();
                deferred.reject();
                deferred.promise.otherwise(function () {
                    me.trigger('error', {
                        message: Hypr.getLabel('promoCodeAlreadyUsed', code)
                    });
                });
                // add a free product js
                me.checkBOGA();
                return deferred.promise;
            }
            this.isLoading(true);
            return this.apiAddCoupon(this.get('couponCode')).then(function () {
                me.set('couponCode', '');
                var productDiscounts = _.flatten(_.pluck(_.pluck(me.get('items').models, 'attributes'), 'productDiscounts'));
                var shippingDiscounts = _.flatten(_.pluck(_.pluck(me.get('items').models, 'attributes'), 'shippingDiscounts'));

                var allDiscounts = me.get('orderDiscounts').concat(productDiscounts).concat(shippingDiscounts);
                var lowerCode = code.toLowerCase();
                if (!allDiscounts || !_.find(allDiscounts, function (d) {
                    // add a free product js
                    me.checkBOGA();
                    return d.couponCode.toLowerCase() === lowerCode;
                })) {
                    me.trigger('error', {
                        message: Hypr.getLabel('promoCodeError', code)
                    });
                }
                // add a free product js
                me.checkBOGA();
                me.isLoading(false);
            });
        },
		checkHeat: function(property){
            // console.log(property);
            return property.attributeFQN === "tenant~IsHeatSensitive";
        },
        hasHeatSensitiveItems: function () { 
            var items = this.get("items").models;
            for (var i = 0; i < items.length; i++){
                var properties = items[i].apiModel.data.product.properties;
                var hs = _.find(properties, this.checkHeat);
                if (hs && hs.values[0].value) {
                    return true;   
                }
            }
            return false;
        }
    });
  
    return {
        CartItem: CartItem,
        Cart: Cart 
    };
});

