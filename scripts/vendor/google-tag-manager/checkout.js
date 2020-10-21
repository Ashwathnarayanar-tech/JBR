//Edge case: Non-anonymous users skip step 2 of the checkout process due to pre-filled shipping info

require(["modules/jquery-mozu", "modules/api"],

  function($, api) {
    var pageContext = require.mozuData('pagecontext');
    var checkout = require.mozuData('checkout');
    var items = checkout.items;
    var categoryList = [];
    var step4Toggle = false;
    
    function sendGtmData(step) {
      if (step4Toggle === true) return;
      if (step === 4) step4Toggle = true;
    	var gtmProductList = [];
  		for (var i = 0; i < items.length; i++) {
        var gtmProduct = {};
        gtmProduct.name = items[i].product.name;
        gtmProduct.id = items[i].product.productCode;
        gtmProduct.price = items[i].product.price.price; //does not take into account salePrice
        gtmProduct.brand = 'Jelly Belly';
        gtmProduct.category = gtmProduct.category = items[i].product.categories[0].id; //returns first category code
        gtmProduct.variant = 'standard';
        gtmProduct.quantity = items[i].quantity;
        gtmProductList.push(gtmProduct);
  		};
      dataLayer.push({
        'event': 'checkout',
        'ecommerce': {
          'checkout': {
            'actionField': {'step': step},
            'products': gtmProductList
          }
        },
        'eventCallback': function() {
          //console.log('checkout'); //not sure what MV wants here
        }
      });
      
    }
    
    
    $(document).ready(function() {
      sendGtmData(1);
    })
    
		$(document).on("click", ".gtm-to-shipping-method, .gtm-to-billing, .gtm-to-review", function(e) {
      var errors = $('.is-invalid');
			if($(e.currentTarget).hasClass("gtm-to-shipping-method")) sendGtmData(2);
			if($(e.currentTarget).hasClass("gtm-to-billing") && errors.length === 0) sendGtmData(3);
			if($(e.currentTarget).hasClass("gtm-to-review") && errors.length === 0) sendGtmData(4);
		});
    
    var orderNumber = checkout.orderNumber;
			try {
				$.cookie('__GTM__' + orderNumber, "cookie_set", {
					path: '/', expires: 1
				});
			} catch(e) { console.warn(orderNumber + ' error in checkout'); }
    
    
    
});