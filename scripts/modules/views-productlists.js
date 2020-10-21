// Changes Made By Amit on 25-June for Sort By Bug at line no 186,187,190,191,296-298,308-310

define(['modules/jquery-mozu', 'underscore', 'modules/backbone-mozu','shim!vendor/jquery.quickview'], 
function ($, _, Backbone, Hypr, ModalWindow) {

    var ProductListView = Backbone.MozuView.extend({
            templateName: 'modules/product/product-list-tiled',
            additionalEvents: {
                "change [plp-giftcart-prize-change-action]": "onOptionChange"
            },
            getRenderContext: function () {
                var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
                this.cornerLabel(c);
             
                
                $.each(c.model.items, function(index,item){
                    if(item.properties){
                        var ratingVal = $.grep(item.properties, function(e){ return e.attributeFQN == 'tenant~rating'; });
                        if(ratingVal.length>0 && ratingVal[0].values.length>0 && typeof ratingVal[0].values[0].value != "undefined"){
                            if( ratingVal[0].values[0].value === 0){
                                item.rating = 'zero';
                            }else if( ratingVal[0].values[0].value < 0.9 ){  
                                item.rating = 'half';
                            }else if( ratingVal[0].values[0].value < 1.5 ){
                                item.rating = 'one';
                            }else if( ratingVal[0].values[0].value < 2.0 ){
                                item.rating = 'onehalf';
                            }else if( ratingVal[0].values[0].value < 2.5 ){
                                item.rating = 'two';
                            }else if( ratingVal[0].values[0].value < 3.0 ){
                                item.rating = 'twohalf';
                            }else if( ratingVal[0].values[0].value < 3.5 ){
                                item.rating = 'three';
                            }else if( ratingVal[0].values[0].value < 4.0 ){
                                item.rating = 'threehalf';
                            }else if( ratingVal[0].values[0].value < 4.5 ){
                                item.rating = 'four';
                            }else if( ratingVal[0].values[0].value < 5.0 ){  
                                item.rating = 'fourhalf';
                            }else {
                                item.rating = 'five';    
                            }
                            
                        }else{
                             item.rating = 'zero';
                        }
                        var reviewVal = $.grep(item.properties, function(e){ return e.attributeFQN == 'tenant~review'; });
                        if(reviewVal.length > 0 && reviewVal[0].values.length > 0 && typeof reviewVal[0].values[0].value != "undefined" && reviewVal[0].values[0].value > 0){
                            item.review = reviewVal[0].values[0].value;
                        }else{
                            item.review = 0;
                        }
                    }
                });
                
             
                return c;
            },
            
            cornerLabel:function(c){    
                
                var one_day=1000*60*60*24; 
                var products = c.model.items;
                for(var i=0; i<products.length; i++){
                    var productDate = c.model.items[i].createDate.substring(0,10);
                    //var date= new Date();
                   // var currentDate = date.getDate().toString()+'-'+date.getMonth().toString()+'-'+date.getFullYear().toString();
                    var currentDate = $('#currentDate').text();
                    var x = productDate.split('-');
                    var y = currentDate.split('-');
                    var date1 = new Date(x[0],x[1]-1,x[2]);
                    var date2 = new Date(y[2],y[1]-1,y[0]);
                    var days = Math.ceil((date2.getTime()-date1.getTime())/(one_day)); 
                    
                    if(days <=30 && days >= 0){
                       // console.log(days);
                       c.model.items[i].newLabel = true;
                       
                    }
                }    
            
            },
            
       pushdown : function(){     
        console.log('Document ready in product list');
        
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
         
        //Initializing Gridder 
        // Call Gridder
        $(".gridder").gridderExpander({
            scrollOffset: 310,
            scrollTo: "panel", // "panel" or "listitem"
            animationSpeed: 400,
            animationEasing: "easeInOutExpo",
            onStart: function () {
                console.log("Gridder Inititialized");
            },
            onExpanded: function (object) {
                console.log("Gridder Expanded");
                $(".carousel").carousel(); 
            },
            onChanged: function (object) {
                           },
            onClosed: function () {
                $(".jb-quickviewdetails .jb-buy-product").css("visibility","visible");
                console.log("Gridder Closed");
                 //$(".selectedItem .jb-quickviewdetails .jb-buy-product").show();
            },
            onContent: function() {
                $(".jb-quickviewdetails .jb-buy-product").css("visibility","visible");
                $(".selectedItem .jb-quickviewdetails .jb-buy-product").css("visibility","hidden");
              
            }
        });
  
       },
            
            render: function(){
                this.getRenderContext();
                Backbone.MozuView.prototype.render.apply(this);
                this.updateLayout();
                this.pushdown();
                   $('.stock').show();
            },
            
            updateLayout: function(){
                
                var view = $(".mz-pagingcontrols-pagesize-dropdown[data-mz-value='pageView']").val();
                var LayoutType;
                switch(view){
                    case('Grid'): 
                        LayoutType = 'cellsByRow';  
                        break;
                    case('List'): 
                        LayoutType = 'straightDown';
                        break;
                }
                if(LayoutType !== '' ){
                    // $("#mz-productlist-list").isotope({layoutMode: LayoutType});
                    if(LayoutType == "straightDown") { 
                        $('#mz-productlist-list').removeClass('mz-productlist-grid');
                        $('#mz-productlist-list').addClass("mz-productlist-list"); 
                    }
                    else {
                        $('#mz-productlist-list').removeClass('mz-productlist-list');
                        $('#mz-productlist-list').addClass("mz-productlist-grid"); 
                    }
                    // $(window).smartresize();
                }
                
            }
        }), 

    FacetingPanel = Backbone.MozuView.extend({
        additionalEvents: {
            "click [data-mz-facet-value]": "setFacetValue"
        },
        templateName: "modules/product/faceting-form",
        initialize: function () {
            this.listenTo(this.model, 'loadingchange', function (isLoading) {
                this.$el.find('input').prop('disabled', isLoading);
            });
        },
        
        //Changes made by rajesh on 9/6/2015 
        // for hiding cateogires which dont have sub cateogires 
        getRenderContext: function(){
            var d = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            d.model.showcatgrylabel = false;
            var objs =  $.grep(d.model.facets, function(e){ return e.facetType == "Hierarchy"; });
            if(objs.length > 0){
                var items = objs[0].values;
                for(var i=0; i < items.length;i++){
                    if(items[i].childrenFacetValues.length > 0){
                        d.model.showcatgrylabel = true;
                    }
                }
                
                for(var j=0; j< items.length; j++){
                    if(items[j].isDisplayed){
                         d.model.showlabel = true;
                    }
                }
            }
          return d;
        },
        render:function(e){
            $(this.model.get('facets').models).each(function(key,val){
                var arr = val.get('values').models;
                    if(val && val.get('values') && val.get('values').models && val.get('values').models.length>0 && val.get('values').models[0].get('rangeQueryValueStart') !== undefined ){
                        arr =  (val.get('values').models).sort(function(a,b) {
                            if(a.get('rangeQueryValueStart') !== undefined){
                                return a.get('rangeQueryValueStart') - b.get('rangeQueryValueStart');
                            }
                        });
                    }
                val.set('values',arr);
            });
            
             this.getRenderContext();
            Backbone.MozuView.prototype.render.apply(this);
                if(e){
                    _.each(e.facets,function(data){
                        var field=JSON.stringify(data.label);
                        var fildvalue=$.parseJSON(field);
                        _.each(data.values,function(finalVal){
                            var isapplied=JSON.stringify(finalVal.isApplied);
                            var temp=JSON.stringify(finalVal.value);
                            if(typeof temp != "undefined"){
                                var finalvalue=$.parseJSON(temp);
                                if(isapplied=="true"){
                                    if(fildvalue=="color"){
                                        $('[data-mz-facet-value="'+finalvalue+'"]').closest("li").find(".mz1-selectcolr").show();
                                        $('[data-mz-facet-value="'+finalvalue+'"]').closest("li").addClass("mz-facetform-selected");
                                    }else{
                                        $('[data-mz-facet-value="'+finalvalue+'"]').closest("li").addClass("mz-facetform-selected");    
                                    }
                                }
                            }
                        });
                    });
                }  
        },
        clearFacets: function () {
            this.model.clearAllFacets(); 
            // var path  = window.location.pathname.split('/');
            // var id = path[path.length-2],
            //     field = 'CategoryId';
            // this.model.setHierarchy(field, id);
            // this.model.updateFacets({ force: true, resetIndex: true });
        },
        clearFacet: function (e) {
            this.model.get("facets").findWhere({ field: $(e.currentTarget).data('mz-facet') }).empty();
        },
        drillDown: function(e) {
            var $target = $(e.currentTarget),
                id = $target.data('mz-hierarchy-id'),
                field = $target.data('mz-facet');
            this.model.setHierarchy(field, id);
            var option_clone  = { force: true, resetIndex: true };
            console.log(option_clone);
            this.model.updateFacets(option_clone);
            e.preventDefault();
        },
        setFacetValue: function (e) {
            
            var $box = $(e.currentTarget);
            if($(e.currentTarget).data('mz-facet') === "tenant~ratingforfacet"){
                       this.clearRatingFacets(e);
                    }
            //alert($box.data('mz-facet'));
                //alert($box.data('mz-facet-value'));
            if($box.attr('data-mz-action') != "drillDown"){
                if($box.closest("li").hasClass("mz-facetform-selected")){
                   // $box.find(".mz1-selectcolr").css("display","none");
                   // $box.closest("li").removeClass("mz-facetform-selected");
                    this.model.setFacetValue($box.data('mz-facet'), $box.data('mz-facet-value'),false);
                }else{
                   // $box.closest("li").addClass("mz-facetform-selected");
                  //  $box.find(".mz1-selectcolr").css("display","block");
                    this.model.setFacetValue($box.data('mz-facet'), $box.data('mz-facet-value'),true);
                }
            }   
            
            
        },
        
    
        clearRatingFacets:function(e){
            
             this.model.get("facets").findWhere({ field: $(e.currentTarget).data('mz-facet') }).empty();
            
        }
    }),
    
    FacetingPanelMobile = Backbone.MozuView.extend({
        additionalEvents: {
            "click [data-mz-facet-value-mobile]": "setFacetValueMobile"
        },
        templateName: "modules/product/faceting-formNew",
        initialize: function () {
            this.listenTo(this.model, 'loadingchange', function (isLoading) {
                this.$el.find('input').prop('disabled', isLoading);
            });
        },
        
           //Changes made by rajesh on 24/6/2015 
        // for hiding cateogires which dont have sub cateogires 
        getRenderContext: function(){
            var d = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            d.model.showcatgrylabel = false;  
            var objs =  $.grep(d.model.facets, function(e){ return e.facetType == "Hierarchy"; });
            if(objs.length > 0){
                var items = objs[0].values;
                for(var i=0; i < items.length;i++){
                    if(items[i].childrenFacetValues.length > 0){
                        d.model.showcatgrylabel = true;
                    }
                }
                
                for(var j=0; j< items.length; j++){
                    if(items[j].isDisplayed){
                         d.model.showlabel = true;
                    }
                }
            }
          return d;
        },
        render:function(e){
            $(this.model.get('facets').models).each(function(key,val){
                var arr = val.get('values').models;
                    if(val.get('values') && val.get('values').models && val.get('values').models.length>0 && val.get('values').models[0] && val.get('values').models[0].get('rangeQueryValueStart') !== undefined ){
                        arr =  (val.get('values').models).sort(function(a,b) {
                        if(a.get('rangeQueryValueStart') !== undefined)
                            return a.get('rangeQueryValueStart') - b.get('rangeQueryValueStart');
                        });
                    }
                    if(val.id === "tenant~ratingforfacet"){
                        val.set('values',arr.reverse());
                    }else{
                        val.set('values',arr);
                    }
            });
            Backbone.MozuView.prototype.render.apply(this);
            var j;
            if(e){
                _.each(e.facets,function(data){
                    var field=JSON.stringify(data.label);
                    var fildvalue=$.parseJSON(field);
                    _.each(data.values,function(finalVal){
                        var isapplied=JSON.stringify(finalVal.isApplied);
                        var temp=JSON.stringify(finalVal.value);
                        var finalvalue=$.parseJSON(temp);
                        if(isapplied=="true"){
                            if(fildvalue=="color"){
                                $('[data-mz-facet-value-mobile="'+finalvalue+'"]').closest("li").find(".mz1-selectcolr").show();
                                $('[data-mz-facet-value-mobile="'+finalvalue+'"]').closest("li").addClass("mz-facetform-selected");    
                            }else{
                                $('[data-mz-facet-value-mobile="'+finalvalue+'"]').closest("li").addClass("mz-facetform-selected");    
                            }
                            if(!$('[data-mz-facet-value-mobile="'+finalvalue+'"]').closest("ul").hasClass("mz-open-state")){
                                $('[data-mz-facet-value-mobile="'+finalvalue+'"]').closest("ul").addClass("mz-open-state");
                            }
                        }
                    });
                });
            } 
        },
        clearFacets: function () {
            this.model.clearAllFacets();
            
            $('.tz-mobileSelected-filter span').remove();
            // var path  = window.location.pathname.split('/');
            // var id = path[path.length-2],
            //     field = 'CategoryId';
            // this.model.setHierarchy(field, id);
            // this.model.updateFacets({ force: true, resetIndex: true });
        },
        clearFacet: function (e) {
            this.model.get("facets").findWhere({ field: $(e.currentTarget).data('mz-facet') }).empty();
        },
        drillDown: function(e) {
            var $target = $(e.currentTarget),
                id = $target.data('mz-hierarchy-id'),
                field = $target.data('mz-facet');
            this.model.setHierarchy(field, id);
            this.model.updateFacets({ force: true, resetIndex: true });
            e.preventDefault();
        },
        setFacetValueMobile: function (e) {
            var $box = $(e.currentTarget), facetValue = $box.data('mz-facet-value-mobile');
             var facetRating = $box.attr('facetrating');
             if($(e.currentTarget).data('mz-facet') === "tenant~ratingforfacet"){
                       this.clearRatingFacets(e);
                    }
            if($box.attr('data-mz-action') != "drillDown"){ 
                if(!$box.closest("li").hasClass("mz-facetform-selected")){
                    // $box.closest("li").addClass("mz-facetform-selected");
                    // $box.find(".mz1-selectcolr").css("display","block");
                   // $box.closest("li").addClass("mz-facetform-selected");  
                    $('.tz-mobileSelected-filter').show('slow');
                    $(".tz-mobileSelected-filter:eq(1)").remove();
                    $('.tz-mobileSelected-filter:first').append('<span id="selectedFilter_'+$box[0].id+'" class="selected-facet-mobile ' + facetValue +' '+ facetRating +' ">' + facetValue + '<a href="javascript:void(0);" class="' + facetValue + '" id="' + $box.data('mz-facet') + '">X</a></span>');
                    this.model.setFacetValue($box.data('mz-facet'), facetValue ,true);
                } 
                else {
                    if($('.selected-facet-mobile').length <= 1) {
                        $('.tz-mobileSelected-filter').hide('slow');
                    } 
                    //$box.closest("li").removeClass("mz-facetform-selected");
                     //$box.find(".mz1-selectcolr").css("display","none");
                    // $box.closest("li").removeClass("mz-facetform-selected");
                    $('.tz-mobileSelected-filter').find('#selectedFilter_'+$box[0].id).remove();
                     this.model.setFacetValue($box.data('mz-facet'),facetValue ,false);
                } 
            }
        },
        destroyMe: function() { 
                    //COMPLETELY UNBIND THE VIEW
            this.undelegateEvents();
            this.$el.removeData().unbind(); 
            this.remove();  
            Backbone.View.prototype.remove.call(this);
        },
          clearRatingFacets:function(e){
            
             this.model.get("facets").findWhere({ field: $(e.currentTarget).data('mz-facet') }).empty(); 
                         $('.activerating').remove();
            
        }
    });
    
    

    return {
        List: ProductListView,
        FacetingPanel: FacetingPanel,
        FacetingPanelMobile: FacetingPanelMobile
    };
});





