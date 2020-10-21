require([
    "modules/jquery-mozu",
    "underscore", 
    "hyprlive", 
    "modules/backbone-mozu", 
    'modules/api', 
    'modules/models-product',
    'modules/cart-monitor',
    'modules/minicart'],
    function ($, _, Hypr, Backbone,Api,  ProductModels, CartMonitor,MiniCart) {
	 
	$(document).ready(function () {
        $(document).on('click', '.jb-add-to-cart', function(e) {
			e.preventDefault();
			$('[data-mz-productlist],[data-mz-facets]').addClass('is-loading');
            var $target = $(e.currentTarget), productCode = $target.data("mz-prcode");
            $('[data-mz-message-bar]').hide();
            $('#mybuyspagezone1').addClass('is-loading');
            
            var $quantity = $(e.target.parentNode.parentNode).find('#quantity')[0].options[$(e.target.parentNode.parentNode).find('#quantity')[0].options.selectedIndex];
            var count = parseInt($quantity.innerHTML,10);
            
                Api.get('product', productCode).then(function(sdkProduct) {
                    var PRODUCT = new ProductModels.Product(sdkProduct.data);
                    var variantOpt = sdkProduct.data.options;
                    
                    if(variantOpt !== undefined && variantOpt.length>0){  
                        var newValue = $target.parent().parent().find('[plp-giftcart-prize-change-action]')[0].value;
                        var ID =  $target.parent().parent().find('[plp-giftcart-prize-change-action]')[0].getAttribute('data-mz-product-option');
                        if(newValue != "Select gift amount" && newValue !== ''){
                            var option = PRODUCT.get('options').get(ID);
                            var oldValue = option.get('value');
                            if (oldValue !== newValue && !(oldValue === undefined && newValue === '')) {
                                option.set('value', newValue);
                            }
                            setTimeout(function(){
                                    addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                            },2000);
                        }else{
                            $('#mybuyspagezone1').removeClass('is-loading');
                        }
                    }else{
                        addToCartAndUpdateMiniCart(PRODUCT,count,$target);
                    }
                });
            
            
        });

	});
	
	function addToCartAndUpdateMiniCart(PRODUCT,count,$target){
                    PRODUCT.set({'quantity':count});
                    $('#mybuyspagezone1').addClass('is-loading');
                    PRODUCT.addToCart(1);
                    PRODUCT.on('addedtocart', function(attr) {
                        $('[data-mz-productlist],[data-mz-facets]').removeClass('is-loading');
                        $('#mybuyspagezone1').removeClass('is-loading');
                        CartMonitor.update();
                        MiniCart.MiniCart.showMiniCart();
                        PRODUCT = ''; 
                    });
                Api.on('error', function (badPromise, xhr, requestConf) {
                    $('#mybuyspagezone1').removeClass('is-loading');
                });
        }
	});