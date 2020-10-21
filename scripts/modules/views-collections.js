
define([
    'backbone',
    'underscore', 
    'modules/jquery-mozu',
    'modules/models-product', 
    'modules/url-dispatcher',
    'modules/intent-emitter',
    'modules/get-partial-view','hyprlive','modules/api','modules/models-faceting'        
    ], function(Backbone, _, $, ProductModels,UrlDispatcher, IntentEmitter, getPartialView, Hypr, api, FacetingModels) {

        function factory(conf) {

            var _$body = conf.$body;
            var _dispatcher = UrlDispatcher; 
            var ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND';
            var promodel ,flag,lastpage,loadMore = false;
            var defaultpagesize = window.defaultpagesize = 15;  

            function updateUi(response) { 
                var url = response.canonicalUrl;
                var $oattr;
                var info_url,$quickviewdiv,firstitem;
                if(loadMore) {
                    $oattr = $(response.body).find("ul#mz-productlist-list.gridder > li");
                    $quickviewdiv = $(response.body).find(".gridder-content.quickview");
                    var str = '';
                    var strquick = '';
                    var length =  $(document).find('.mz-productlist-grid').children().length;
                    var itemtofocus; 
                    $oattr.each(function(j) {
                        var td = length + j + 1;
                        if(j === 0){
                            firstitem = td;
                        }
                        itemtofocus = td;
                        $(this).attr("data-griddercontent", "#" + td);          
                        str = str+ $(this)[0].outerHTML;      
                    }); 
                    $quickviewdiv.each(function(k){
                        $(this).attr('id',(length+k+1));
                        strquick = strquick + $(this)[0].outerHTML; 
                    });
                    window.loadmore=loadMore;
                    _$body.find("ul#mz-productlist-list.gridder").append(str); 
                    _$body.find('.gridder-content.quickview').last().after(strquick);
                    _$body.find(".load-more-prod").html($(response.body).find(".load-more-prod").html());
                    _$body.find("label.mz-pagingcontrols-pagesize-label").html($(response.body).find("label.mz-pagingcontrols-pagesize-label").html());
                    $(document).find('div[data-mz-productlist]').removeClass('is-loading');
                    $(document).find('.jb-add-to-cart').text('Add to Cart');
                    $(document).find('.show-popup-confirmation').text('Add to Cart');
                    $(document).find('.jb-add-to-cart').removeClass('grey-out');  
                    $(document).find('.show-popup-confirmation').removeClass('grey-out');  
                    var data= require.mozuData('facetedproducts') ; 
                    info_url = getUrlParms(window.location.href);  
                    if(info_url.pageSize){
                        if((parseInt(info_url.startIndex,10)+parseInt(info_url.pageSize,10)) > data.totalCount){
                            lastpage = data.totalCount;
                        }else{   
                            lastpage =  (parseInt(info_url.startIndex,10)+parseInt(info_url.pageSize,10));  
                        } 
                    }else{ 
                        if((parseInt(info_url.startIndex,10)+window.defaultpagesize) > data.totalCount){
                            lastpage = data.totalCount;
                        }else{ 
                            lastpage =  (parseInt(info_url.startIndex,10)+window.defaultpagesize);   
                        }  
                    }
                    if(info_url.startIndex && data.pageSize){    
                        $(document).find('.jb-result-details .heading-jb-result').html($(document).find('.jb-result-details .heading-jb-result').html().split('-')[0]+" - "+lastpage+" of "+$(document).find('.jb-result-details .heading-jb-result').html().split('-')[1].split('of')[1]); 
                    }
                    if(window.loadAll && (parseInt(lastpage,10) < parseInt(data.totalCount,10))){  
                        if(window.pageFlag){window.pageValue = info_url.startIndex;window.pageFlag = false;}
                        $(document).find('#load-all').click();
                    }else{  
                        window.loadAll = false;  
                    }   
                    //var remainingCount = (data.totalCount-lastpage)>500?500:(data.totalCount-parseInt(lastpage,10));
                    $(document).find('#load-all').html('Show All ('+data.totalCount+')');
                    $(document).find('div[data-mz-productlist]').removeClass('is-loading'); 
                    promodel= new FacetingModels.FacetedProductCollection(data); 
                    // promodel.get('items').push(JSON.parse($(response.body)[2].innerHTML).items); 
                    initRecProd();
                    labelShow();
                    window.updatecatfilter(); 
                }else{
                    _$body.html($(response.body).find(".mz-l-container").children());     
                    var data1= require.mozuData('facetedproducts') ;  
                    info_url = getUrlParms(window.location.href);  
                    $(document).find('div[data-mz-productlist]').removeClass('is-loading');
                    $(document).find('.jb-add-to-cart').text('Add to Cart');
                    $(document).find('.show-popup-confirmation').text('Add to Cart');
                    $(document).find('.jb-add-to-cart').removeClass('grey-out');  
                    $(document).find('.show-popup-confirmation').removeClass('grey-out');  
                    var count =1; $(document).find('.gridder-list').each(function(){
                        $(this).attr('data-griddercontent','#'+count); 
                        count++; 
                    });
                    setTimeout(function(){ 
                        $(document).find('.gridder-list[data-griddercontent="#1"]').find('.mz-productlisting-image').find('a').focus();
                        if($(document).find('.selected-facet-value').length >= 1){
                        $(document).find('.clear-all-outer-btn').addClass('active');
                        //$(document).find('.resetlayover').removeClass('hide');
                    }else{
                        $(document).find('.clear-all-outer-btn').removeClass('active');
                        //$(document).find('.resetlayover').addClass('hide');
                    }
                    }, 1000); 
                    promodel= new FacetingModels.FacetedProductCollection(data1); 
                    initRecProd();
                    labelShow();      
                    window.updatecatfilter(); 
                } 

                if($(document).find('.selected-facet-value').length >= 1){
                    $(document).find('.clear-all-outer-btn').addClass('active');
                    
                }else{ 
                    $(document).find('.clear-all-outer-btn').removeClass('active');
                    
                }
                if($(document).find('.selected-facet-mobile').length >= 1){
                    $(document).find('.tz-mobileSelected-filter').addClass('active');  
                    $(document).find('.mz-refine-search').addClass('active');
                }else{
                    $(document).find('.tz-mobileSelected-filter').removeClass('active');
                    $(document).find('.mz-refine-search').removeClass('active'); 
                }
                if (url) _dispatcher.replace(url); 
                _$body.removeClass('mz-loading');   
            }

            function labelShow(){
                var one_day=1000*60*60*24;     
                var comingSoonData = Hypr.getThemeSetting('comingSoonThresholds').split(',');
                var comingSoon = [];
                _.each(comingSoonData, function(pair) { var tmpArray = pair.split('='); 
                    comingSoon[tmpArray[0]] = parseInt(tmpArray[1],10); 
                });
                $('.mz-productlist-item').each(function(){ 
                    var productDate =$(this).attr('createDate').substring(0,10).replace(/\//g,'-').trim(); 
                    var currentDate = $('#currentDate').text(); 
                    var x = productDate.split('-'); 
                    var y = currentDate.split('-');    
                    var date1 = new Date(x[2],x[0]-1,x[1]);     
                    var date2 = new Date(y[2],y[1]-1,y[0]);
                    var days = Math.ceil((date2.getTime()-date1.getTime())/(one_day)); 

                    if($(this).attr('productType') !== "Gift Certificate"){
                        if ( days >= 0 && $(this).attr('onlineStockAvailable') === 0) {
                            $('div[data-mz-product='+$(this).attr('data-mz-product')+']').find('.product-sale-new-label').show().css({ "background-color" : "#000099", "line-height" : "8px"}).html("<span style='font-size: 10px;'>COMING</span><br><span style='font-size: 9px;'>SOON</span>");
                        }else if(days <= Hypr.getThemeSetting('newLabelThreshold') && days >= 0 && $(this).attr('price') == $(this).attr('salePrice')){
                            $('div[data-mz-product='+$(this).attr('data-mz-product')+']').find('.product-sale-new-label').show();
                        }
                    }
                });    
            }
 
            function initRecProd(){
                if($(window).width() < 768){  
                    var owlMBRP = $(document).find('.MB_PRODUCTSLOT').parent(); 
                    owlMBRP.owlCarousel({
                        center          :true,
                        loop            :true,
                        nav             :true,
                        margin          :2,
                        dots            :false,
                        responsive:{
                            0:{
                                items:1
                            },
                            400:{
                                items:1
                            },
                            600:{
                                items:1
                            },
                            800:{
                                items:1
                            }
                        }
                    });
                }
                $(document).find('.recommended-product').show();
            }   

            function showError(error) {
            // if (error.message === ROUTE_NOT_FOUND) {
            //     window.location.href = url;
            // }
            _$body.find('[data-mz-messages]').text(error.message);
        } 

        function getUrlParms(url) {
            var vars = [], hash;
            var hashes = url.slice(url.indexOf('?') + 1).split('&');
            for(var i = 0; i < hashes.length; i++)
            {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars; 
        }

        function intentToUrl(e) {
            loadMore=false; 
            $(document).find('div[data-mz-productlist]').addClass('is-loading'); 
            var oldurl = window.location.pathname+window.location.search; 
            if($(e.currentTarget).hasClass('mz-facetingform-clearall')){
                $(document).find('.selected-facet-value').remove();  
                $('.clear-all-outer-btn').removeClass('active');   
                $(document).find('.item-name').removeClass('mz-facetform-selected');
            } 
            e.preventDefault(); 
            var elm = e.target;
            var url;
            if (elm.tagName.toLowerCase() === "select") { 
                elm = elm.options[elm.selectedIndex];
            }
            
            if(elm.getAttribute('data-mz-url')){
                url = elm.getAttribute('data-mz-url') || elm.getAttribute('href') || '';
            }
            else if($(elm).siblings().attr('data-mz-url')){
                url=$(elm).siblings().attr('data-mz-url');
            }
            else{
                url = elm.parentElement.getAttribute('data-mz-url') || elm.parentElement.getAttribute('href') || elm.getAttribute('href') || '';
            }
            if (url && url[0] != "/") {
                var parser = document.createElement('a');
                parser.href = url;
                url = parser.pathname + parser.search;
                url = window.location.pathname + parser.search;
                if(elm.getAttribute('rel')=="next"){
                    loadMore=true;
                }else if(elm.getAttribute('rel')=="all"){
                    loadMore=true;
                    window.loadAll = true;
                }else{
                    loadMore=false;
                }
            }
            var strurl = '',hashes = [],i = 0,hash = [];
            var params = getUrlParms(url); 
            if(params.pageSize && params.pageSize > window.defaultpagesize){
                hashes = url.slice(url.indexOf('?') + 1).split('&');
                strurl = url.split('?')[0]+"?";
                for(i = 0; i < hashes.length; i++){
                    hash = hashes[i].split('='); 
                    if(hash[0] == "startIndex" && parseInt(hash[1],10) != parseInt(elm.getAttribute('lastInedx'),10)) strurl = strurl+"startIndex="+elm.getAttribute('lastInedx')+"&";
                    if(hash[0] == "startIndex" && params.pageSize == 500 && parseInt(hash[1],10) == parseInt(elm.getAttribute('lastInedx'),10)) strurl = strurl+"startIndex="+elm.getAttribute('lastInedx')+"&";
                    if(hash[0] == "startIndex" && params.pageSize != 500 && parseInt(hash[1],10) == parseInt(elm.getAttribute('lastInedx'),10)) strurl = strurl+hashes[i]+"&"; 
                    if(hash[0] != "pageSize" && hash[0] != "startIndex") strurl = strurl+hashes[i]+"&"; 
                    if(elm.getAttribute('rel')=="next-old" && hash[0] == "pageSize") strurl = strurl+hashes[i]+"&";
                } 
                if(strurl.substr(strurl.length - 1) == '&') strurl = strurl.substring(0,strurl.length - 1);   
                if(elm.getAttribute('rel') != "next-old" && elm.getAttribute('rel') != "all") strurl = strurl +"&pageSize="+window.defaultpagesize; 
                if(elm.getAttribute('rel') == "all") strurl = strurl +"&pageSize=500"; 
                if(strurl.indexOf('startIndex') == -1) strurl = strurl +"&startIndex="+elm.getAttribute('lastInedx');   
            }else if(elm.getAttribute('rel') == "all"){
                hashes = url.slice(url.indexOf('?') + 1).split('&');
                strurl = url.split('?')[0]+"?";
                for(i = 0; i < hashes.length; i++){          
                    hash = hashes[i].split('='); 
                    if(hash[0] == "startIndex" && parseInt(hash[1],10) != parseInt(elm.getAttribute('lastInedx'),10)) strurl = strurl+"startIndex="+elm.getAttribute('lastInedx')+"&"; 
                    if(hash[0] == "startIndex" && parseInt(hash[1],10) == parseInt(elm.getAttribute('lastInedx'),10)) strurl = strurl+hashes[i]+"&"; 
                    if(hash[0] != "pageSize" && hash[0] != "startIndex") strurl = strurl+hashes[i]+"&"; 
                    if(elm.getAttribute('rel')=="next-old" && hash[0] == "pageSize") strurl = strurl+hashes[i]+"&";
                } 
                if(strurl.substr(strurl.length - 1) == '&') strurl = strurl.substring(0,strurl.length - 1);   
                if(elm.getAttribute('rel') != "next-old" && elm.getAttribute('rel') != "all") strurl = strurl +"&pageSize="+window.defaultpagesize; 
                if(elm.getAttribute('rel') == "all") strurl = strurl +"&pageSize=500"; 
            } 
            if(url == oldurl) {
                $(document).find('#unbxd_results_container').removeClass('is-loading');
                $(document).find('.jb-inner-overlay').hide();
            } 
            if(strurl && strurl !== ''){ return strurl; }else{ return url;}  
        }
        
         
           
        var navigationIntents = IntentEmitter(  
            _$body,
            [      
            'click [data-mz-pagingcontrols] a',
            'click [data-mz-pagenumbers] a',
            //'click a[data-mz-facet-value]',
            'click [data-mz-action="clearFacets"]',
            //'click [data-mz-facet-value]',
            'change [data-mz-value="pageSize"]',
            'click  [data-mz-value="sortBy"]',
            'click  [data-mz-value="sortMob"]',
            'click #color1',
            'click #load-more',
            'click #load-all'
            ],
            intentToUrl
            );

        navigationIntents.on('data', function(url, e) {
            if (url && _dispatcher.send(url)) {
                _$body.addClass('mz-loading');
                e.preventDefault();
            }
        });

        _dispatcher.onChange(function(url) {
            getPartialView(url, conf.template).then(updateUi, showError);   
        });
        
        
				
				$(document).on('click','#dd',function(){
				     $(this).toggleClass('active');
				     
                    return false;
				});
			//var opts = $(document).find('#dd').find('ul.dropdown > li');
			/*$(document).on('click','ul.dropdown > li',function(e){
			       if($('.sortlab').hasClass('active')){
			          $('.sortdefval').hide();
			          $('.wrapper-dropdown-1').addClass('active'); 
			       }
			       
			      //window.srlab = e.currentTarget.firstElementChild.innerText;
			      //window.srval = e.currentTarget.lastElementChild.innerText;
			     //$('#dd').find('.sortselected').innerText;
			     //$( "span.sortselected" ).replaceWith( "<span class='sortselected'>+srlab+ +srval+</span>" );
			     //$(this).text();
			     //$(this).index();
			     //$(this).val;
			});*/
				$(document).click(function() {
					// all dropdowns
					$('.wrapper-dropdown-1').removeClass('active');
				});
       
        function formcustomurl(){
            var required_url = window.location.href; 
            var data_url = '';
            var url_main = '?';
            if(decodeURIComponent(required_url).split('?').length > 1){
                if( decodeURIComponent(required_url).split('?')[1] != "#maincontent"){ 
                    required_url = decodeURIComponent(required_url).split('?')[1].split('&');
                    for(var i =0; i< required_url.length;i++ ){
                        if(required_url[i].indexOf("facetValueFilter") == -1 && required_url[i].indexOf("startIndex")){ 
                            url_main = url_main+required_url[i];    
                        }    
                    }
                }
            }  
            if(url_main.length > 1){
                data_url = data_url+'&facetValueFilter=';   
            }else{
                data_url = data_url+'facetValueFilter=';     
            }   
            var selecterfilterobj = $(document).find('.facet-name-list').find('.selected-facet-value');
            selecterfilterobj.each(function(){
                var filter = $(this).attr('url-component'); 
                data_url = data_url+filter+',';
            }); 
            var needed_url = url_main+data_url;  
            return needed_url; 
        }
        
         $(document).on('click','.apply-filter-button',function(e){ 
            var needed_url = formcustomurl();
            $(e.currentTarget).attr('data-mz-url',needed_url);  
            var url=intentToUrl(e);
            var selecterfilterobj = $(document).find('.facet-name-list').find('.selected-facet-value').filter(':visible');
            //  setFacetValueMobile(e); 
            if($(document).find('.selected-facet-value').length >= 1){ 
                        $('.clear-all-outer-btn').addClass('active');
                        
                    }else{
                        $('.clear-all-outer-btn').removeClass('active');    
                         
                    }
                $(document).find('.filter-list,.pointer-filter,.container-filter').removeClass('active');
                $(document).find('.facets-type-list').find('.facete-type-li').removeClass('active');
                $(document).find('.facet-name-list').find('.mz-l-sidebaritem').removeClass('active');
            if(url){
                if (url && _dispatcher.send(url)) { 
                    _$body.addClass('mz-loading'); 
                    e.preventDefault(); 
                }    
            }           
        });
        
        $(document).on('click','.cross-btn-facets',function(e){
            $(e.currentTarget).parents('.item-name').remove();
            var needed_url = formcustomurl();
            $('.hidden-element-to-apply').attr('data-mz-url',needed_url);
            $('.hidden-element-to-apply').click();
        });
        
        $(document).on('keydown','.cross-btn-facets',function(e){
            if(e.which == 13 || e.which == 32){ 
                $(document.activeElement).remove(); 
                var needed_url = formcustomurl(); 
                $('.hidden-element-to-apply').attr('data-mz-url',needed_url);
                $('.hidden-element-to-apply').click();
            }
        });
        
        

        $(document).on('click','.hidden-element-to-apply',function(e){  
           var url=intentToUrl(e);
         //  setFacetValueMobile(e);
         if(url){
           if (url && _dispatcher.send(url)) {
            _$body.addClass('mz-loading');
            e.preventDefault();
        }    
    }

});

        $(document).on('click','.tzPopup-Done',function(e){
           
            var required_url = window.location.href;
            var data_url = '';
            var url_main = '?';
            var filter_url = "";
            if(decodeURIComponent(required_url).split('?').length > 1){
                required_url = decodeURIComponent(required_url).split('?')[1].split('&');
                for(var i =0; i< required_url.length;i++ ){
                    if(required_url[i].indexOf("facetValueFilter") == -1 && required_url[i].indexOf("startIndex")){ 
                        url_main = url_main+required_url[i];    
                    } else if(required_url[i].indexOf("facetValueFilter")){
                        filter_url = required_url[i].split('=')[1] ;   
                    }  
                }
            } 
            if($(document).find('.tzPopup-content .selected-facet-mobile').length > 0 || ($(document).find('.tzPopup-content .selected-facet-mobile').length < 1 && filter_url.length > 0)){
                if(url_main.length > 1){
                    data_url = data_url+'&facetValueFilter=';   
                }else{
                    data_url = data_url+'facetValueFilter=';     
                }   
                $(document).find('.tzPopup-content .selected-facet-mobile').each(function(){
                    var filter = $(this).children('a').attr('attr-require'); 
                    data_url = data_url+filter+',';
                }); 
                var needed_url = url_main+data_url;  
                $(e.currentTarget).attr('data-mz-url',needed_url);  
                var url=intentToUrl(e);
                //  setFacetValueMobile(e);
                if(url){
                    if (url && _dispatcher.send(url)) { 
                        _$body.addClass('mz-loading'); 
                        e.preventDefault(); 
                    }    
                } 
            }
        });
 
        $(document).on('click','.remove-filter-one',function(e){ 
            var valreq = $(e.currentTarget).attr('attr-filter'); 
            $(this).parents('.selected-facet-mobile').remove();
            $(document).find('.mz1-facetingform-value').each(function(){
                if($(this).attr('data-mz-facet-value-mobile')==valreq){
                    $(this).parents('li').removeClass('mz-facetform-selected');
                    $(this).find('.mz1-selectcolr').hide(); 
                }
            }); 
            if($(document).find('.selected-facet-mobile').filter(':visible').length >= 1){
                $(document).find('.tz-mobileSelected-filter').addClass('active');  
                $(document).find('.mz-refine-search').addClass('active');
            }else{
                $(document).find('.tz-mobileSelected-filter').removeClass('active');
                $(document).find('.mz-refine-search').removeClass('active'); 
            }
        }); 
         
        $(document).on('click','.mz-reset-filter',function(e){
            var url=intentToUrl(e);
                //  setFacetValueMobile(e);
                if(url){
                    if (url && _dispatcher.send(url)) { 
                        _$body.addClass('mz-loading'); 
                        e.preventDefault(); 
                    }    
                }    
                $(document).find('.selected-facet-mobile').remove(); 
                $(document).find('.mz-facetform-selected').removeClass('mz-facetform-selected');
                $(document).find('.tz-mobileSelected-filter').removeClass('active');
                $(document).find('.mz-refine-search').removeClass('active');
         });
        
        

    }
    
    $(document).ready(function(){ 
        var pageValue = window.pageValue = 0;
        var pageFlag = window.pageFlag = true;
        var width1 = $( window ).width();
        if(width1 > 1024){ 
            $(document).on({
                mouseenter: function () {
                    if(!$(this).parent().parent().parent().hasClass('mz-productlist-list')){
                    $(this).parent().find('.img-overlay').show();
                    $(".gridder-expanded-content .img-overlay").hide();
                     }
                },
                mouseleave: function () {
                    $('.img-overlay').hide();
                }
            }, ".mz-productlisting-image, .img-overlay");
        }
        $('.stock').show();
        $(document).find('.jb-add-to-cart').text('Add to Cart');
        $(document).find('.show-popup-confirmation').text('Add to Cart');
        $(document).find('.jb-add-to-cart').removeClass('grey-out');  
        $(document).find('.show-popup-confirmation').removeClass('grey-out');  
        //pagination mobile
        var page = parseInt($('.mob-current').html(),10);
        if($('.mob-previous')){
            $('.mob-previous').html(page-1);
        }
         //Incrementing Data Attributes
         var $oattr = $('[data-griddercontent]');
         $oattr.each(function(j) {
            var td = j+1;
            $(this).attr("data-griddercontent", "#" + td); 
        });

        // Incremeting Id values 
        var $oid = $('.gridder-content');
        $oid.each(function(i) {
            var tp = i+1;
            $(this).attr('id', tp); 
        });
        var width= $(window).width();

     //    if(width>1000){
     //     $(".gridder").gridderExpander({
     //        scrollOffset: 310,
     //            scrollTo: "panel", // "panel" or "listitem"
     //            animationSpeed: 400,
     //            animationEasing: "easeInOutExpo",
     //            onStart: function () {
     //            },
     //            onExpanded: function (object) {
     //                $(".carousel").carousel(); 
     //            },
     //            onChanged: function (object) {
     //            },
     //            onClosed: function () {
     //                $(".jb-quickviewdetails .jb-buy-product").css("visibility","visible");
     //                 //$(".selectedItem .jb-quickviewdetails .jb-buy-product").show();
     //             },
     //             onContent: function() {
     //                $(".jb-quickviewdetails .jb-buy-product").css("visibility","visible");
     //                $(".selectedItem .jb-quickviewdetails .jb-buy-product").css("visibility","hidden");

     //            }
     //        });
     // }

        //mobile
        $(document).find('.mz-l-sidebaritem-new').each(function(){
            if($(this).html().trim() === ''){
                $(this).remove();      
            }
        });
        // select first element in mobile filter
        $(document).find(".mz-l-sidebaritem-new").first().find('h4').addClass('selected');
        $(document).find(".mz-l-sidebaritem-new").first().find('h4').find('span').removeClass('mz-close-facet');
        $(document).find(".mz-l-sidebaritem-new").first().find('h4').find('span').addClass('mz-open-facet');
        
        if($(document).find('.selected-facet-mobile').length >= 1){
            $(document).find('.tz-mobileSelected-filter').addClass('active');  
            $(document).find('.mz-refine-search').addClass('active');
        }else{
            $(document).find('.tz-mobileSelected-filter').removeClass('active');
            $(document).find('.mz-refine-search').removeClass('active'); 
        }
        
        $(document).on('click','[jb-mobSort]',function (e) {
            $('.mz-pagesort-mobile').slideDown('slow');
        });   
        
        
        // loop in mobile sort
        function loopmobilesort(){ 
            window.sortinputs = $(document).find('.jb-mobile-sort').find('.jb-mobile-sort-cancel,[data-mz-value="sortMob"]').filter(':visible');   
            window.sortfirstInput = window.sortinputs.first();
            window.sortlastInput = window.sortinputs.last(); 
            
            
            
             
        }
        
        // mobile sort close button

        $(document).on('click','.jb-mobile-sort-icon,.jb-mobile-sort-cancel-label',function(){  
            $('.mz-pagesort-mobile').slideUp('slow');
        });  
 
        
        var $facetPanelMobile = $('[data-mz-facets-mobile]');
        if ($facetPanelMobile.length > 0) { 
            // Mobile Refine
            $('.tz-Facets').each(function() {
                $('<div id="tz-refinePopup" class="mz-mobile"><div tabindex="0" id="tz-mobilePopmenu"><span tabindex="0" role="button" aria-label="click to close overlay" class="tzPopup-exit"></span></span><div class="tzPopup-body"><div class="tzPopup-content"></div></div></div><div id="tzMoboverlay"></div></div>')
                .appendTo('body').find('.tzPopup-content').append($(this).html());
                $(this).empty(); 
            }).promise()
            .done(function() {
                  /*  views.facetPanelMobile = new ProductListViews.FacetingPanelMobile({
                    el: $('[data-mz-facets-mobile]'),
                    model: model*/
                //});
            });
            $(document).on('click','#tzMoboverlay,#tz-refinePopup .tzPopup-exit, .tzPopup-cancel',function (e) {
              e.preventDefault();
              $('#tz-mobilePopmenu.visible').addClass('transitioning').removeClass('visible');
              $('html').removeClass('overlay'); 
              $('#tz-refinePopup').hide();
                    $('body').css({'overflow' : 'visible'});// making the body visible
                    setTimeout(function () {
                        $('#tz-mobilePopmenu').removeClass('transitioning');
                    }, 200); 
               });
            $(document).on('click','.tz-mobRefine', function(e) {
                e.preventDefault(); 
                $('#tz-refinePopup').show();
                $('html').addClass('overlay');
                $('#tz-mobilePopmenu').addClass('visible');
                $('body').css({'overflow' : 'hidden'});
            });
            $(document).on("click",'.tzPopup-Done',function(e){
                $('#tz-mobilePopmenu.visible').addClass('transitioning').removeClass('visible');
                $('html').removeClass('overlay'); 
                $('#tz-refinePopup').hide();
                $('body').css({'overflow' : 'visible'});// making body visible
                setTimeout(function () {
                    $('#tz-mobilePopmenu').removeClass('transitioning');
                }, 200); 
                // $("html, body").animate({scrollTop:  $(".mz-productlist-grid").offset().top }, 900);
            });
            $(document).on('click', '.tz-mobileSelected-filter a', function(e) {
                e.preventDefault();
                var self = $(this);
                var facet=self.attr('class');
                var selectedFacets = $('[data-mz-facet-value-mobile]');
                for(var i=0;i<selectedFacets.length;i++){
                    if($(selectedFacets[i]).attr('data-mz-facet-value-mobile') == facet){
                      $(selectedFacets[i]).click();

                  }
              }
                //model.setFacetValue(self.attr('id'), self.attr('class'), false);
                setTimeout(function() {self.parent('span').remove();}, 500);                
            //  var selectedfacet = $('.selected-facet-mobile').size();
            
                /*if (selectedfacet <= 1) {
                    $('.tz-mobileSelected-filter').hide('slow');
                }*/ 
            });
        }  
/*        var newLabel=function(){
        
            var one_day=1000*60*60*24; 
            var products = require.mozuData('facetedproducts').items;       
            for(var i=0; i<products.length; i++){
                var productDate =products[i].createDate.substring(0,10);
                //var date= new Date();
                // var currentDate = date.getDate().toString()+'-'+date.getMonth().toString()+'-'+date.getFullYear().toString();
                var currentDate = $('#currentDate').text();
                var x = productDate.split('-'); 
                var y = currentDate.split('-');
                var date1 = new Date(x[0],x[1]-1,x[2]);
                var date2 = new Date(y[2],y[1]-1,y[0]);
                var days = Math.ceil((date2.getTime()-date1.getTime())/(one_day)); 

                if(days <= Hypr.getThemeSetting('newLabelThreshold') && days >= 0 && products[i].price.price == products[i].price.salePrice){
                    $('div[data-mz-product='+products[i].productCode+']').find('.product-sale-new-label').show();
                }
            } 
        };
        newLabel();
*/
        var productLabel = function(){
            var products = require.mozuData('facetedproducts').items;
            _.each(products, function(product) {
                var productState = _.find(product.properties, function(property) {
                    return property.attributeFQN === "tenant~product-state";
                });
                if (productState !== undefined){
                    if (productState.values[0].value === 'COMINGSOON')
                        $('div[data-mz-product='+product.productCode+']').find('.product-sale-new-label').show().css({ "background-color" : "#000099", "line-height" : "8px"}).html("<span style='font-size: 10px;'>COMING</span><br><span style='font-size: 9px;'>SOON</span>");
                    else if (productState.values[0].value === 'NEW')
                        $('div[data-mz-product='+product.productCode+']').find('.product-sale-new-label').show();
                }
            });
        };
        productLabel();
        
        var quickViewFun = {
            showquickview: function(e){
                var id = $(e.currentTarget).parents('.gridder-list').attr('data-griddercontent');
                var html = quickViewFun.makeHtml(id.replace("#",""));
                var flag = false;
                if(!$('.gridder-show').is(':visible')){
                    flag = true;
                }
                $('.gridder-show').remove(); 
                $('.gridder-list').removeClass('selectedItem');  
                //$('.gridder-list').addClass('showing-quickview');
                $('.gridder-list[data-griddercontent="'+id+'"]').after(html);
                $('.gridder-list[data-griddercontent="'+id+'"]').addClass('selectedItem'); 
                // $("html, body").animate({ 
                //     scrollTop: $(document).find(".selectedItem").offset().top - 80   
                // }, {
                //     duration: 200
                // });
                if(flag){
                    $('.gridder-show').slideDown();   
                }else{
                    $('.gridder-show').show();         
                } 
                $('.gridder-list[data-griddercontent="'+id+'"]').next('.gridder-show').focus();  
                quickViewFun.activateloopinginquickview();
            },   
            makeHtml: function(id){
                var str = '<div id="'+id+'" class="gridder-show" tabindex="-1">';    
                str = str + '<div class="gridder-padding"><div class="gridder-navigation"><a href="javascript:void(0)" class="gridder-close">Close</a><a href="javascript:void(0)" class="gridder-nav prev ">Previous</a><a href="javascript:void(0)" class="gridder-nav next ">Next</a></div><div class="gridder-expanded-content">'; 
                str = str + $(document).find('.gridder-list[data-griddercontent="#'+id+'"]').html();  
                str = str + '</div></div></div>';
                return str;
            },
            closeQuickView: function(e){
                e.preventDefault();
                // $("html, body").animate({ 
                //     scrollTop: $(document).find(".selectedItem").offset().top - 80 
                // }, { 
                //     duration: 200
                // });
                //$('.gridder-list').removeClass('showing-quickview');
                var contentid = $(e.currentTarget).parents('.gridder-show').attr('id');
                $(e.currentTarget).parents('.gridder-show').slideUp(500);   
                setTimeout(function(){
                    $(document).find('.gridder-show').remove();      
                },500);
                $('.gridder-list[data-griddercontent="#'+contentid+'"]').removeClass('selectedItem'); 
                $('.gridder-list[data-griddercontent="#'+contentid+'"]').find('.mz-productlisting-image').find('a').focus();  
            },
            activateloopinginquickview: function(){
                window.inputs = $(document).find('.gridder-show').find('select, input, textarea, button, a ').filter(':visible'); 
                window.firstInput = window.inputs.first();
                window.lastInput = window.inputs.last(); 
                
                // if current element is last, get focus to first element on tab press.
                window.lastInput.on('keydown', function (e) {
                 if ((e.which === 9 && !e.shiftKey)) {
                     e.preventDefault();
                     window.firstInput.focus(); 
                 }
             });
                
                // if current element is first, get focus to last element on tab+shift press.
                window.firstInput.on('keydown', function (e) {
                    if ((e.which === 9 && e.shiftKey)) {
                        e.preventDefault();
                        window.lastInput.focus(); 
                    }
                });  
            },
            addWishlistOnAuth: function(productCode, me) {
                var user = require.mozuData('user');
                if (!user.isAnonymous) {
                    $('.jb-inner-overlay').show(); 
                    api.request('get', '/api/commerce/catalog/storefront/products/' + productCode).then(function(res) {
                        var model = new ProductModels.Product(res);
                        model.addToWishlist();
                        model.on('addedtowishlist', function(cartitem) {
                            $('.jb-inner-overlay').hide(); 
                            me.prop('disabled', 'disabled').text(Hypr.getLabel('addedToWishlist'));
                        });  
                        model.on("error", function(err) {
                            $('.jb-inner-overlay').hide();
                            //console.error(err);
                        });
                    });
                }
            }
        }; 
        
        // wishlist functionality
        $(document).on('click', '[data-mz-productlist] .add-to-wishlist', function(e) {
            e.preventDefault();
            var productCode = $(this).attr('data-mz-prdcode');        
            //console.log(productCode);
            var me = $(this);
            quickViewFun.addWishlistOnAuth(productCode, me);
        });

        $(document).on('click','.img-overlay',function(e){ 
            quickViewFun.showquickview(e);
        });

        $(document).on('click','.gridder-close',function(e){  
            quickViewFun.closeQuickView(e);
        });
        
        $(document).on('click', '.mz-l-sidebaritem-new h4', function (e) {
        filterfun.mobileaccordianfun($(e.currentTarget)); 
        
    }); 
    
    
    
    $(document).on('keydown','.mz-l-sidebaritem-new h4', function (e){
        if(e.which == 13 || e.which == 32){
            e.preventDefault();
            filterfun.mobileaccordianfun($(document.activeElement));  
        }      
    });
        // new filter functions 
        var filterfun = { 
            openclosefunction: function(ele){
                if(ele.hasClass('active')){
                    ele.removeClass('active'); 
                    $(document).find('.filter-list,.pointer-filter,.container-filter').removeClass('active');
                    $(document).find('.facets-type-list').find('.facete-type-li').attr('aria-expanded',false);
                    ele.attr('aria-expanded',false);
                    
                    $(document).find('.facets-type-list').find('.facete-type-li').removeClass('active');
                    $(document).find('.facet-name-list').find('.mz-l-sidebaritem').removeClass('active');
                    $(document).find('.mz-l-paginatedlist').css('min-height','');
                }else{  
                    ele.addClass('active'); 
                    ele.attr('aria-expanded',true);
                    $(document).find('.filter-list,.pointer-filter,.container-filter').addClass('active'); 
                    //$(document).find('.filter-list,.pointer-filter').focus();
                    
                    $(document).find('.facets-type-list').find('.facete-type-li').first().attr('aria-expanded',true);
                    $(document).find('.facets-type-list').find('.facete-type-li').first().addClass('active');
                    $(document).find('.facet-name-list').find('.mz-l-sidebaritem.'+$.trim($(document).find('.facets-type-list').find('.facete-type-li').first().attr('data-attr'))).addClass('active'); 
                    this.loopfilterhead();
                    $(document).find('.mz-l-paginatedlist').css('min-height','300px');
                } 
            },
            closefunction: function(ele){
                ele.find('.arrow').addClass('down');  
                ele.find('.arrow').removeClass('up');
                $(document).find('.filter-list,.pointer-filter,.container-filter').removeClass('active');
                
                $(document).find('.facets-header').attr('aria-expanded',false);
                $(document).find('.facets-type-list').find('.facete-type-li').attr('aria-expanded',false);
                $(document).find('.facets-type-list').find('.facete-type-li').removeClass('active');
                $(document).find('.facet-name-list').find('.mz-l-sidebaritem').removeClass('active'); 
                
            },
            changefiltertype: function(ele){
                $(document).find('.facets-type-list').find('.facete-type-li').removeClass('active');
                $(document).find('.facet-name-list').find('.mz-l-sidebaritem').removeClass('active');
                $(document).find('.facets-type-list').find('.facete-type-li').attr('aria-expanded',false);
                ele.addClass('active');
                ele.attr('aria-expanded',true);
                $(document).find('.facet-name-list').find('.mz-l-sidebaritem.'+$.trim(ele.attr('data-attr'))).addClass('active');
                
                this.loopfilteritems(); 
            },
            addfilter: function(ele){
                if(!ele.hasClass('mz-facetform-selected') && !ele.hasClass('category') && !ele.parents().hasClass('category')){
                    var valuetodisplay;
                    if(ele.attr('value-to-display')){
                        valuetodisplay =  ele.attr('value-to-display');   
                    }else{
                        valuetodisplay =  ele.find('[value-to-display]').attr('value-to-display');    
                    }
                    var str = '<li role="contentinfo" aria-label="'+ele.attr("aria-label")+'" tabindex="0" class="item-name '+ele.attr("attr-name-type")+' selected-facet-value  mz-facetform-selected " url-component="'+ele.attr("url-component")+'"><label class="mz-facetingform-valuelabel mz1-facetingform-value" data-mz-facet-value="'+ele.attr("url-component")+'" >'+valuetodisplay+'</label><span tabindex="0" role="button" aria-label="remove-facet '+ele.attr("aria-label")+'" class="cross-btn-facets">X</span></li>';
                    $(document).find('.mz-facetingform-selected').find('ul.mz-facetingform-facet').append(str).hide();
                    $(document).find('clear-all-outer-btn').hide(); 
                    ele.addClass('mz-facetform-selected');
                    /*if($(document).find('.selected-facet-value').length >= 1){
                        $('.clear-all-outer-btn').addClass('active');
                    }else{
                        $('.clear-all-outer-btn').removeClass('active');    
                    }*/
                }else if(ele.hasClass('mz-facetform-selected')){
                    ele.removeClass('mz-facetform-selected');
                    $(document).find('.filter-list-selected').find('.selected-facet-value').each(function(){
                        if($(this).attr('url-component') == ele.attr("url-component")){
                            $(this).remove();   
                        }
                    });    
                }
            },
            handalescpforitem:function(ele){
                $(document).find('.facete-type-ul').find('.facete-type-li.active').focus();  
                this.loopfilterhead(); 
            },
            handalescpforheaditem:function(ele){
                $(document).find('.facets-header').find('.container-filter').find('.arrow').addClass('down');  
                $(document).find('.facets-header').find('.container-filter').find('.arrow').removeClass('up');
                $(document).find('.filter-list,.pointer-filter,.container-filter').removeClass('active');
                ele.focus();
                $(document).find('.facets-header').attr('aria-expanded',false);
                $(document).find('.facets-type-list').find('.facete-type-li').attr('aria-expanded',false);
                $(document).find('.facets-type-list').find('.facete-type-li').removeClass('active');
                $(document).find('.facet-name-list').find('.mz-l-sidebaritem').removeClass('active'); 
                $(document).find('.facets-header').focus();
            },
            categoryaccordian:function(ele){
                if($( window  ).width() > 767){
                    if(!ele.hasClass('active')){
                        $(document).find('.item-name').attr('aria-expanded',false);
                        $(document).find('.item-name').removeClass('active');
                        $(document).find('.item-container').find('.sub-cat-list').slideUp('slow');
                        ele.addClass('active');
                        ele.attr('aria-expanded',true);
                        ele.parents('.item-container').find('.sub-cat-list').slideDown('slow');
                        $(document).find('.item-name.active').parents('.item-container').find('.sub-cat-list').find('.item-name-submenu').first().find('a').focus();
                        this.loopfiltersubitems();
                    }else{
                        $(document).find('.item-name.active').focus(); 
                        ele.removeClass('active');
                        ele.attr('aria-expanded',false);
                        ele.parents('.item-container').find('.sub-cat-list').slideUp('slow'); 
                        this.loopfilteritems(); 
                    }
                }
            },
            mobileaccordianfun: function(ele){
                if(!ele.parents('.mz-l-sidebaritem-new').hasClass("selected")){ 
                    $(".mz-l-sidebaritem-new ul").slideUp();    
                    $(".mz-l-sidebaritem-new").removeClass("selected");
                    ele.parent().find(".mz-facetingform-facet").slideDown();
                    ele.parents('.mz-l-sidebaritem-new').addClass("selected");
                    ele.parents('.mz-l-sidebaritem-new').find('.item-name').filter(':visible').first().focus();
                    this.loopfilteritemsmobile();
                }else{
                    $(".mz-l-sidebaritem-new ul").slideUp();   
                    $(".mz-l-sidebaritem-new").removeClass("selected");  
                    ele.focus(); 
                    this.loopfilterheadmobile();
                }
            },
            mobileaccordianescpfun:function(){
                $(".mz-l-sidebaritem-new.selected h4").focus();
                $(".mz-l-sidebaritem-new ul").slideUp();  
                $(".mz-l-sidebaritem-new").removeClass("selected"); 
                this.loopfilterheadmobile();
            },
            handalescpforsubitem:function(ele){ 
                this.categoryaccordian($('.item-name.active'));
            },
            mobileaddfilters:function(ele){
                if(!ele.hasClass('remove-filter-one') && !ele.parents('li').hasClass('mz-facetform-selected') && ele.html() !== ''){
                    var valuetoshow = ele.prev().attr('data-mz-facet-titel-mobile');
                    var valuetoappend = ele.prev().attr('data-mz-facet-value-mobile');
                    var faceteid = ele.prev().attr('data-mz-facet-label-mobile'); 
                    var facetname = ele.prev().attr('data-mz-facet');
                    var ratingValue = ele.prev().attr('rating-facet');
                    if(!valuetoappend){
                        valuetoshow = ele.attr('data-mz-facet-titel-mobile');
                        valuetoappend = ele.attr('data-mz-facet-value-mobile');      
                        faceteid = ele.attr('data-mz-facet-label-mobile');
                        facetname = ele.attr('data-mz-facet');
                        ratingValue = ele.attr('rating-facet'); 
                    }  
                    var stringtoappend = ''; 
                    if(facetname){
                        if(facetname.indexOf("Price") == -1 && facetname.indexOf("tenant~ratingforfacet") == -1 && facetname.indexOf("tenant~Color") == -1){  
                            stringtoappend = '<span role="contentinfo" aria-label="'+valuetoshow+'" tabindex="0" class="selected-facet-mobile">'+valuetoshow+'<a role="button" aria-label="remove-facet '+valuetoshow+'" tabindex="0" href="javascript:void(0);" attr-filter="'+valuetoappend+'" attr-require="'+facetname+':'+valuetoappend+'" class="remove-filter-one" id="'+faceteid+'">X</a></span>';
                            //$(document).find('.selected-facet-mobile .'+valuetoappend).length;
                        }else{  
                            if(facetname.indexOf("tenant~ratingforfacet") > -1){ 
                                stringtoappend = '<span role="contentinfo" aria-label="'+valuetoshow+'" tabindex="0" class="selected-facet-mobile">'+ratingValue+'<a role="button" aria-label="remove-facet '+valuetoshow+'" tabindex="0" href="javascript:void(0);" attr-filter="'+valuetoappend+'" attr-require="'+valuetoappend+'" class="remove-filter-one" id="'+faceteid+'">X</a></span>';
                            //$(document).find('.selected-facet-mobile .'+valuetoappend).length;
                            }else if(facetname.indexOf("Price") > -1){
                                stringtoappend = '<span role="contentinfo" aria-label="'+valuetoshow+' $" tabindex="0" class="selected-facet-mobile">'+valuetoshow+'<a role="button" aria-label="remove-facet '+valuetoshow+'" tabindex="0" href="javascript:void(0);" attr-filter="'+valuetoappend+'" attr-require="'+valuetoappend+'" class="remove-filter-one" id="'+faceteid+'">X</a></span>';
                            }
                            else if(facetname.indexOf("tenant~Color") > -1){   
                                 if(valuetoappend=='multi'){  
                                     stringtoappend = '<span role="contentinfo" aria-label="'+valuetoshow+'" tabindex="0" class="selected-facet-mobile" ><span class="mobjb-color" style="background:linear-gradient(to bottom, #33ccff 0%, #ff99cc 100%);"></span><a role="button" aria-label="remove-facet '+valuetoshow+'" tabindex="0" href="javascript:void(0);" attr-filter="'+valuetoappend+'" attr-require="'+facetname+':'+valuetoappend+'" class="remove-filter-one" id="'+faceteid+'">X</a></span>';
                                     
                                     }else{ 
                                         stringtoappend = '<span role="contentinfo" aria-label="'+valuetoshow+'" tabindex="0" class="selected-facet-mobile" ><span class="mobjb-color" style="background:'+valuetoappend+';"></span><a role="button" aria-label="remove-facet '+valuetoshow+'" tabindex="0" href="javascript:void(0);" attr-filter="'+valuetoappend+'" attr-require="'+facetname+':'+valuetoappend+'" class="remove-filter-one" id="'+faceteid+'">X</a></span>';
                                         
                                         }
                            }
                            else{
                                stringtoappend = '<span role="contentinfo" aria-label="'+valuetoshow+'" tabindex="0" class="selected-facet-mobile">'+valuetoshow+'<a role="button" aria-label="remove-facet '+valuetoshow+'" tabindex="0" href="javascript:void(0);" attr-filter="'+valuetoappend+'" attr-require="'+valuetoappend+'" class="remove-filter-one" id="'+faceteid+'">X</a></span>';
                            }
                        }
                        ele.parents('li').addClass('mz-facetform-selected'); 
                        ele.find('.mz1-selectcolr').show();  
                        $(document).find('.tz-mobileSelected-filter').append(stringtoappend);
                        if($(document).find('.selected-facet-mobile').length >= 1){
                            $(document).find('.tz-mobileSelected-filter').addClass('active');  
                            $(document).find('.mz-refine-search').addClass('active');
                        }else{
                            $(document).find('.tz-mobileSelected-filter').removeClass('active');
                            $(document).find('.mz-refine-search').removeClass('active'); 
                        }
                    }
                }
            },
            mobilecataccordian:function(ele){
                if($( window  ).width() <= 767){
                    if(!ele.hasClass('active')){
                        $(document).find('.mobile-category').removeClass('active');
                        $(document).find('.sub-cat-list-mobile').slideUp();
                        ele.addClass('active');
                        ele.find('.sub-cat-list-mobile').slideDown(); 
                        ele.find('.sub-cat-list-mobile').find('.item-name-submenu-mobile').filter(':visible').first().find('a').focus();
                        this.loopsubmenucatitemsmobile();
                    }else{
                        $(document).find('.mobile-category.active').focus();
                        $(document).find('.mobile-category').removeClass('active');
                        $(document).find('.sub-cat-list-mobile').slideUp();  
                        this.loopfilteritemsmobile();
                    }
                }
            },
            handelescpmobilesubmenu:function(){
                $(document).find('.mobile-category.active').focus();
                $(document).find('.mobile-category').removeClass('active');
                $(document).find('.sub-cat-list-mobile').slideUp();  
                this.loopfilteritemsmobile();
            }, 
            loopsubmenucatitemsmobile:function(){ 
                this.commonloopfun($(document).find('.mobile-category.active').find('.item-name-submenu-mobile').filter(':visible'));
            },
            loopfiltersubitems:function(){
                this.commonloopfun($(document).find('.item-name.active').find('.sub-cat-list').find('.item-name-submenu').filter(':visible'));
                // window.filterheadinputs = $(document).find('.item-name.active').find('.sub-cat-list').find('.item-name-submenu').filter(':visible');   
                // window.filterheadfirstInput = window.filterheadinputs.first();
                // window.filterheadlastInput = window.filterheadinputs.last();             
            },  
            loopfilteritemsmobile:function(){
                this.commonloopfun($(document).find('.mz-l-sidebaritem-new.selected').find('.item-name').filter(':visible'));
            },
            loopfilterheadmobile:function(){ 
                this.commonloopfun($(document).find('#tz-mobilePopmenu').find('.tzPopup-Done,.cancel-btn-container,.mz-l-sidebaritem-new h4').filter(':visible'));
            }, 
            loopfilterhead:function(){
                this.commonloopfun($(document).find('.filter-list').find('.mz-facetingform-clearall,.item-name,.apply-filter-button,.mz-facetingform-clearall').filter(':visible')); 
            }, 
            loopfilteritems:function(){
                this.commonloopfun($(document).find('.filter-list.active').find('.mz-facetingform-clearall,.item-name,.apply-filter-button,.mz-facetingform-clearall').filter(':visible'));
            },
            commonloopfun:function(inputs){
                window.inputs = inputs;    
                window.first = window.inputs.first();
                window.last = window.inputs.last(); 
            } 
        };
        
        $(document).on('keydown','.item-name-submenu-mobile a',function(e){
        if(e.which == 27){
            e.preventDefault();
            filterfun.handelescpmobilesubmenu();    
        }else if(e.which == 13 || e.which == 32){
            e.preventDefault();
            window.location = window.location.origin+$(e.currentTarget).attr('href');
        }
    });
    
    $(document).on('click','.mobile-category',function(e){
        filterfun.mobilecataccordian($(e.currentTarget));  
    });
    
    $(document).on('keydown','.mobile-category',function(e){
        if(e.which == 13 || e.which == 32){
            e.preventDefault();
            filterfun.mobilecataccordian($(document.activeElement));
        }else if(e.which == 27){
            e.preventDefault();    
        }   
    });
        $(document).on('keydown','.cancel-btn-container',function(e){
        if(e.which == 13 || e.which == 32){
            e.preventDefault();
            //filterfun.changefiltertype($(document.activeElement));
            $(document.activeElement).find('.tzPopup-cancel').click();
        }else if(e.which == 27){
            // e.preventDefault();
            // filterfun.handalescpforheaditem($(document.activeElement));
        }    
    });
        $(document).on('click','.facete-type-li',function(e){
        filterfun.changefiltertype($(e.currentTarget));    
    });
    
    $(document).on('keydown','.facete-type-li',function(e){
        if(e.which == 13 || e.which == 32){
            e.preventDefault(); 
            filterfun.changefiltertype($(document.activeElement));
        }else if(e.which == 27){
            e.preventDefault();
            filterfun.handalescpforheaditem($(document.activeElement));
        } 
    });

        $(document).on('click','.facets-header',function(e){
             
        filterfun.openclosefunction($(e.currentTarget));   
        });
        
         if($(document).find('.selected-facet-value').length >= 1){
            $(document).find('.clear-all-outer-btn').addClass('active');
        }else{
            $(document).find('.clear-all-outer-btn').removeClass('active');    
        }
    
    $(document).on('keydown','.facets-header',function(e){
        if(e.which == 13 || e.which == 32){
            e.preventDefault();
            filterfun.openclosefunction($(document.activeElement));  
        }
    });
    $(document).on('click','.item-name',function(e){    
             if($( window  ).width() <= 767){
                var ele;    
                if($(e.currentTarget).hasClass('item-name')){
                    ele = $(e.currentTarget).find('span.mz1-facetingform-value');
                }else{
                    ele = $(e.currentTarget);
                } 
                filterfun.mobileaddfilters(ele); 
            }  
          
        });
    $(document).on('click', '.cross-icon', function(e){
        var ele = $(e.target).parents('.mz-l-sidebar.mz-desktop-filters').find('.facets-header');
        ele.removeClass('active'); 
        $(document).find('.filter-list,.pointer-filter,.container-filter').removeClass('active');
        $(document).find('.facets-type-list').find('.facete-type-li').attr('aria-expanded',false);
        ele.attr('aria-expanded',false);
        $(document).find('.facets-type-list').find('.facete-type-li').removeClass('active');
        $(document).find('.facet-name-list').find('.mz-l-sidebaritem').removeClass('active');
        $(document).find('.mz-l-paginatedlist').css('min-height','');   
    });

    $(document).on('keydown','.cross-icon',function(e){
        if(e.which == 13 || e.which == 32){
            e.preventDefault();
            filterfun.openclosefunction($(document.activeElement));  
        }
    });
    
    $(document).on('click','.filter-list .item-name',function(e){ 
        if($( window  ).width() > 767){ 
            filterfun.addfilter($(e.currentTarget));  
        }
    });
    
    $(document).on('keydown','.item-name',function(e){ 
        if($( window  ).width() > 767){
            if(e.which == 13 || e.which == 32){
                e.preventDefault();
                filterfun.addfilter($(document.activeElement));
            }else if(e.which == 27){
                e.preventDefault();
                if($(e.target).hasClass('item-name')){
                    filterfun.handalescpforitem($(document.activeElement));
                }
            }
        }else{
            if(e.which == 13 || e.which == 32){
                e.preventDefault();
                var ele;    
                if($(document.activeElement).hasClass('item-name')){
                    ele = $(document.activeElement).find('span.mz1-facetingform-value');
                }else{
                    ele = $(document.activeElement);
                } 
                if(!ele.parents('.item-name').hasClass('category'))
                    filterfun.mobileaddfilters(ele); 
            }else if(e.which == 27){
                e.preventDefault();
                if($(e.target).hasClass('item-name')){
                    filterfun.mobileaccordianescpfun($(document.activeElement));
                }
            }    
        }
    }); 
    
    $(document).on('keydown','.apply-filter-button,.mz-facetingform-clearall',function(e){
        if(e.which == 27){
            e.preventDefault();
            filterfun.handalescpforitem($(document.activeElement)); 
        }   
    });
    
    
        
        $(document).on('keydown','.apply-filter-button',function(e){
            if(e.which == 13 || e.which == 32){
                e.preventDefault();
                $(document.activeElement).click();   
            }     
        });
        
        $(document).on('keydown','.mz-facetingform-clearall',function(e){
            if(e.which == 13 || e.which == 32){
                e.preventDefault();
                $(document.activeElement).click();    
            }    
        });
        
        
    
    });



$(document).on('click','.jb-out-of-stock', function(e) {
        //alert(e.target.getAttribute('data-mz-product-code'));
        $.colorbox({
            open : true,
            maxWidth : "100%",
            maxHeight : "100%",
            scrolling : false,
            fadeOut : 500,
            html : "<div id='notify-me-dialog' style='padding: 30px;'><form><span>Enter your email address to be notified when this item is back in stock.</span><br><input style='margin-top: 10px;' id='notify-me-email' type='text' value='"+decodeURIComponent(jQuery.cookie('userData'))+"'><span style='background: #39A857; color: #ffffff; padding: 3px; margin-left: 5px; cursor: pointer;' id='notify-me-button' data-mz-product-code='" + e.target.getAttribute('data-mz-product-code') + "'>NOTIFY ME</span></form><div class='notify-error'>Please enter a valid Email id</div></div>", //"/resources/intl/geolocate.html",
            overlayClose : true,
            onComplete : function () {
               $('#cboxClose').show();
               $('#cboxLoadedContent').css({
                   background : "#ffffff"
               });

           }
       });
        $(document).find('body').addClass("haspopup"); 
    });

    // enable scroll after closing zoom image poup
    $(document).on('click','#cboxClose',function(){
        setTimeout(function(){
            $(document).find('body').removeClass("haspopup"); 
        },250);
    });

    $(document).on('click','#cboxOverlay',function(e){
        if($(e.target).attr('id') == "cboxOverlay"){ 
            setTimeout(function(){ 
                $(document).find('body').removeClass("haspopup");
            },250); 
        }
    });

$(document).on('click','#notify-me-button', function(e) {
    if($('#notify-me-email').val() !== ""){
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var patt = new RegExp(re);
        if(patt.test($('#notify-me-email').val())){
            var obj = {
                email: $('#notify-me-email').val(),
                customerId: require.mozuData('user').accountId,
                productCode: e.target.getAttribute('data-mz-product-code'),
                    locationCode: '' //this.model.get('inventoryInfo').onlineLocationCode
                };
                if(window.location.host.indexOf('s16708') > -1 || window.location.host.indexOf('east') > -1){
                    obj.locationCode = 'MDC';
                }else if(window.location.host.indexOf('s21410') > -1 || window.location.host.indexOf('west') > -1){
                    obj.locationCode = 'FDC';
                }
                
                api.create('instockrequest',obj ).then(function () {
                    $("#notify-me-dialog").fadeOut(500, function () { $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
                }, function () {
                    $("#notify-me-dialog").fadeOut(500, function () { $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
                });
            }else{
                $('.notify-error').show();
            }
        }else{
            $('.notify-error').show(); 
        }
        /*api.create('instockrequest', {
            email: $('#notify-me-email').val(),
            //customerId: user.accountId, 
            productCode: e.target.getAttribute('data-mz-product-code'),
            locationCode: e.target.getAttribute('data-mz-location-code'),
        }).then(function () {
            $("#notify-me-dialog").fadeOut(500, function () { $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
        }, function () {
            $("#notify-me-dialog").fadeOut(500, function () { $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
        });*/
    });

$(document).on('keypress', '#notify-me-email', function (e) {
    if (e.which === 13) {
        e.preventDefault();
        $('#notify-me-button').trigger('click');
        return false;
    }
});

return {
    createFacetedCollectionViews: factory
};

});





