require(["modules/jquery-mozu", "modules/api"],
  function($, api) {
    var pageContext = require.mozuData('pagecontext');
    var product = require.mozuData('product');
    // Measure a view of product details. This example assumes the detail view occurs on pageload, 
    // and also tracks a standard pageview of the details page. 
    window.dataLayer.push({
      'ecommerce': {
        'detail': {
          'products': [{
            'name': product.content.productName,
            'id': product.productCode,
            'price': product.price.price,
            'brand': 'Jelly Belly',
            'category': product.categories[0].content.name || "",
            'variant': 'standard',
          }]
        }
      }
    }, {'event': 'productView'});

    $(document).on('click', '.gtm-add-to-cart', function(e) {
      var prodSelector = e.target.getAttribute("data-mz-prcode");
      console.log(e.target.getAttribute("data-mz-prcode"));
      window.dataLayer.push({
        'event': 'addToCart',
        'ecommerce': {
          'currencyCode': '',
          'add': {
            'products': [{
              'name': e.target.getAttribute("data-mz-product-name"),
              'id': e.target.getAttribute("data-mz-prcode"),
              'price': product.price.price,
              'brand': 'Jelly Belly',
              'category': product.categories[0].content.name,
              'variant': 'standard',
              'quantity': $(".qty-" + prodSelector).val()
            }]
          }
        }
      });

    });

    $(document).on('click', '.mz-productdetail-addtocart', function(e) {
      var prodSelector = e.target.getAttribute("data-mz-prcode");
      window.dataLayer.push({
        'event': 'addToCart',
        'ecommerce': {
          'currencyCode': '',
          'add': {
            'products': [{
              'name': e.target.getAttribute("data-mz-product-name"),
              'id': e.target.getAttribute("data-mz-prcode"),
              'price': e.target.getAttribute("data-jb-price").trim(),
              'brand': 'Jelly Belly',
              'category': product.categories[0].content.name || "",
              'variant': 'standard',
              'quantity': $(".qty-" + prodSelector).val()
            }]
          }
        }
      });

    });
  });