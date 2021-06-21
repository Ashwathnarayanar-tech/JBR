define([
  'backbone',
  'underscore',
  'modules/jquery-mozu',
  'modules/models-product',
  'modules/url-dispatcher',
  'modules/intent-emitter',
  'modules/get-partial-view', 'hyprlive', 'modules/api', 'modules/models-faceting'
], function(Backbone, _, $, ProductModels, UrlDispatcher, IntentEmitter, getPartialView, Hypr, api, FacetingModels) {

  $(document).ready(function() {
    $(document).on('click', '.jb-out-of-stock', function(e) {
      $.colorbox({
        open: true,
        maxWidth: "100%",
        maxHeight: "100%",
        scrolling: false,
        fadeOut: 500,
        html: "<div id='notify-me-dialog' style='padding: 30px;'><form><span>Enter your email address to be notified when this item is back in stock.</span><br><input style='margin-top: 10px;' id='notify-me-email' type='text' value='" + decodeURIComponent(jQuery.cookie('userData')) + "'><span style='background: #39A857; color: #ffffff; padding: 3px; margin-left: 5px; cursor: pointer;' id='notify-me-button' data-mz-product-code='" + e.target.getAttribute('data-mz-product-code') + "'>NOTIFY ME</span></form><div class='notify-error'>Please enter a valid Email id</div></div>", //"/resources/intl/geolocate.html",
        overlayClose: true,
        onComplete: function() {
          $('#cboxClose').show();
          $('#cboxLoadedContent').css({
            background: "#ffffff"
          });

        }
      });
      $(document).find('body').addClass("haspopup");
    });

    // enable scroll after closing zoom image poup
    $(document).on('click', '#cboxClose', function() {
      setTimeout(function() {
        $(document).find('body').removeClass("haspopup");
      }, 250);
    });

    $(document).on('click', '#cboxOverlay', function(e) {
      if ($(e.target).attr('id') == "cboxOverlay") {
        setTimeout(function() {
          $(document).find('body').removeClass("haspopup");
        }, 250);
      }
    });

    $(document).on('click', '#notify-me-button', function(e) {
      if ($('#notify-me-email').val() !== "") {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var patt = new RegExp(re);
        if (patt.test($('#notify-me-email').val())) {
          var obj = {
            email: $('#notify-me-email').val(),
            customerId: require.mozuData('user').accountId,
            productCode: e.target.getAttribute('data-mz-product-code'),
            locationCode: '' //this.model.get('inventoryInfo').onlineLocationCode
          };
          if (window.location.host.indexOf('s16708') > -1 || window.location.host.indexOf('east') > -1|| window.location.host.indexOf('s48917')>-1 || window.location.host.indexOf('s50196')>-1) {
            obj.locationCode = 'MDC';
          } else if (window.location.host.indexOf('s21410') > -1 || window.location.host.indexOf('west') > -1 || window.location.host.indexOf('s48916') >-1|| window.location.host.indexOf('s50197')>-1) {
            obj.locationCode = 'FDC';
          }

          api.create('instockrequest', obj).then(function() {
            $("#notify-me-dialog").fadeOut(500, function() {
              $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500);
            });
          }, function() {
            $("#notify-me-dialog").fadeOut(500, function() {
              $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500);
            });
          });
        } else {
          $('.notify-error').show();
        }
      } else {
        $('.notify-error').show();
      }
    });

    $(document).on('keypress', '#notify-me-email', function(e) {
      if (e.which === 13) {
        e.preventDefault();
        $('#notify-me-button').trigger('click');
        return false;
      }
    });
  });
});