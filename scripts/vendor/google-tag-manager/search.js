require(["modules/jquery-mozu"],

  function($) {
    var pageContext = require.mozuData('pagecontext');
    var product = require.mozuData('product');
    var pageType = pageContext.pageType;
    var items = document.getElementsByClassName('mz-productlisting');
    var impressions = [];

console.log(items);
    function getImpressionList() {
      for (var i = 0; i < items.length; i++) {
        var impressionObj = {};
        impressionObj.category = items[i].dataset.mzProductcategory;
        impressionObj.id = items[i].dataset.mzProduct;
        impressionObj.name = items[i].dataset.mzProductname;
        impressionObj.price = items[i].dataset.mzProductprice;
        impressionObj.list = pageType;
        impressionObj.brand = 'Jelly Belly';
        impressionObj.variant = 'standard';
        impressionObj.position = i + 1;
        impressions.push(impressionObj);
      }
    };

    // window.addEventListener('beforeunload', function() {
      getImpressionList();
      dataLayer.push({
        'ecommerce': {
          'currencyCode': 'USD',
          'impressions': impressions
        }
      }, {'event': 'productImpressions'});
    // });

    // promotion impression
    $(".gtm-promotion").each(function(i, pri) {
      console.log(pri);
      dataLayer.push({
        'ecommerce': {
          'promoView': {
            'promotions': [{
              'id': pri.getAttribute('gtm-promotion-id'),
              'name': pri.getAttribute('gtm-promotion-name'),
              'creative': pri.getAttribute('gtm-promotion-creative'),
              'position': pri.getAttribute('gtm-promotion-position')
            }]
          }
        }
      });

    });

    // promotion click
    $(document).on('click', '.gtm-promotion', function(e) {
      onPromoClick({
        'id': e.currentTarget.getAttribute('gtm-promotion-id'),
        'name': e.currentTarget.getAttribute('gtm-promotion-name'),
        'creative': e.currentTarget.getAttribute('gtm-promotion-creative'),
        'position': e.currentTarget.getAttribute('gtm-promotion-position'),
        'destinationUrl': e.currentTarget.getAttribute('gtm-destination-url')
      });
    });

    $(document).on('click', '.gtm-product-link', function(e) {
      console.log(e);
      dataLayer.push({
        'event': 'productClick',
        'ecommerce': {
          'click': {
            'actionField': {
              'list': 'Search'
            },
            'products': [{
              'name': e.target.getAttribute('data-mz-product-name'),
              'id': e.target.getAttribute('data-mz-prcode'),
              'price': e.target.getAttribute('data-jb-price').trim().slice(0, -2),
              'brand': 'Jelly Belly',
              'category': e.target.getAttribute('data-mz-productcategory'),
              'variant': 'standard',
              'position': e.target.getAttribute('data-mz-productposition')
            }]
          }
        },
        'eventCallback': function() {
          document.location = "/p/" + e.target.getAttribute('data-mz-productcode');
        }
      });
    });

    function onPromoClick(promoObj) {
      dataLayer.push({
        'event': 'promotionClick',
        'ecommerce': {
          'promoClick': {
            'promotions': [{
              'id': promoObj.id,
              'name': promoObj.name,
              'creative': promoObj.creative,
              'position': promoObj.position
            }]
          }
        },
        'eventCallback': function() {
          console.log("calling back");
          document.location = promoObj.destinationUrl;
        }
      });
    }

    $(document).on('click', '.gtm-add-to-cart', function(e) {
      console.log(e.target.getAttribute('data-mz-product-name'));
      var prodSelector = e.target.getAttribute("data-mz-prcode");
      dataLayer.push({
        'event': 'addToCart',
        'ecommerce': {
          'currencyCode': 'USD',
          'add': {
            // actionField: {
            //   list: qv? 'Search - Quick View' : 'Search'
            // },
            'products': [{
              'name': e.target.getAttribute('data-mz-product-name'),
              'id': e.target.getAttribute('data-mz-prcode'),
              'price': e.target.getAttribute('data-jb-price').trim().slice(0, -2),
              'brand': 'Jelly Belly',
              'category': '',
              'variant': 'standard',
              'quantity': $(".qty-" + prodSelector).val()
            }]
          }
        }
      });


    })

  });