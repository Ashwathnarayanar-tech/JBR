require(["modules/jquery-mozu"],

  function($) {
    var pageContext = require.mozuData('pagecontext');
    var product = require.mozuData('product');
    var pageType = pageContext.pageType;
    var items = document.getElementsByClassName('mz-productlist');
    var impressions = [];

    function getImpressionList() {
      for (var i = 0; i < items.length; i++) {
        var impressionObj = {};
        impressionObj.category = items[0][i].dataset.mzProductcategory;
        impressionObj.id = items[0][i].dataset.mzProductcode;
        impressionObj.name = items[0][i].dataset.mzProductname;
        impressionObj.price = items[0][i].dataset.mzProductprice;
        impressionObj.list = pageType;
        impressionObj.brand = 'Jelly Belly';
        impressionObj.variant = 'standard';
        impressionObj.position = i + 1;
        impressions.push(impressionObj);
      }
    };

    window.addEventListener('beforeunload', function() {
      getImpressionList();
      dataLayer.push({
        'ecommerce': {
          'currencyCode': 'USD',
          'impressions': impressions
        }
      });
    });

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

    (function(w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
      });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-5BPHS9F');

  });