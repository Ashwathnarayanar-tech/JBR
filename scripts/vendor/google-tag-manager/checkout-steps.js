//Edge case: Non-anonymous users skip step 2 of the checkout process due to pre-filled shipping info

// require(["modules/jquery-mozu", "modules/api"],
// 
//   function($, api) {
//     var pageContext = require.mozuData('pagecontext');
//     var checkout = require.mozuData('checkout');
//     var items = checkout.items;
//     var categoryList = [];
// 
//     function sendGtmData(step) {
//     	var gtmProductList = [];
//   		for (var i = 0; i < items.length; i++) {
//         var gtmProduct = {};
//         gtmProduct.name = items[i].product.name;
//         gtmProduct.id = items[i].product.productCode;
//         gtmProduct.price = items[i].product.price.price; //does not take into account salePrice
//         gtmProduct.brand = 'Jelly Belly';
//         gtmProduct.category = gtmProduct.category = items[i].product.categories[0].id; //returns first category code
//         gtmProduct.variant = 'standard';
//         gtmProduct.quantity = items[i].quantity;
//         gtmProduct.coupon = ''; //show all discounts on a product? combine discounts and coupons?
//         gtmProductList.push(gtmProduct);
//   		};
//       dataLayer.push({
//         'event': 'checkout',
//         'ecommerce': {
//           'checkout': {
//             'actionField': {'step': step},
//             'products': gtmProductList
//           }
//         },
//         'eventCallback': function() {
//           console.log(document.location); //not sure if this is what MV wants here
//         }
//       });
//     }
// 
// 
//     $(document).ready(function() {
//       sendGtmData(1);
//     })
// 
//     document.addEventListener('click', function (event) {
//       console.log(event.target);
//       if (event.target.matches('.gtm-to-shipping-method')) {
//     		console.log('step 2 complete');
//     	}
//     	if (event.target.matches('.gtm-to-billing')) {
//         console.log('step 3 complete');
//     	}
//     	if (event.target.matches('.gtm-to-review')) {
//     	  console.log('step 4 complete');
//     	}
//     }, false);
// 
// 
		// $(document).on("click", ".gtm-to-shipping-method, .gtm-to-billing, .gtm-to-review", function(e) {
    //   var errors = $('.is-invalid');
    //   console.log('hello world')
    //   console.log(errors.length);
		// 	if($(e.target.attributes.class.value.includes('gtm-to-shipping-method')) && errors.length === 0) {
    //     alert('step 2 complete');
    //     sendGtmData(2);
    //   }
		// 	if($(e.currentTarget).hasClass("gtm-to-billing") && errors.length === 0) {
    //     console.log('step 3 complete');
    //     sendGtmData(3);
    //   }
		// 	if($(e.currentTarget).hasClass("gtm-to-review") && errors.length === 0) {
    //     console.log('step 4 complete');
    //     sendGtmData(4);
    //   }
		// });
    
    
// });