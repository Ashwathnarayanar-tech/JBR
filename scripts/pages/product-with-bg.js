require(["modules/jquery-mozu", 
"underscore", "hyprlive", "modules/backbone-mozu", "modules/api"],
function ($, _, Hypr, Backbone, api) {
    

    $(document).ready(function () {
        
        
        var t = api.context.tenant;
        var s = api.context.site;
        var filepath="//cdn-sb.mozu.com/"+t+"-"+s+"/cms/"+s+"/files/";
        var data = require.mozuData('product-with-bg');
        console.log(data);
        var stringData = JSON.stringify(require.mozuData('product-with-bg'));
        updateView();
        
        setInterval(function () {
            if(JSON.stringify(require.mozuData('product-with-bg')).length > 0 ){
                if( stringData != JSON.stringify(require.mozuData('product-with-bg')) ){
                    updateView();            
                }
            }
        }, 1000);
        
        
        function updateView(){
            stringData = JSON.stringify(require.mozuData('product-with-bg'));
            data = require.mozuData('product-with-bg');
            $.each(data.products, function( index, value ) {
                if($('a[wi-identi-fyer="'+value+'"]').length > 0){
                    $('a[wi-identi-fyer="'+value+'"]')[0].innerHTML = data.linkName; 
                }
            });
            
            $('img[wi-prduct-image]')[0].src = data.bgImg;
            
            $('a[wi-link]')[0].innerHTML = data.name1;
            $('a[wi-link]')[1].innerHTML = data.name2;
            
            $('a[wi-link]')[0].href = data.url1;
            $('a[wi-link]')[1].href = data.url2;
        }
    });
        
});


