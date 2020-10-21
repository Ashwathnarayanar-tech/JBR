require([
    "modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    "modules/api"], function ($, Hypr, Backbone, api) {
	 

    $(document).ready(function(){
           
            var data =  require.mozuData('shop_featured_categories');
            loadData();
            setInterval(function () {
                if(typeof  require.mozuData('home_featured_categories') != 'undefined')
                {
                    if( data.length !=  require.mozuData('shop_featured_categories').length){
                        data =  require.mozuData('shop_featured_categories');
                        loadData();
                    }else{
                        var tempData = require.mozuData('shop_featured_categories');
                        var stopLoop = true;
                        $(data).each(function(index,id){
                            if(id != tempData[index] && stopLoop){
                                data =  require.mozuData('shop_featured_categories');
                                loadData();
                                stopLoop = false;
                            }
                        });
                    }
                }
            }, 1000);
           
            
            
            function loadData(){
                var length = data.length;
                var arrayOfData = [], result = [];
                var i = 0;          
                $(data).each(function(index,catId){
                    var categorydetailsurl = '/api/commerce/catalog/storefront/categories/'+catId+'?allowInactive=true';    
                    api.request('GET',categorydetailsurl).then(function(dataretrived){
                        
                            dataretrived.content.categoryId =dataretrived.categoryId;
                            if(dataretrived.content.categoryImages[0])dataretrived.content.logo = dataretrived.content.categoryImages[0].imageUrl; 
                            if(dataretrived.content.categoryImages[1])dataretrived.content.banner = dataretrived.content.categoryImages[1].imageUrl; 
                            if(dataretrived.content.categoryImages[2])dataretrived.content.logoBGI = dataretrived.content.categoryImages[2].imageUrl; 
                        
                        
                        
                        arrayOfData[i++] = dataretrived.content;
                        if(arrayOfData.length == length){
                        
                            data.forEach(function(key) {
                            var found = false;
                                arrayOfData = arrayOfData.filter(function(item) {
                                    if(!found && item.categoryId == key) {
                                        result.push(item);
                                        found = true;
                                        return false;
                                    } else 
                                        return true;
                                });
                            });
                            
                            $('#jb-ourproducts-brand-lister').empty();            
                            $('#jb-ourproducts-brand-lister').append(Hypr.getTemplate('modules/shop-our-product-brands-listing').render({model: result}));
                        }
                    },function(dataError){
                        
                    });
                });
            }
    });

});



