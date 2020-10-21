require(['modules/backbone-mozu',
		'underscore',
		'modules/jquery-mozu',
		'modules/api',
		'modules/models-product',
		'modules/models-cart',
		'modules/cart-monitor',
		'modules/minicart'
	],
	function (Backbone,
		_,
		$,
		Api,
		ProductModels,
		CartModels,
		CartMonitor,
		MiniCart) {

	$(document).ready(function () {
		var url = location.href;
		var sku = url.split("=")[1];
		Api.get('product', sku).then(function (product) {
			
			$('#productImage').append('<img src="' + product.data.content.productImages[0].imageUrl + '?max=300" />');
			$('#productDescription').html(product.data.content.productShortDescription);
			$('#productName').html(product.data.content.productName);
			$('#productInfo').html('<h3>Product Info</h3>' + product.data.content.productFullDescription);

			var domain = '';
			if(location.href.indexOf('sandbox.mozu.com') > -1)
				domain = ".sandbox.mozu.com";
			else
				domain = ".jellybellyretailer.com";
			var promosViewed = $.cookie("promosViewed") ? decodeURIComponent($.cookie("promosViewed")).split(';;;') : [];
			if (promosViewed.indexOf(sku) === -1) {
				promosViewed.push(sku);
				promosViewed.push(product.data.content.productName);
			}
			$.cookie("promosViewed", encodeURIComponent(promosViewed.join(';;;')), { 
				domain: domain,
                path: '/',
                expires: 7
			});

			// store sku in te product description / add table on front page "view promo products"
			// javascript to read from quiery stringData
		}, function (error) {
			console.log('product not found');
			$('#error-result').html('<h2>There was an error looking up the product.  Please try again.</h2>');
			 
			$('#productInfo').css({
				display : "none"
			});
			   
		});
	});

});
