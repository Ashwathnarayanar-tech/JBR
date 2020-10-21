require(["modules/jquery-mozu"],

  function($) {
    var pageContext = require.mozuData('pagecontext');
    //var product = require.mozuData('product');
    var pageType = pageContext.pageType;
    var impressions = [];

    function getImpressionList() {
      var items = document.getElementsByClassName('mz-productlisting');
      for (var i = 0; i < items.length; i++) {
        var impressionObj = {};
        impressionObj.category = items[i].dataset.mzProductcategory;
        impressionObj.id = items[i].dataset.mzProductcode;
        impressionObj.name = items[i].dataset.mzProductname;
        impressionObj.price = items[i].dataset.mzProductprice;
        impressionObj.list = "Category: " + pageContext.title;
        impressionObj.brand = 'Jelly Belly';
        impressionObj.variant = 'standard';
        impressionObj.position = i + 1;
        impressions.push(impressionObj);
      }
      
    };

//    window.addEventListener('beforeunload', function() {
      getImpressionList();
      console.log(impressions);
      dataLayer.push({
        'ecommerce': {
          'impressions': impressions,
          'currencyCode': 'USD'
        }
      }, {'event': 'productImpressions'});
//    });

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
          },
        }
      }, {'event':'promoImpression'});

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
              'list': "Category: " + pageContext.title
            },
            'products': [{
              'name': e.target.getAttribute('data-mz-productname'),
              'id': e.target.getAttribute('data-mz-productcode'),
              'price': e.target.getAttribute('data-mz-productprice'),
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
      var qv = $('.gridder-show').length === 1 ? true: false;
      var qtySelector = qv? ".gridder-show [data-mz-prcode-quantity='"+e.target.getAttribute('data-mz-prcode')+"']" : "[data-mz-prcode-quantity='"+e.target.getAttribute('data-mz-prcode')+"']";
      dataLayer.push({
        'event': 'addToCart',
        'ecommerce': {
          'currencyCode': 'USD',
          'add': {
            actionField: {
              list: pageContext.title //qv? 'Category - Quick View' : 'Category'
            },
            'products': [{
              'name': e.target.getAttribute('data-mz-product-name'), //e.target.getAttribute('data-mz-prname'),
              'id': e.target.getAttribute('data-mz-prcode'),
              'price': e.target.getAttribute('data-jb-price'),
              'brand': 'Jelly Belly',
              'category': '',
              'variant': 'standard',
              'quantity': $(qtySelector).val()
            }]
          }
        }
      });


    })

  });