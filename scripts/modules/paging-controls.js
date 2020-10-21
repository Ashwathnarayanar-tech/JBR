define(['modules/jquery-mozu', 'modules/backbone-mozu'], function($,Backbone){
    
    $(function() {
        
    
        var LayoutType = 'cellsByRow';
        var sortby = '';
        var $isotope ;
        if($( window ).width() > 768){
            require(['shim!vendor/isotope.min[jquery=jQuery]'], function() {
                    /*$isotope = $("#mz-productlist-list").isotope({
                        itemSelector: '.mz-productlist-item',
                        layoutMode: LayoutType,
                        animationOptions: {
                            duration: 400,
                            queue: false
                        }
                    }); */
            }); 
        }
        
        $(document).on('change',".mz-pagingcontrols-pagesize-dropdown[data-mz-value='pageView']",function(e) {
            e.preventDefault();
            var view = $(".mz-pagingcontrols-pagesize-dropdown[data-mz-value='pageView']").val();
            
            switch(view){
                    case('Grid'): 
                        LayoutType = 'cellsByRow';  
                        break;
                    case('List'): 
                        LayoutType = 'straightDown';
                        break;
            }
            // alert(view);
            PaginControlsUpdateLayout(LayoutType);
        });
    });  
    
        
    function PaginControlsUpdateLayout(LayoutType){
            if(LayoutType !== '' ){
            $("#mz-productlist-list").isotope({layoutMode: LayoutType});
                    if(LayoutType == "straightDown") { 
                        $('#mz-productlist-list').removeClass('mz-productlist-grid');
                        $('#mz-productlist-list').addClass("mz-productlist-list"); 
                    }
                    else {
                        $('#mz-productlist-list').removeClass('mz-productlist-list');
                        $('#mz-productlist-list').addClass("mz-productlist-grid"); 
                    }
                    $(window).smartresize();
                
            }
    }
       
    
    return {PaginControlsUpdateLayout:PaginControlsUpdateLayout};
    
});
        
       










