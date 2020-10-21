require(["modules/jquery-mozu", 
"underscore", "hyprlive", "modules/backbone-mozu", "modules/api"],
function ($, _, Hypr, Backbone, api) {
    

    $(document).ready(function () {
        
        
        var t = api.context.tenant;
        var s = api.context.site;
        var filepath="//cdn-sb.mozu.com/"+t+"-"+s+"/cms/"+s+"/files/";
        var data = require.mozuData('special-plp-widget');
        
        console.log(data);
        
        var stringData = JSON.stringify(require.mozuData('special-plp-widget'));
        updateView();
        
        setInterval(function () {
            if(JSON.stringify(require.mozuData('special-plp-widget')).length > 0 ){
                if( stringData != JSON.stringify(require.mozuData('special-plp-widget')) ){
                    updateView();            
                }
            }
        }, 1000);
        
        
        function updateView(){
            stringData = JSON.stringify(require.mozuData('special-plp-widget'));
            data = require.mozuData('special-plp-widget');
            $.each(data.products, function( index, value ) {
                if($('a[wi-identi-fyer="'+value+'"]').length > 0){
                    $('a[wi-identi-fyer="'+value+'"]')[0].innerHTML = data.linkName; 
                }
                updateRevieStar(value);
            });
            updateImageSize();
        }
        function updateImageSize(){
            stringData = JSON.stringify(require.mozuData('special-plp-widget'));
            data = require.mozuData('special-plp-widget');
            $.each($('.configured-plp-imgsrc'), function( index, value ) {
                index = value.src.indexOf('?max=');
                value.src = value.src.substring(0,index);
                value.src += "?max="+data.imgSize;
            });
            $('.config-plp-item').css({'width':data.imgSize+'px'});
            if(!data.rating)$('.configured-plp-rating').css({'display':'none'});
            if(!data.review)$('.configured-plp-reviews').css({'display':'none'});
            if(!data.showHideSpecialButton)$('.configured-plp-specialLink').css({'display':'none'});
        }
            
        function updateRevieStar(value){
            stringData = JSON.stringify(require.mozuData('special-plp-widget'));
            data = require.mozuData('special-plp-widget');
            if(data.rating){
                var rate = $('#'+value+'-rating').val();
                var rateClass = "";
                
                if( rate === 0){
                    rateClass = 'zero';
                }else if( rate < 0.6 ){
                    rateClass = 'half';
                }else if( rate < 1.1 ){
                    rateClass = 'one';
                }else if( rate < 1.6 ){
                    rateClass = 'onehalf';
                }else if( rate < 2.1 ){
                    rateClass = 'two';
                }else if( rate < 2.6 ){
                    rateClass = 'twohalf';
                }else if( rate < 3.1 ){
                    rateClass = 'three';
                }else if( rate < 3.6 ){
                    rateClass = 'threehalf';
                }else if( rate < 4.1 ){
                    rateClass = 'four';
                }else if( rate < 4.6 ){
                    rateClass = 'fourhalf';
                }else {
                    rateClass = 'five';    
                }
                $('#'+value+'-rating-display').addClass(rateClass);
            }
        }    
        
    });
        
});

