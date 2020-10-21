/* jshint ignore:start */

define(['modules/jquery-mozu'], 
    function($) {
        
        // displayPowerReviews("snippet", $("#ReviewHeader"),productCode);
        // displayPowerReviews("engine", $("#ReviewsContainer"),productCode);
          
    return {
        
        displayPowerReviews : function(type,selector){
            selector.each(function(){
                
                $this = $(this);
                
                var productCode = $this.data("mz-productcode");
                // var productCode = "9001-UNBEARHOT" ;
                
                // console.log("Product COde : "+productCode);
                POWERREVIEWS.display[type](
                {
                    write: function(content) {
                        
                        var frag = $(content)[0];
                        if (frag && ((frag.rel && frag.rel.toLowerCase() === "stylesheet") || (frag.type && frag.type.toLowerCase() === "text/javascript"))) {
                            $('head').append(frag);
                        } else {
                            if ($this[0].innerHTML.length === 0 ) {
                                $this.append(frag);
                            }
                        }
                    }
                }, {
                    pr_page_id : ''+productCode,
                    pr_write_review : location.origin+'/write-a-review?pr_page_id='+productCode
                });    
            });
                
        },
        
        displayReviewSnippet : function(selector){
            this.displayPowerReviews("snippet", selector);
        },
        displayReviews : function(selector){
            this.displayPowerReviews("engine", selector);
        }      
        
    };
});

/* jshint ignore:end */
