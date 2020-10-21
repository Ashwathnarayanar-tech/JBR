define(['modules/jquery-mozu','hyprlive','modules/minicart','modules/models-cart','modules/api'], function($,Hypr,MiniCart,CartModels,api) {
    
    var backupItemsArray = [
                    {
                        productCode: "76888",
                        content: { productName: "Champagne Jelly Beans - 7.5 oz Gift Bag - 12 Count Case" },
                        categories: [ { content: { name: "Gift Bag" } } ]
                    },
                    {
                        productCode: "76888",
                        content: { productName: "Champagne Jelly Beans - 7.5 oz Gift Bag - 12 Count Case" },
                        categories: [ { content: { name: "Gift Bag" } } ]
                    },
                    {
                        productCode: "76888",
                        content: { productName: "Champagne Jelly Beans - 7.5 oz Gift Bag - 12 Count Case" },
                        categories: [ { content: { name: "Gift Bag" } } ]
                    },
                    {
                        productCode: "76888",
                        content: { productName: "Champagne Jelly Beans - 7.5 oz Gift Bag - 12 Count Case" },
                        categories: [ { content: { name: "Gift Bag" } } ]
                    },
                    {
                        productCode: "76888",
                        content: { productName: "Champagne Jelly Beans - 7.5 oz Gift Bag - 12 Count Case" },
                        categories: [ { content: { name: "Gift Bag" } } ]
                    },
                    {
                        productCode: "76888",
                        content: { productName: "Champagne Jelly Beans - 7.5 oz Gift Bag - 12 Count Case" },
                        categories: [ { content: { name: "Gift Bag" } } ]
                    },
                    {
                        productCode: "76888",
                        content: { productName: "Champagne Jelly Beans - 7.5 oz Gift Bag - 12 Count Case" },
                        categories: [ { content: { name: "Gift Bag" } } ]
                    },
                    {
                        productCode: "76888",
                        content: { productName: "Champagne Jelly Beans - 7.5 oz Gift Bag - 12 Count Case" },
                        categories: [ { content: { name: "Gift Bag" } } ]
                    },
                    {
                        productCode: "76888",
                        content: { productName: "Champagne Jelly Beans - 7.5 oz Gift Bag - 12 Count Case" },
                        categories: [ { content: { name: "Gift Bag" } } ]
                    },
                    {
                        productCode: "76888",
                        content: { productName: "Champagne Jelly Beans - 7.5 oz Gift Bag - 12 Count Case" },
                        categories: [ { content: { name: "Gift Bag" } } ]
                    },
                    {
                        productCode: "76888",
                        content: { productName: "Champagne Jelly Beans - 7.5 oz Gift Bag - 12 Count Case" },
                        categories: [ { content: { name: "Gift Bag" } } ]
                    },
                    {
                        productCode: "76888",
                        content: { productName: "Champagne Jelly Beans - 7.5 oz Gift Bag - 12 Count Case" },
                        categories: [ { content: { name: "Gift Bag" } } ]
                    }
                
                    ];
					
	var backupItems = { items: backupItemsArray };

    
    var tealium = function() {
        this.init(); // Initilising Function
        this.consoleEnable = true;
    }; 
    tealium.prototype = { 
      init: function() {
           this.checkPage(); // Check page type
           this.cartModel = require.mozuData('cart');
           this.prodModel = require.mozuData('product');
           this.checkoutModel = require.mozuData('checkout');
           this.confirmationModel = require.mozuData('order'); 
           this.categoryModel = require.mozuData('Category');
           this.userModel = require.mozuData('user'); 
           this.facetedProducts = require.mozuData('facetedproducts');
           
           if (this.facetedProducts === undefined) {
               this.categoryproduct = backupItems; // require.mozuData('facetedproducts');
           }
           else {
               this.categoryproduct = this.facetedProducts;
           }
      },
      page: window.location.pathname.split('/').pop(),
      urlCheck1: window.location.pathname.split('/').pop().toString().toLowerCase(),
      urlCheck2: !window.location.pathname.split("/")[1] ? "" : window.location.pathname.split("/")[1].toLowerCase(),
      urlCheck3: !window.location.pathname.split("/")[2] ? "" : window.location.pathname.split("/")[2].toLowerCase(),
      pageName: function() { // Check Page name
            if(!this.page) 
             return 'home';
            else if(this.urlCheck3 === 'c')
             return 'product category';
            else if(this.urlCheck3 === 'p')
             return 'product';
            else if(this.urlCheck1 === 'search') 
             return 'search';
            else if(this.urlCheck2 == 'checkout' && this.urlCheck1 != 'confirmation' )
             return this.urlCheck2;
            else if(this.urlCheck1 == 'confirmation')
             return 'confirmation';
            else if(this.urlCheck1 == "shopmain" || this.urlCheck1 == "shop-our-product")
             return 'shopmain';
            else if(this.urlCheck1 == "ourcandy" || this.urlCheck1 == "visitjellybelly" || this.urlCheck1 == "funstuff" || this.urlCheck1 == "sportssponsorships")
             return 'home';
            else if(this.urlCheck1 == "storelocator") 
             return 'Locator';
            else if(this.urlCheck1 == "gift-cards")
             return 'gift_cards';
            else if(this.urlCheck2.toString() == "candy")
             return 'candy';
            else
             return this.page.toString();
      },
      pageType: function() { // Check Page Type
          if(!this.urlCheck1) 
            return 'home';
          else if(this.urlCheck3 === 'c') 
            return 'category'; 
          else if(this.urlCheck3 === 'p')
            return 'product';
          else if(this.urlCheck1 === 'search') 
             return 'search';
          else if(this.urlCheck2 == 'checkout' && this.urlCheck1 != 'confirmation' )
            return 'Checkout';
          else if(this.urlCheck1 == 'confirmation')
            return 'receipt';
          else if(this.urlCheck1 == "shopmain" || this.urlCheck1 == "shopmain")
             return 'Shop';
          else if(this.urlCheck1 == "ourcandy" || this.urlCheck1 == "visitjellybelly" || this.urlCheck1 == "funstuff" || this.urlCheck1 == "sportssponsorships" || this.urlCheck1 == "gift-cards" || this.urlCheck1 == "storelocator")
             return 'gateway';
        
          else if(this.urlCheck2.toString() == "candy")
             return 'candy';
          else
             return this.page.toString();
      },
      cartDetail: function(type) { // Explore details from Cart Model
          var products = [];
          if(type == "id") {
          for(var i=0; i < this.cartModel.items.length; i++) { 
            products.push(this.cartModel.items[i].product.productCode);
          } }
          if(type == "image") {
          for(var j=0; j < this.cartModel.items.length; j++) {  
            products.push(this.cartModel.items[j].product.imageUrl);
          } }
          if(type == "Discprice") {
              var discPrice;
              for(var z=0; z < this.cartModel.items.length; z++) {
                  discPrice = this.cartModel.items[z].discountedTotal/this.cartModel.items[z].quantity;
                products.push(""+discPrice.toFixed(2));
              }
          }
          if(type == "price") {
             for(var z2=0; z2 < this.cartModel.items.length; z2++) { 
                products.push(this.cartModel.items[z2].product.price.price);
              }
          }
          if(type == "qty") {
            for(var x=0; x < this.cartModel.items.length; x++) { 
                products.push(this.cartModel.items[x].quantity);
            }  
          }
          if(type == "name") {
             for(var y=0; y < this.cartModel.items.length; y++) { 
                products.push(this.cartModel.items[y].product.name);
              } 
          }
          
          return products;
      },
      categoryDetail: function(type) {
          var products = [];
          // var z = '';
          if(type == 'pid') {
              for(var z_1=0; z_1 < this.categoryproduct.items.length; z_1++) {
                  products.push(this.categoryproduct.items[z_1].productCode);
              }
          }
          if(type == 'name') {
              for(var z_2=0; z_2 < this.categoryproduct.items.length; z_2++) {
                  products.push(this.categoryproduct.items[z_2].content.productName);
              }
          }
          
          if(type == 'category') {
              for(var z_3=0; z_3 < this.categoryproduct.items.length; z_3++) {
                 products.push(this.categoryproduct.items[z_3].categories[0].content.name);
              }
          }
           return products;
      },
      productModel: function(type) { // Get product details from Product Model
          var products = [];
          if(type == 'name') {
              products.push((this.prodModel.content.productName === undefined) ? "" :this.prodModel.content.productName);
          }
          if(type == 'id') {
             products.push((this.prodModel.productCode === undefined) ? "" : this.prodModel.productCode);
          }
          if(type == 'category') {
              for(var i=0; i < this.prodModel.categories.length; i++) {
                  products.push(this.prodModel.categories[i].content.name);
              }
          }
          if(type == 'unitPrice') {
              products.push((this.prodModel.price.salePrice === undefined) ? "" : this.prodModel.price.price);
          }
          if(type == 'salePrice') {
              products.push((this.prodModel.price.salePrice === undefined) ? "" : ""+this.prodModel.price.salePrice);
          }
          if(type == 'image') {
              for(var j=0; j < this.prodModel.content.productImages.length; j++) {
                  products.push(this.prodModel.content.productImages[j].imageUrl);
              }
          }
          return products;
      },
      checkoutDetail: function(type){
        var details = [];

        if(type == 'id') {
            for(var i =0; i < this.checkoutModel.items.length; i++) {
                details.push(this.checkoutModel.items[i].product.productCode);
            }
        }
        if(type == 'image') {
            for(var j =0; j < this.checkoutModel.items.length; j++) {
                details.push(this.checkoutModel.items[j].product.imageUrl);
            }
        }
        if(type == 'qty') {
            for(var x = 0; x < this.checkoutModel.items.length; x++) {
                details.push(this.checkoutModel.items[x].quantity);
            }
        }
        if(type == 'name') {
            for(var z = 0; z < this.checkoutModel.items.length; z++) {
                details.push(this.checkoutModel.items[z].product.name);
            }
        }
        if(type == "Discprice") {
              var discPrice;
              for(var z1=0; z1 < this.checkoutModel.items.length; z1++) {
                  discPrice = this.checkoutModel.items[z1].discountedTotal/this.checkoutModel.items[z1].quantity;
                details.push(""+discPrice.toFixed(2));
              }
          }
        if(type == 'price') {
            for(var y = 0; y < this.checkoutModel.items.length; y++) {
                details.push(this.checkoutModel.items[y].product.price.salePrice);
            }
        }
        
        return details;
      },
      confirmationDetail: function(type) { // Get Details from Order Confirmation Model
        var details = [],detailsStr;
        if(type == 'id') {
            for(var i =0; i < this.confirmationModel.items.length; i++) {
                details.push(this.confirmationModel.items[i].product.productCode);
            }
        }
        if(type == 'image') {
            for(var j =0; j < this.confirmationModel.items.length; j++) {
                details.push(this.confirmationModel.items[j].product.imageUrl);
            }
        }
        if(type == 'qty') {
            for(var x = 0; x < this.confirmationModel.items.length; x++) {
                details.push(this.confirmationModel.items[x].quantity);
            }
        }
        if(type == "Discprice") {
              var discPrice;
              for(var z1=0; z1 < this.confirmationModel.items.length; z1++) {
                  discPrice = this.confirmationModel.items[z1].discountedTotal/this.confirmationModel.items[z1].quantity;
                details.push(""+discPrice.toFixed(2));
              }
          }
        if(type == 'price') {
            for(var y = 0; y < this.confirmationModel.items.length; y++) {
                details.push(this.confirmationModel.items[y].product.price.salePrice);
            }
        }
        if(type == 'name') {
            for(var z = 0; z < this.confirmationModel.items.length; z++) {
                details.push(this.confirmationModel.items[z].product.name);
            }
        }
        if(type == 'order_id') {
              details.push(this.confirmationModel.orderNumber);
        }
        if(type == 'subtotal') {
            details.push((this.confirmationModel.total - this.confirmationModel.shippingTotal).toFixed(2));
        }
         if(type == 'total') {
            details.push(this.confirmationModel.total);
        }
        if(type == 'taxtotal') {
            details.push((this.confirmationModel.taxTotal).toFixed(2));
        }
        if(type == 'shippingTotal') {
            details.push(this.confirmationModel.shippingTotal.toFixed(2));
        }
        if(type == 'paymentType') {
            for(var q = 0; q < this.confirmationModel.payments.length; q++) {
                details.push(this.confirmationModel.payments[q].paymentType);
            }
        }
        if(type == 'subtotalDiscount')  {
            details.push((this.confirmationModel.discountTotal === undefined || this.confirmationModel.discountTotal === null) ? "" : this.confirmationModel.discountTotal.toFixed(2));
        }
        if(type == 'orderDiscount') {
            for(var zp = 0; zp < this.confirmationModel.orderDiscounts.length; zp++) {
                details.push(this.confirmationModel.orderDiscounts[zp].impact);
            }
        }
        if(type == 'couponCode') {
            for(var p = 0; p < this.confirmationModel.orderDiscounts.length; p++) {
                details.push(this.confirmationModel.orderDiscounts[p].couponCode);
            }
        }
        if(type == 'currency') {
            details.push(this.confirmationModel.currencyCode);
        }
        if(type == 'shippingMethod') {
            details.push(this.confirmationModel.fulfillmentInfo.shippingMethodName);
        }
        if(type == 'fname') {
            details.push(this.confirmationModel.fulfillmentInfo.fulfillmentContact.firstName);
        }
        if(type == 'lname') {
            details.push(this.confirmationModel.fulfillmentInfo.fulfillmentContact.lastNameOrSurname);
        }
        if(type == 'street1') {
            details.push(this.confirmationModel.fulfillmentInfo.fulfillmentContact.address.address1);
        }
        if(type == 'street2') {
            details.push((this.confirmationModel.fulfillmentInfo.fulfillmentContact.address.address2 === null) ? "" :this.confirmationModel.fulfillmentInfo.fulfillmentContact.address.address2);
        }
        if(type == 'city') {
            details.push(this.confirmationModel.fulfillmentInfo.fulfillmentContact.address.cityOrTown);
        }
        if(type == 'state') {
            details.push(this.confirmationModel.fulfillmentInfo.fulfillmentContact.address.stateOrProvince);
        }
        if(type == 'zip') {
            details.push(this.confirmationModel.fulfillmentInfo.fulfillmentContact.address.postalOrZipCode);
        }
        if(type == 'billing_fname') {
            details.push(this.confirmationModel.billingInfo.billingContact.firstName);
        }
        if(type == 'billing_lname') {
            details.push(this.confirmationModel.billingInfo.billingContact.lastNameOrSurname);
        }
        if(type == 'billing_street1') {
            details.push(this.confirmationModel.billingInfo.billingContact.address.address1);
        }
        if(type == 'billing_street2') {
            details.push((this.confirmationModel.billingInfo.billingContact.address.address2 === null) ? "" :this.confirmationModel.billingInfo.billingContact.address.address2);
        }
        if(type == 'billing_city') {
            details.push(this.confirmationModel.billingInfo.billingContact.address.cityOrTown);
        }
        if(type == 'billing_state') {
            details.push(this.confirmationModel.billingInfo.billingContact.address.stateOrProvince);
        }
        if(type == 'billing_zip') {
            details.push(this.confirmationModel.billingInfo.billingContact.address.postalOrZipCode);
        }
        if(type == 'customer_id') {
            details.push(this.confirmationModel.customerAccountId);
        }
        if(type == 'customer_email') {
            //details.push((!this.confirmationModel.acceptsMarketing) ? "" : this.confirmationModel.email);
            details.push(this.confirmationModel.email);
        }
        if(type == 'customer_emailOpt') {
            details.push((!this.confirmationModel.acceptsMarketing) ? "N" : "Y");
        }
        if(type == 'customer_phone') {
           details.push(this.confirmationModel.billingInfo.billingContact.phoneNumbers.home);
        }
        if(type == 'msg') {
           details.push((this.confirmationModel.shopperNotes.comments === null || this.confirmationModel.shopperNotes.comments ===undefined) ? "" : this.confirmationModel.shopperNotes.comments);
        }
        if(type == 'company') {
            details.push((this.confirmationModel.fulfillmentInfo.fulfillmentContact.companyOrOrganization === null || this.confirmationModel.fulfillmentInfo.fulfillmentContact.companyOrOrganization === undefined) ? "" : this.confirmationModel.fulfillmentInfo.fulfillmentContact.companyOrOrganization);
        }
        return details;
      },
      definePage: function() {
          if(this.urlCheck1 == "cart") 
            return 'cart';
          if(this.urlCheck3 === 'c') 
            return 'category';
          if(this.urlCheck3 === 'p')
            return 'product'; 
          if(this.urlCheck1 === 'search')
            return 'search';
          if(this.urlCheck2 == 'checkout' && this.urlCheck1 != 'confirmation' )
            return 'checkout';
          if(this.urlCheck1 == 'confirmation')
            return 'confirmation';
          if(this.urlCheck2 == "candy")
            return 'candy';
          else 
            return 'static';
      },
      checkPage: function(options) { // Find Page types
          if(this.definePage() == "cart") { // Cart Page
              this.buildTag('cart');
          }
          if(this.definePage() == "category") {
              this.buildTag('category');
          }
          if(this.definePage() == "product") {
              this.buildTag('product');
          }
          if(this.definePage() == "search") {
              this.buildTag('search');
          }
          if(this.definePage() == "checkout") {
              this.buildTag('checkout');
          }
          if(this.definePage() == "confirmation") {
              this.buildTag('confirmation');
          }
          if(this.definePage() == "static") {
              this.buildTag('info');
          }
          if(this.definePage() == "candy") {
              this.buildTag('info');
          }
      },
       myTimer: function(that, myVar) { 
         var CartId=$('.softCartId').html();
         var CartQty=$('.softCartQty').html();
         var CartPrice=$('.softCartPrice').html();
         if(CartId !== "") clearInterval(myVar);
         if(CartId !== "") {
             var temp5 = (that.prodModel === undefined) ? that.prodModel = require.mozuData('product') : "";
               utag_data = {
                    site_name: "JellyBelly.com",
                    site_country: "US",
                    site_currency: "USD",
                    site_search_results: "",
                    site_search_keyword: "",
                
                   page_name: that.pageName(),
                    page_type: that.pageType(),
                    page_section_name: "",
                    page_category_name: "",
                    page_subcategory_name: "",
                    page_referring_url: document.referrer,
                
                    product_top5: ["1220", "1171", "1241", "462", "527"],
                
                    product_id: that.productModel('id'),
                    product_sku: that.productModel('id'),
                    product_name: that.productModel('name').toString(),
                    product_brand: that.productModel('category'),
                    product_category: that.productModel('category'),
                    product_unit_price: that.productModel('unitPrice'),//need non-sale price
                    product_list_price: that.productModel('salePrice'),
                    product_image: that.productModel('image'),
                    cart_product_id: (CartId === "" || CartId === "[]") ? [] : JSON.parse(CartId),
                    cart_product_quantity: (CartQty === "" || CartId === "[]") ? [] : JSON.parse(CartQty),
                    cart_product_unit_price: (CartPrice === "" || CartId === "[]") ? [] : JSON.parse(CartPrice)
                  };
                   that.loadScript();
         }
         },
       myCategory: function(thats, myVar) { 
               var CartId=$('.softCartId').html();
               var CartQty=$('.softCartQty').html();
               var CartPrice=$('.softCartPrice').html();
               if(CartId !== "") clearInterval(myVar);
               if(CartId !== "") { 
                    var temp3 = (thats.categoryModel === undefined) ? thats.categoryModel = require.mozuData('Category') : "";
                    var temp4 = (thats.categoryproduct === undefined) ? thats.categoryproduct = backupItems /*require.mozuData('facetedproducts')*/ : "";
                       utag_data = {
                          site_name: "JellyBelly.com",
                          site_country: "US",
                          site_currency: "USD",
                          page_category_name: thats.categoryModel.content.name,
                          page_name: thats.pageName(),
                          page_type: thats.pageType(),
                          page_section_name: "product category",
                          product_id: thats.categoryDetail('pid'),
                          page_categoryid: thats.categoryModel.categoryId.toString(),
                          page_subcategory_name: "",
                          cart_product_id: (CartId === "" || CartId === "[]") ? [] : JSON.parse(CartId),
                          cart_product_quantity: (CartQty === "" || CartId === "[]") ? [] : JSON.parse(CartQty),
                          cart_product_unit_price: (CartPrice === "" || CartId === "[]") ? [] : JSON.parse(CartPrice)

                        };
                         thats.loadScript();
               }
             },


      buildTag: function(type,options) { // Build Utag_data based on Page type
          if(type == "cart") { // Cart Page   
         
              var temp1 = (this.cartModel === undefined) ? this.cartModel = require.mozuData('cart') : "";
              utag_data = {
                site_name: "JellyBelly.com",
                site_country: "US",
                site_currency: "USD",
                site_search_results: "",
                site_search_keyword: "",
            
                page_name: this.pageName(),
                page_type: this.pageType(),
                page_referring_url: document.referrer,
            
                product_top5: ["1220", "1171", "1241", "462", "527"],
            
                order_subtotal: (this.cartModel === undefined) ? "" : ""+this.cartModel.subtotal.toFixed(2),
                product_brand: [""],
                product_category: [""],
                product_id: this.cartDetail('id'),
                product_sku: this.cartDetail('id'),
                product_image: this.cartDetail('image'),
                product_list_price: this.cartDetail('Discprice'),
                product_quantity: this.cartDetail('qty'),
                product_name: this.cartDetail('name'),
                product_unit_price: this.cartDetail('price')
              };
               this.loadScript();
          }  
          if(type == "info") { // Static Pages.
         
                utag_data = {
                    site_name: "JellyBelly.com",
                    site_country: "US",
                    site_currency: "USD",
                    site_search_results: "",
                    site_search_keyword: "",
                
                    page_name: this.pageName(),
                    page_type: this.pageType(),
                    page_section_name: "",
                    page_referring_url: document.referrer,
                
                    product_top5: ["1220", "1171", "1241", "462", "527"]
                  };
                   this.loadScript();
          }
          if(type == 'search') { 
              var temp2 = (this.categoryproduct === undefined) ? this.categoryproduct = backupItems /*require.mozuData('facetedproducts')*/ : "";
                utag_data = {
                    site_name: "JellyBelly.com",
                    site_country: "US", 
                    site_currency: "USD",
                    site_search_keyword: (require.mozuData('pagecontext') === undefined) ? "" : require.mozuData('pagecontext').search.query,
                    site_search_results: ($('.jb-result-details').data('total-results') > 0) ? ''+$('.jb-result-details').data('total-results') : "",
                    page_name: this.pageName(),
                    page_type: this.pageType(),
                    product_id: this.categoryDetail('pid')
                  };
                  this.loadScript();
          }
          if(type == "category") { // Category Page
             var thats = this;
             var myVar = setInterval(function(){thats.myCategory(thats, myVar);}, 1000);
             
          }
         if(type == "product") { // Product Page
         var that = this;
         var myVar1 = setInterval(function(){that.myTimer(that, myVar1);}, 1000);
         
         }
         if(type == 'checkout') { // Checkout Page
             var temp7 = (this.checkoutModel === undefined) ? this.checkoutModel = require.mozuData('checkout') : "";
                 utag_data = {
                    site_name: "JellyBelly.com",
                    site_country: "US",
                    site_currency: "USD",
                
                    page_name: this.pageName(),
                    page_type: this.pageType(),
                    page_referring_url: document.referrer,
                    
                    product_id: this.checkoutDetail('id'),
                    product_sku: this.checkoutDetail('id'),
                    product_image: this.checkoutDetail('image'),
                    product_quantity: this.checkoutDetail('qty'),
                    product_list_price: this.checkoutDetail('Discprice'),
                    product_name: this.checkoutDetail('name'),
                    product_unit_price: this.checkoutDetail('price')
                  };
                   this.loadScript();
         }
         if(type == 'confirmation') { // Order Confirmation Page
             var temp6 = (this.confirmationModel === undefined) ? this.confirmationModel = require.mozuData('order') : "";
             
             var temp10 = (this.userModel === undefined) ? this.userModel = require.mozuData('user') : "";
             var logged_in = 'N';
             if (!this.userModel.isAnonymous)
                { logged_in = 'Y'; }
			 
             var order_has_digital = 'N';
             for (var i = 0; i < this.confirmationModel.items.length; i++)
             {
                if (this.confirmationModel.items[i].product.goodsType === 'DigitalCredit') {
                    order_has_digital = 'Y';
                }
             }
             
			// ESTIMATED SHIP AND DELIVERY DATE
            // var order_date = new Date(order_date_str + "T00:00:00");
            var orderDate = new Date();
            var daysToShip = 3;
            var daysToDeliver = 7;
            
            var shipDate = new Date();
            shipDate.setDate(orderDate.getDate() + daysToShip);

            // adjust shipDate and deliveryDate to advance beyond Saturdays and Sundays
            while (shipDate.getDay() === 6 || shipDate.getDay() === 0) {
                shipDate.setDate(shipDate.getDate() + 1);
            }

            var deliveryDate = new Date();
            deliveryDate.setDate(shipDate.getDate() + daysToDeliver);

            while (deliveryDate.getDay() === 6 || deliveryDate.getDay() === 0) {
                deliveryDate.setDate(deliveryDate.getDate() + 1);
            }

            var shipMonth = ('0' + (shipDate.getMonth() + 1)).slice(-2);
            var shipDay = ('0' + shipDate.getDate()).slice(-2);
            var estimatedShipDate = shipDate.getFullYear() + "-" + shipMonth + "-" + shipDay;

            var deliveryMonth = ('0' + (deliveryDate.getMonth() + 1)).slice(-2);
            var deliveryDay = ('0' + deliveryDate.getDate()).slice(-2);
            var estimatedDeliveryDate = deliveryDate.getFullYear() + "-" + deliveryMonth + "-" + deliveryDay;

             utag_data = {
                site_name: "JellyBelly.com",
                site_country: "US",
                site_currency: "USD",
                site_search_results: "",
                site_search_keyword: "",
            
                page_name: this.pageName(),
                page_type: this.pageType(),
                page_section_name: "",
                page_category_name: "",
                page_subcategory_name: "",
                page_referring_url: document.referrer,
            
            
                product_id: this.confirmationDetail('id'),
                product_sku: this.confirmationDetail('id'),
                product_image: this.confirmationDetail('image'),
                product_quantity: this.confirmationDetail('qty'),
                product_list_price: this.confirmationDetail('Discprice'),
                product_name: this.confirmationDetail('name'),
                product_unit_price: this.confirmationDetail('price'),
            
                order_id: this.confirmationDetail('order_id').toString(),  
                order_subtotal: this.confirmationDetail('subtotal').toString(),
                order_subtotalDisc: this.confirmationDetail('subtotalDiscount').toString(),
                order_shipping_amount: this.confirmationDetail('shippingTotal').toString(),
                order_payment_type: this.confirmationDetail('paymentType'),
                order_promotions: this.confirmationDetail('couponCode'),
                order_discount_amount: this.confirmationDetail('orderDiscount').toString(),
                order_total: this.confirmationDetail('total').toString(),
                order_currency: this.confirmationDetail('currency').toString(),
                order_shipping_method: this.confirmationDetail('shippingMethod').toString(),//need shipping method
                order_shipping_company: this.confirmationDetail('company').toString(),
                order_shipping_first_name: this.confirmationDetail('fname').toString(),
                order_shipping_last_name: this.confirmationDetail('lname').toString(),
                order_shipping_street_1: this.confirmationDetail('street1').toString(),
                order_shipping_street_2: this.confirmationDetail('street2').toString(),
                order_shipping_city: this.confirmationDetail('city').toString(),
                order_shipping_state: this.confirmationDetail('state').toString(),
                order_shipping_zip: this.confirmationDetail('zip').toString(),
                order_shipping_msg: this.confirmationDetail('msg').toString(),
                order_billing_company: this.confirmationDetail('company').toString(),
                order_billing_first_name: this.confirmationDetail('billing_fname').toString(),
                order_billing_last_name: this.confirmationDetail('billing_lname').toString(),
                order_billing_street_1: this.confirmationDetail('billing_street1').toString(),
                order_billing_street_2: this.confirmationDetail('billing_street2').toString(),
                order_billing_city: this.confirmationDetail('billing_city').toString(),
                order_billing_state: this.confirmationDetail('billing_state').toString(),
                order_billing_zip: this.confirmationDetail('billing_zip').toString(),
                order_tax_amount: this.confirmationDetail('taxtotal').toString(),
                order_has_preorder: 'N',
                order_has_digital: order_has_digital,
                order_shipping_date_est: estimatedShipDate,
                order_delivery_date_est: estimatedDeliveryDate,
            
                customer_id: this.confirmationDetail('customer_id').toString(),
                customer_email: this.confirmationDetail('customer_email').toString(),
                customer_optin: this.confirmationDetail('customer_emailOpt').toString(),
                customer_phone: this.confirmationDetail('customer_phone').toString(),
				customer_country: "US",
				customer_loggedin: logged_in
              };
               this.loadScript();
         }
         return true;
      },
      loadScript: function() { // Build Tealium Tag
            utag_data.yotta_custom_dimension1 = "yottaa_control";
			tf();
      },
      consoleManager: function(msg) {
          if(this.consoleEnable) { 
          }
      }
    };
    new tealium(); // Start the Function
}); 



