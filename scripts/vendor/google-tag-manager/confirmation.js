require(["modules/jquery-mozu", "modules/api"],
  function($, api) {
    var pageContext = require.mozuData('pagecontext');
    var order = require.mozuData('order');
    var items = order.items;

    function combineProductCoupons(discounts) {
      var discountCodes = [];
      discounts.forEach(function(discount) {
        discountCodes.push(discount.couponCode);
      })
      return discountCodes.join(',');
    }
    // var categoryList = [];
    // items.forEach(function(item) { 
    //   api.get('product', item.product.productCode).then(function(product) {
    //     categoryList.push(product.data.categories[0].content.name);
    //   })
    // })
    var gtmProductList = [];
    for (var i = 0; i < items.length; i++) {
      var gtmProduct = {};
      gtmProduct.name = items[i].product.name;
      gtmProduct.id = items[i].product.productCode;
      gtmProduct.price = items[i].product.price.price; //does not take into account salePrice
      gtmProduct.brand = 'Jelly Belly';
      gtmProduct.category = items[i].product.categories[0].id; //returns first category code
      gtmProduct.variant = 'standard';
      gtmProduct.quantity = items[i].quantity;
      gtmProduct.coupon = combineProductCoupons(items[i].productDiscounts) || ""; //show all discounts on a product? combine discounts and coupons?
      gtmProductList.push(gtmProduct);
    };

    var orderNumber = order.orderNumber;
    try {
      if (document.cookie.includes('__GTM__' + orderNumber)) {
        console.log("Cookie present. Recording order.");
        dataLayer.push({
          'ecommerce': {
            'purchase': {
              'actionField': {
                'id': order.orderNumber,
                'affiliation': 'Online Store', //what does affiliation mean?
                'revenue': order.total,
                'tax': order.taxTotal,
                'shipping': order.shippingTotal,
                'coupon': order.couponCodes.join(",")
              },
              'products': gtmProductList
            }
          }
        }, {'event': 'purchase'});
        $.cookie('__GTM__' + orderNumber, "cookie_set", {
          path: '/',
          expires: -1
        });
      } else {
        console.log("Cookie not present. Not recording order.")
      }
    } catch (e) {
      console.warn(orderNumber + ' error in confirmation');
    }
    
  });