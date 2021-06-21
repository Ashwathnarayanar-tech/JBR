define([
    "jquery", "underscore",
    "hyprlive",
    "modules/backbone-mozu-model"], function ($, _, Hypr, Backbone) {

        var defaultPageSize = Hypr.getThemeSetting('defaultPageSize');

        var sorts = [
             {
                 "text": "Relevance",
                 "value": "createDate desc"
             },

            {
                "text": "Best Ratings",
                "value": "tenant~rating desc"
              },
              {
                "text": "Number of Reviews",
                "value": "tenant~review desc"
              },
              {
                "text": "Price: Low to High",
                "value": "price asc"
              },
              {
                "text": "Price: High to Low",
                "value": "price desc"
              },
              {
                "text": "Alphabetical: A-Z",
                "value": "productName asc"
              },
              {
                "text": "Alphabetical: Z-A",
                "value": "productName desc"
              },
              {
                "text": "New Arrivals",
                "value": "createDate desc"
              },
              {
                "text": "Most Recent Last",
                "value": "createDate asc"
              }
             
        ],
            defaultSort = Hypr.getThemeSetting('defaultSort');
            
        var productViews = ['Grid','List'],
            defaultProductView = 'Grid';


        var PagedCollection = Backbone.MozuPagedCollection = Backbone.MozuModel.extend({
            helpers: [  'firstIndex', 
                        'lastIndex', 
                        'middlePageNumbers', 
                        'hasPreviousPage', 
                        'hasNextPage', 
                        'currentPage', 
                        'previousPageNumber', 
                        'nextPageNumber', 
                        'sorts', 
                        'currentSort', 
                        'productViews', 
                        'currentProductView', 
                        'setCurrentProductView', 
                        'productViews', 
                        'currentProductView', 
                        'setCurrentProductView'],
            validation: {
                pageSize: { min: 1 },
                pageCount: { min: 1 },
                totalCount: { min: 0 },
                startIndex: { min: 0 }
            },
            dataTypes: {
                pageSize: Backbone.MozuModel.DataTypes.Int,
                pageCount: Backbone.MozuModel.DataTypes.Int,
                startIndex: Backbone.MozuModel.DataTypes.Int,
                totalCount: Backbone.MozuModel.DataTypes.Int
            },
            defaultSort: defaultSort,

            _isPaged: true,
            getQueryParams: function() {
                var self = this, lrClone = _.clone(this.lastRequest);
                _.each(lrClone, function(v, p) {
                    if (self.baseRequestParams && (p in self.baseRequestParams)) delete lrClone[p];
                });
                if (parseInt(lrClone.pageSize, 10) === defaultPageSize) delete lrClone.pageSize;

                var startIndex = this.get('startIndex');
                if (startIndex) lrClone.startIndex = startIndex;
                return lrClone;
            },
            getQueryString: function() {
                var self = this, lrClone = _.clone(this.lastRequest);
                _.each(lrClone, function(v, p) {
                    if (self.baseRequestParams && (p in self.baseRequestParams)) delete lrClone[p];
                });
                if (parseInt(lrClone.pageSize, 10) === defaultPageSize) delete lrClone.pageSize;
                
                if (this.query) lrClone.query = this.query;
                var startIndex = this.get('startIndex');
                if (startIndex) lrClone.startIndex = startIndex;
                return _.isEmpty(lrClone) ? "" : "?" + $.param(lrClone);
            },

            buildRequest: function() {
                var conf = this.baseRequestParams ? _.clone(this.baseRequestParams) : {},
                    pageSize = this.get("pageSize"),
                    startIndex = this.get("startIndex"),
                    sortBy = $.deparam().sortBy || this.currentSort() || defaultSort;
                conf.pageSize = pageSize;
                if (startIndex) conf.startIndex = startIndex;
                if (sortBy) conf.sortBy = sortBy;
                return conf;
            },
            
            previousPage: function() {
                if(this.lastRequest.sortBy === "undefined") {
                    // delete conf.sortBy;
                    this.lastRequest.sortBy = "";
                }
                try {
                    return this.apiModel.prevPage(this.lastRequest);
                } catch (e) { }
            },

            nextPage: function() {
                if(this.lastRequest.sortBy === "undefined") {
                    // delete conf.sortBy;
                    this.lastRequest.sortBy = "";
                }
                try {
                    return this.apiModel.nextPage(this.lastRequest);
                } catch (e) { }
            },
            syncIndex: function (currentUriFragment) {
                try {
                    var uriStartIndex = parseInt(($.deparam(currentUriFragment).startIndex || 0), 10);
                    if (!isNaN(uriStartIndex) && uriStartIndex !== this.apiModel.getIndex()) {
                        this.lastRequest.startIndex = uriStartIndex;
                        return this.apiModel.setIndex(uriStartIndex, this.lastRequest);
                    }
                } catch (e) { }
            },
            setIndex: function(num, config){
                try {
                    num = parseInt(num, 10);
                    if (typeof num === 'number') {
                        return this.apiModel.setIndex((num), Object.assign(this.lastRequest, config));
                    }
                } catch (e) { }
            },
            setPage: function(num) {
                if(this.lastRequest.sortBy === "undefined") {
                    // delete conf.sortBy;
                    this.lastRequest.sortBy = "";
                }
                num = parseInt(num,10);
                if (num != this.currentPage() && num <= parseInt(this.get('pageCount'),10)) return this.apiGet($.extend(this.lastRequest, {
                    startIndex: (num - 1) * parseInt(this.get('pageSize'),10)
                }));
            },

            changePageSize: function(isLoadMore) {
                if(isLoadMore){
                    console.log(this);
                    //TODO Implement to update the value '5' through theme settings.
                    if(this.get('pageSize') < this.get('totalCount')){
                        var newSize = this.get('pageSize')+ 5;
                        if(newSize>this.get('totalCount')){
                            newSize = this.get('totalCount');
                        }
                        console.log('new size of page going to load: '+newSize);
                        return this.apiGet($.extend(this.lastRequest, { pageSize: newSize }));   
                    }
                }else{
                    return this.apiGet($.extend(this.lastRequest, { pageSize: this.get('pageSize') }));
                }
            },

            firstIndex: function() {
                return this.get("startIndex") + 1;
            },

            lastIndex: function() {
                return this.get("startIndex") + this.get("items").length;
            },

            hasPreviousPage: function() {
                return this.get("startIndex") > 0;
            },

            hasNextPage: function() {
                return this.lastIndex() < this.get("totalCount");
            },

            currentPage: function() {
                return Math.ceil(this.firstIndex() / (this.get('pageSize') || 1));
            },

            middlePageNumbers: function() {
                var current = this.currentPage(),
                    ret = [],
                    pageCount = this.get('pageCount'),
                    i = Math.max(Math.min(current - 2, pageCount - 4), 2),
                    last = Math.min(i + 5, pageCount);
                while (i < last) ret.push(i++);
                return ret;
            },

            previousPageNumber: function(){
                if(this.currentPage()-1 > 0)
                    return this.currentPage()-1;
                else
                    return -1;
            },
            nextPageNumber: function(){
                    return this.currentPage()+1;
            },
        
            sorts: function() {
                return sorts;
            },

            currentSort: function() {
                return (this.lastRequest && decodeURIComponent(this.lastRequest.sortBy).replace(/\+/g, ' ')) || defaultSort;
            },

            currentFilter: function () {
                return (this.lastRequest && this.lastRequest.filter && decodeURIComponent(this.lastRequest.filter).replace(/\+/g, ' ')) || '';
            },

            sortBy: function(sortString) {
                if(this.lastRequest.sortBy === "undefined") {
                    // delete conf.sortBy;
                    this.lastRequest.sortBy = "";
                }
                return this.apiGet($.extend(this.lastRequest, { sortBy: sortString }));
            },

            filterBy: function (filterString) {
                return this.apiGet($.extend(this.lastRequest, { filter: filterString }));
            },

            initialize: function() {
                this.lastRequest = this.buildRequest();
            },
            
            productViews : function(){
                return productViews;
            },
            currentProductView : function(){
                return defaultProductView;
            },
            setCurrentProductView: function(val){
                if(val !== '' && typeof val != 'undefined')
                    defaultProductView = val;
                return defaultProductView;
            }    
        });
        
        return Backbone;
});


