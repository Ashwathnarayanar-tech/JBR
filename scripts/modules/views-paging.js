/**
 * Can be used on any Backbone.MozuModel that has had the paging mixin in mixins-paging added to it.
 */
 // Changes made by Amit for Sort By Bug on 25June at line no 77 and 78
define(['modules/jquery-mozu', 'underscore', 'modules/backbone-mozu'], function($, _, Backbone) {

    var PagingBaseView = Backbone.MozuView.extend({
        initialize: function() {
            if (!this.model._isPaged) {
                throw "Cannot bind a Paging view to a model that does not have the Paging mixin!";
            }
        },
        render: function() {
            Backbone.MozuView.prototype.render.apply(this, arguments);
            this.$('select').each(function() {
              
                var $this = $(this);
                $this.val($this.find('option[selected]').val());
            });
        }
    });

    var PagingControlsView = PagingBaseView.extend({
        templateName: 'modules/common/paging-controls',
        autoUpdate: ['pageSize','pageView'],   
        updatePageSize: function(e) {
            var newSize;
            if($(e.currentTarget).val() == 'Max'){
                newSize = 300;
            }else{
                newSize = parseInt($(e.currentTarget).val(),10);
            }
            var currentSize = this.model.get('pageSize');
            if (isNaN(newSize)) throw new SyntaxError("Cannot set page size to a non-number!");
            if (newSize !== currentSize) this.model.set('pageSize', newSize);
        },
        updatePageView: function(e) {
            this.model.setCurrentProductView(($(e.currentTarget).val()));
        }
    });
    
    var PageNumbersView = PagingBaseView.extend({
        templateName: 'modules/common/page-numbers',
        previous: function(e) {
            e.preventDefault();
            scrollToTop();
            return this.model.previousPage();
        },
        next: function(e) {
            e.preventDefault();
            scrollToTop();
            return this.model.nextPage();
        },
        page: function(e) {
            e.preventDefault();
            scrollToTop();
            return this.model.setPage(parseInt($(e.currentTarget).data('mz-page-num'),10) || 1);
        }
    });
    
    
    var scrollToTop = function() {
        $('body').ScrollTo({ duration: 500 });
    };

    var TopScrollingPageNumbersView = PageNumbersView.extend({
        previous: function() {
            return PageNumbersView.prototype.previous.apply(this, arguments).then(scrollToTop);
        },
        next: function() {
            return PageNumbersView.prototype.next.apply(this, arguments).then(scrollToTop);
        },
        page: function() {  
            return PageNumbersView.prototype.page.apply(this, arguments).then(scrollToTop);
        }
    });

    var PageSortView = PagingBaseView.extend({
        templateName: 'modules/common/page-sort',
        updateSortBy: function(e) {
            if(e.type === "change"){
                $(e.currentTarget).blur(); 
                if($(e.currentTarget).val() === "undefined")
                    return this.model.sortBy("");
                else  
                    return this.model.sortBy($(e.currentTarget).val());
            
            }
        }
    });
    
    
    var PageSortMobileView = PagingBaseView.extend({
        templateName: 'modules/common/page-sort-mobile',
        updateSortBy: function(e) {
            if(e.target.getAttribute('value') === "undefined")
                return this.model.sortBy("");
            else
                return this.model.sortBy(e.target.getAttribute('value'));
        },
        
        hideSortPopup: function(e){
            e.preventDefault();
            $('[data-mz-mobile-page-sort]').slideUp('slow');
        }
    });
    
    var MobilePagingView = PagingBaseView.extend({
        templateName: 'modules/common/page-controls-mobile',
        autoUpdate: ['pageSize'],
        updatePageSize: function (e) {
            var newSize;
            if($(e.currentTarget).val() == 'Max'){
                newSize = 300;
            }else{
                newSize = parseInt($(e.currentTarget,10).val(),10);
            }
            var currentSize = this.model.get('pageSize');
            if (isNaN(newSize)) throw new SyntaxError("Cannot set page size to a non-number!");
            if (newSize !== currentSize) this.model.set('pageSize', newSize);
        },
        previous: function (e) {
            e.preventDefault();
            return this.model.previousPage();
        },
        next: function (e) {
            e.preventDefault();
            return this.model.nextPage();
        },
        page: function (e) {
            e.preventDefault();
            return this.model.setPage(parseInt($(e.currentTarget).data('mz-page-num'),10) || 1);
        }
    });
    

    return {
        PagingControls: PagingControlsView,
        PageNumbers: PageNumbersView,
       TopScrollingPageNumbers: TopScrollingPageNumbersView,
        PageSortView: PageSortView,
        PageSortMobileView: PageSortMobileView,
        MobilePagingView: MobilePagingView
    };

});








