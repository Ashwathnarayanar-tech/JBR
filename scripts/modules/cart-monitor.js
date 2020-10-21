/**
 * Watches for changes to the quantity of items in the shopping cart, to update
 * cart count indicators on the storefront.
 */
 // The code is changed by Amit on 15-jun-15 for mini cart and main cart sync issue.
define(['modules/jquery-mozu', 'modules/api'], function ($, api) {

    var $cartCount,
        user = require.mozuData('user'),
        userId = user.userId,
        $document = $(document),
        CartMonitor = {
            setCount: function (count) {
                //console.log(count);
                this.$el.text(count);
                if (count > 1)
                    $('[data-mz-text="carttext"]').text('');
                else
                    $('[data-mz-text="carttext"]').text('');
					// the below code commented by amit , beacuse we are not creating the cookie for mini cart count
                /*savedCounts[userId] = count;
                $.cookie('mozucartcount', JSON.stringify(savedCounts), { path: '/' });*/
            },
            addToCount: function (count) {
                this.setCount(this.getCount() + count);
            },
            getCount: function () {
                return parseInt(this.$el[0].textContent,10) || 0;
            },
            update: function () {
                api.get('cartsummary').then(function (summary) {
				CartMonitor.setCount(summary.count());
				// comment by amit
                   /* $document.ready(function () {
                        CartMonitor.setCount(summary.count());
                    });*/
                });
            }
        },
        savedCounts,
        savedCount;
// The below code comment by amit, because we are not using it.
    /*
	try {
        savedCounts = JSON.parse($.cookie('mozucartcount'));
    } catch (e) { }

    if (!savedCounts) savedCounts = {};
    savedCount = savedCounts && savedCounts[userId];

    if (isNaN(savedCount)) {
        CartMonitor.update();
    }
*/
    $(document).ready(function() {
        //console.log(savedCount);
		CartMonitor.update();// making API call to get the mini cart count by Amit
        CartMonitor.$el = $('[data-mz-role="cartmonitor"]').text(savedCount || 0);
        if (savedCount > 1)
            $('[data-mz-text="carttext"]').text('');
        else
            $('[data-mz-text="carttext"]').text('');
        /* Updates DOM with proper cart link in header based on cookie value */
        if(typeof $.cookie("isSubscriptionActive") !== "undefined") {
            if($(window).width() < 768) {
                $(document).find('#mb_cart').attr('href','/subscriptions');
            } else {
                $(document).find('.mz-utilitynav a.mz-utilitynav-link-cart').attr('href','/subscriptions');
                $(document).find('.jb-minicart-checkout-container .cart-checkout-buttons').find('a').attr('href','/subscriptions');
                $(document).find('.jb-minicart-checkout-container .cart-checkout-buttons').find('#cartform').attr('action','/subscriptions');
            }
        } else {
            if($(window).width() < 768) {
                $(document).find('#mb_cart').attr('href','/cart');
            } else {
                $(document).find('.mz-utilitynav a.mz-utilitynav-link-cart').attr('href','/cart');
                 $(document).find('.jb-minicart-checkout-container .cart-checkout-buttons').find('a').attr('href','/cart');
                $(document).find('.jb-minicart-checkout-container .cart-checkout-buttons').find('#cartform').attr('action',require.mozuData('pagecontext').secureHost+'/checkout');
            }
        }
        
    });

    return CartMonitor;

});

