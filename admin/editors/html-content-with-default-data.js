
var templateValue = '';
Ext.widget({
    xtype   : 'mz-form-widget',
    itemId  : 'dynamic1',
    
    items: [
        {
            xtype       : 'combobox',
            name        : 'templateOf',
            width       : 730, 
            fieldLabel  : 'Select template to load default values',
            store       : [
                            ['California Factory Events','California Factory Events'],
                            ['Careers','Careers'],
                            ['Event Calendar','Event Calendar'],
                            ['/templates/explore-product-static', 'Explore Our Product HTML'],
                            ['FAQ','FAQ'],
                            ['Footer About Jelly Belly','Footer About Jelly Belly'],
                            ['Footer Customer Service','Footer Customer Service'],
                            ['Footer News And Events','Footer News And Events'],
                            ['Footer Quick Links','Footer Quick Links'],
                            ['/templates/home-slider-static', 'Home Page Slide Show HTML'],
                            ['Pleasent Parties Events','Pleasent Parties Events'],
                            ['/templates/shopourproduct-slideshow-static', 'Shop Our Product Slide Show HTML'],
                            ['Sponsor Event Calendar','Sponsor Event Calendar'],
                            ['Store Locator','Store Locator'],
                            ['Unsubscribe Email','Unsubscribe Email'],
                            ['Wisconsin Factory Event Calendar','Wisconsin Factory Event Calendar'],
                            ['Jelly Belly Recipe','Jelly Belly Recipe'],
                            ['Image Category Listing','Image Category Listing'],
                            ['FLVG','Flavour Guide Block Structure'],
                            ['Footer International Flags','Footer International Flags']
                            
                        ],
            listeners   : {
                            change  : function(field, newValue, oldValue){
                                            var templateName = newValue;
                                            if (templateName.substring(0, 1) == "/") {
                                                getDefaultValue(templateName);
                                                Ext.getCmp('html_content').setValue(templateValue);
                                            }else{
                                                Ext.getCmp('html_content').setValue(getThirpartyIframe(templateName));
                                            }

                                    }
                        }             
        },
        {
            xtype       : "taco-codefield",
            mode        : "html",
            id          : "html_content",
            grow        : true,
            name        : "template",
            fieldStyle  : "resize:both;font-family:Monaco, Menlo, Consolas, 'Droid Sans Mono', Inconsolata, 'Courier New', monospace;height:100%",
            height      : 330,
            fieldLabel  : "HTML Content",
            width       : 800,
            value       : '<h1>Enter your sample code here</h1>'
        }
    ]
    
});

function getDefaultValue(templateName){
    
    var xhr = new XMLHttpRequest();
    xhr.open("GET", templateName, false);
    xhr.send();
    
    console.log(xhr.status);
    console.log(xhr.statusText);
    if(xhr.status == 200){
        templateValue =  xhr.responseText;
    }else{
        templateValue =  "Default data not retrived.";
        console.log(templateValue);
    }
}


function getThirpartyIframe(thirdParty){
    switch(thirdParty){
        
        case 'Careers'  : 
            return '<iframe id=\"gnewtonIframe\" name=\"gnewtonIframe\" width=\"100%\" height=\"825px\" frameborder=\"0\" scrolling=\"auto\" allowtransparency=\"true\" src=\"https://newton.newtonsoftware.com/career/CareerHome.action?clientId=8a75db204460250d01446a95766515a7&amp;\">Sorry, your browser doesn\'t seem to support Iframes!</iframe>';
    
        case 'FAQ'      :
            return '<iframe src=\"//mycusthelp.com/Jellybelly/\" frameborder=\"0\" height=\"1200\" width=\"100%\">&amp;nbsp;</iframe>';
    
        case 'Unsubscribe Email':
            return '<iframe seamless="seamless" id="preferenceCenter" style="width:100%;height:1440px;" scrolling="no" frameborder="0" src="" name="preferenceCenter"></iframe>'+
            '<script>'+
                'var params = location.search;'+
                'document.getElementById("preferenceCenter").setAttribute("src","https://snap.vidiemi.com/jb/Preference/"+params);'+
            '</script>'
            
        case 'Event Calendar':
            return '<iframe src=\"//www.google.com/calendar/embed?title=%20&amp;showTabs=0&amp;height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=jbdcalendar%40gmail.com&amp;color=%2329527A&amp;src=uhldl7upnkv35l6iruk72ra6ck%40group.calendar.google.com&amp;color=%237A367A&amp;src=9p53qpm6l7fqkbpcditmf139kk%40group.calendar.google.com&amp;color=%230D7813&amp;src=6fmg9vq7vrk8gif73likgru0a0%40group.calendar.google.com&amp;color=%23A32929&amp;src=4hpaoqhg7sigdibi84mph634ro%40group.calendar.google.com&amp;color=%23BE6D00&amp;ctz=America%2FLos_Angeles\" style=\"border-width: 0;vertical-align:top;\" width=\"655\" height=\"600\" frameborder=\"0\" scrolling=\"no\"></iframe><iframe src=\"//www.google.com/calendar/embed?mode=AGENDA&amp;height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=jbdcalendar%40gmail.com&amp;color=%2329527A&amp;src=uhldl7upnkv35l6iruk72ra6ck%40group.calendar.google.com&amp;color=%237A367A&amp;src=9p53qpm6l7fqkbpcditmf139kk%40group.calendar.google.com&amp;color=%230D7813&amp;src=6fmg9vq7vrk8gif73likgru0a0%40group.calendar.google.com&amp;color=%23A32929&amp;src=4hpaoqhg7sigdibi84mph634ro%40group.calendar.google.com&amp;color=%23BE6D00&amp;ctz=America%2FLos_Angeles\" style=\"border-width: 0\" width=\"285\" height=\"600\" frameborder=\"0\" scrolling=\"no\"></iframe>';

        case 'Sponsor Event Calendar':
            return '<iframe style=\"display: block; margin: 0 auto;\" width=\"925px\" height=\"600\" src=\"https://www.google.com/calendar/embed?title=Sports+Sponsorships+Event+Calendar&amp;showTabs=0&amp;height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=9p53qpm6l7fqkbpcditmf139kk@group.calendar.google.com&amp;color=%230D7813&amp;src=4hpaoqhg7sigdibi84mph634ro@group.calendar.google.com&amp;color=%23BE6D00&amp;ctz=America/Los_Angeles\"></iframe>';
        
        case 'Wisconsin Factory Event Calendar':
            return '<iframe src=\"//www.google.com/calendar/embed?title=Pleasant%20Prairie%20Center%20Events&amp;showNav=0&amp;showTabs=0&amp;height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=6fmg9vq7vrk8gif73likgru0a0%40group.calendar.google.com&amp;color=%23A32929&amp;ctz=America%2FLos_Angeles\" style=\"float:left; border-width:0;vertical-align:top;width:100%;height:500px;\" frameborder=\"0\" scrolling=\"no\"></iframe><iframe src=\"//www.google.com/calendar/embed?title=Jelly%20Belly%20Visitor%20Center%20Events&amp;showTitle=0&amp;showNav=0&amp;showDate=0&amp;showTabs=0&amp;mode=AGENDA&amp;height=556&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=6fmg9vq7vrk8gif73likgru0a0%40group.calendar.google.com&amp;color=%23A32929&amp;ctz=America%2FLos_Angeles\" style=\"float:let; border-width:0;padding-top:44px;width:100%;height:500px;\" frameborder=\"0\" scrolling=\"no\"></iframe>';
        
        case 'California Factory Events':
            return '<iframe src=\"//www.google.com/calendar/embed?title=Fairfield%20California%20Center%20Event%20Calendar&amp;height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=jbdcalendar%40gmail.com&amp;color=%2329527A&amp;src=jbdcalendar%40gmail.com&amp;color=%23AB8B00&amp;src=jbdcalendar%40gmail.com&amp;color=%232952A3&amp;src=jbdcalendar%40gmail.com&amp;color=%23A32929&amp;ctz=America%2FLos_Angeles\" style=\"float:left; border-width:0;\" width=\"650px\" height=\"600px\" frameborder=\"0\" scrolling=\"no\"></iframe><iframe src=\"//www.google.com/calendar/embed?showTitle=0&amp;showNav=0&amp;showDate=0&amp;showTabs=0&amp;showCalendars=0&amp;mode=AGENDA&amp;height=579&amp;wkst=1&amp;hl=en&amp;bgcolor=%23FFFFFF&amp;src=jbdcalendar%40gmail.com&amp;color=%2329527A&amp;src=jbdcalendar%40gmail.com&amp;color=%23AB8B00&amp;src=jbdcalendar%40gmail.com&amp;color=%232952A3&amp;src=jbdcalendar%40gmail.com&amp;color=%23A32929&amp;ctz=America%2FLos_Angeles\" style=\"float:let; border-width:0;padding-top:44px;\" width=\"300\" height=\"556\" frameborder=\"0\" scrolling=\"no\"></iframe>';
    
        case 'Pleasent Parties Events':
            return '<iframe src=\"//www.google.com/calendar/embed?title=Pleasant%20Prairie%20Center%20Events&amp;showNav=0&amp;showTabs=0&amp;height=600&amp;wkst=1&amp;bgcolor=%23FFFFFF&amp;src=6fmg9vq7vrk8gif73likgru0a0%40group.calendar.google.com&amp;color=%23A32929&amp;ctz=America%2FLos_Angeles\" style=\"float:left; border-width:0;\" width=\"650\" height=\"600\" frameborder=\"0\" scrolling=\"no\"></iframe>';
        
        case 'Footer About Jelly Belly':
            return          '<li><a href="/company-history">Company History</a></li>\n'+
                            '<li><a href="/general-facts">General Information About Our Products</a></li>\n'+
                            '<li><a href="/jelly-belly-customer-testimonials">Customer Testimonials</a></li>\n'+
                            '<li><a href="/jelly-belly-social-media">Social Media Links</a></li>\n'+
                            '<li><a href="/principles-and-practices">Principles and Practices</a></li>\n'+
                            '<li><a href="/careers">Careers</a></li>\n'+
                            '<li><a href="/wholesale-customers">Specialty Wholesale Customers</a></li>\n'+
                            '<li><a href="/wholesale-customers-national">National Wholesale Customers</a></li>\n'+
                            '<li><a href="/stores-outside-united-states">International</a></li>\n'+
                            '<li><a href="/information-for-students">Educators &amp; Students</a></li>\n'
                            '<li><a href="/logo-tm-use">Logo/TM/® Use</a></li>\n'+
                            '<li><a href="/privacy-policy">Privacy Policy</a></li>\n'+
                            '<li><a href="/terms-of-use">Terms of Use</a></li>\n'
                            '<li><a href="/vending">Vending</a></li>\n'
                            '<li><a href="/donations">Requests for Donations</a></li>\n';
        
        case 'Footer Customer Service':
            return              '<li><a href="/contact-us">Contact Us</a></li>\n'+
                                '<li><a href="/gift-cards">Buy a Gift Card</a></li>\n'+
                                '<li><a href="/frequently-asked-questions">FAQ</a></li>\n'+
                                '<li><a href="/StoreLocator">Store Locator</a></li>\n'+
                                '<li><a href="https://www.myjellybelly.com/" target="_blank">Personalize &amp; Customize</a></li>\n'+
                                '<li><a href="/return-policy">Returns &amp; Refunds</a></li>\n'+
                                '<li><a href="/online-order-info-index">Online Order Information</a></li>\n'+
                                '<li><a id="unsublink" href="/jelly-belly-email-preference-center">Email Unsubscribe</a></li>\n'+
                                '<li><a href="/shipping-information">Shipping Information</a></li>\n'+
                                '<li><a href="/volume-discounts">Volume Discounts</a></li>\n'+
                                '<li><a href="/satisfaction-guarantee">Satisfaction Guarantee</a></li>\n'+
                                '<li><a href="/jelly-belly-email-preference-center">Email Preference Center</a></li>\n'+
                                '<li><a id="emailSignupFooter" href="javascript:void(0)">Jelly Belly Newsletter</a></li>\n';
    				
        
        case 'Footer News And Events':
            return              '<li><a href="http://news.jellybelly.com/index.php">Newsroom</a></li>\n'+
                                '<li><a href="/event-calendar">Event Calendar</a></li>\n'+
                                '<li><a href="/California-Factory-Events">Fairfield CA Events</a></li>\n'+
                                '<li><a href="/wisconsin-factory-event-calendar">Pleasant Prairie WI Events</a></li>\n'+
                                '<li><a href="/sponsorships-event-calendar">Jelly Belly Sponsor Events</a></li>\n'+
                                '<li><a href="/sportsSponsorships">Sponsorships</a></li>\n';
    					
        case 'Footer Quick Links':
            return 	        '<li><a class="Popup" href="http://www.sportbeans.com/">SportBeans.com</a></li>\n'+
                            '<li><a class="Popup" href="http://www.youtube.com/jellybelly">YouTube.com/JellyBelly</a></li>\n'+
                            '<li><a class="Popup" href="http://www.myjellybelly.com/" target="_blank">MyJellyBelly.com</a></li>\n'+
                            '<li><a class="Popup" href="https://jellybelly.affiliatetechnology.com/">Affiliate Program</a></li>\n'+
                            '<li><a class="candyCalculatorModal" href="/">Candy Calculator</a></li>\n';
        
        case 'Jelly Belly Recipe':
            return 	    '<div class="bean-recipe-row">\n'+
                                '<div class="headline-beans">\n'+ 
                                    '<h2>Chocolate Popcorn</h2>\n'+
                                '</div>\n'+
                                '<ul>\n'+
                                    '<li>\n'+
                                        '<figure>\n'+
                                            '<img alt="" title="Chocolate Pudding" src="/resources/images/jb-beans-receipe/pudding.jpg">\n'+
                                        '</figure>\n'+
                                        '<p>\n'+
                                            '<a href="/search?query=Chocolate+Pudding" title="Chocolate Pudding">Chocolate Pudding</a>\n'+
                                        '</p>\n'+
                                    '</li>\n'+
                                    '<li>\n'+
                                        '<figure>\n'+
                                            '<img alt="" title="Chocolate Pudding" src="/resources/images/jb-beans-receipe/pudding.jpg">\n'+
                                        '</figure>\n'+
                                        '<p>\n'+
                                            '<a href="/search?query=Chocolate+Pudding" title="Chocolate Pudding">Chocolate Pudding</a>\n'+
                                        '</p>\n'+
                                    '</li>\n'+
                                    '<li>\n'+
                                        '<figure>\n'+ 
                                            '<img alt="" title="Chocolate Pudding" src="/resources/images/jb-beans-receipe/pudding.jpg">\n'+
                                        '</figure>\n'+
                                        '<p>\n'+
                                            '<a href="/search?query=Chocolate+Pudding" title="Chocolate Pudding">Chocolate Pudding</a>\n'+
                                        '</p>\n'+
                                    '</li>\n'+
                                    '<li class="bg-none">\n'+
                                        '<figure>\n'+
                                            '<img alt="" title="Buttered Popcorn" src="/resources/images/jb-beans-receipe/popcorn.jpg">\n'+
                                        '</figure>\n'+
                                        '<p>\n'+
                                            '<a href="/search?query=Buttered+Popcorn" title="Buttered Popcorn">Buttered Popcorn</a>\n'+
                                        '</p>\n'+
                                    '</li>\n'+
                                    '<li class="result">\n'+
                                        '<figure>\n'+
                                            '<img alt="" title="" src="/resources/images/jb-beans-receipe/output9.png">\n'+
                                        '</figure>\n'+
                                        '<p></p>\n'+
                                    '</li>\n'+
                                '</ul>\n'+
                                '<div class="clear"></div>\n'+
                            '</div>\n';
            
        
        
        case 'Image Category Listing':
            return 	    '<div class="category-listing-block">\n'+
                            '<div class="category-image-block">\n'+
                                '<figure>\n'+
                                    '<img alt="" src="/resources/images/explore/beanboozled/beanboozled1.jpg" title="Lime">\n'+
                                '</figure>\n'+
                                '<p>\n'+
                                    '<a href="/search?query=beanboozled+jelly+belly" title="Lime">Lime</a>\n'+
                                '</p>\n'+
                            '</div>\n'+
                            '<div class="category-image-block">\n'+
                                '<figure>\n'+
                                    '<img alt="" src="/resources/images/explore/beanboozled/beanboozled3.jpg" title="Barf">\n'+
                                '</figure>\n'+
                                '<p>\n'+
                                    '<a href="/search?query=beanboozled+jelly+belly" title="Barf">Barf</a>\n'+
                                '</p>\n'+
                            '</div>\n'+
                        '</div>\n';  
         
        case 'FLVG':
            return          '<div class="jb-childcategory" data-mz-category-url="sours" data-mz-category-guide="sours">\n'+
                                '<div class="jb-colapsing-title">\n'+
                                   ' <h1 class="jb-category-title">5-Flavor Sours</h1>\n'+
                                  '  <p class="mz-desktop">open/close</p>\n'+
                                 '   <p class="mz-mobile">+</p>\n'+
                                '</div>\n'+
                        
                                '<div class="jb_contentfolder" style="display: none;">\n'+
                                    '<div class="jb-childcategory-description">Thrill your taste buds with the lip-puckering Jelly Belly Sours flavors of fruits with a hint of sour.This mix includes Sour Lemon, Sour Cherry, Sour Grape, Sour Apple and Sour Orange.</div>\n'+
                                    '<div class="jb-childChildrenCategories-container">\n'+
                                        
                                    '        <a href="search?query=Sour Apple">\n'+
                                     '           <div class="jb-childChildrenCategory" style="background-image:url(\'//cdn-sb.mozu.com/10417-13240/cms//files/sour_apple.jpg\');">\n'+
                                      '              <p href="search?query=Sour Apple">\n'+
                                       '                     Sour Apple\n'+
                                        '            </p>\n'+
                                         '       </div>\n'+
                                          '  </a>\n'+
                                        
                                           ' <a href="search?query=Sour Orange">\n'+
                                            '    <div class="jb-childChildrenCategory" style="background-image:url(\'//cdn-sb.mozu.com/10417-13240/cms//files/sour_orange.jpg\');">\n'+
                                             '       <p href="search?query=Sour Orange">\n'+
                                              '              Sour Orange\n'+
                                               '     </p>\n'+
                                                '</div>\n'+
                                            '</a>\n'+
                                    '</div>'+
                                 '   <div class="jb-child-category-button">\n'+
                                '        <a href="search?query=5-Flavor Sours">\n'+
                               '             <span>Shop</span>  5-Flavor Sours&nbsp;►\n'+
                              '          </a>\n'+
                             '           <a href="/">\n'+
                            '                <span>Find</span> a store near you&nbsp;►\n'+
                           '             </a>\n'+
                          '          </div>\n'+
                         '      </div> \n'+
                        '</div>\n';
                        
                        
        case 'Footer International Flags':
        return     '<ul class="mz-footer-links mz-international-flags mz-flags">\n'+
                        '<li><a  href="http://jellybelly.com/" title="United States"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/united-states-flag.png"/></a></li>\n'+
                        '<li><a  href="http://www.jellybelly.com.au/" title="Australia"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/aus-flag.png"/></a></li>\n'+
                        '<li><a  href="http://www.jellybelly.ca/" title="Canada"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/can-flag.png"/></a></li>\n'+
                        '<li><a  href="http://www.jellybelly.com" title="Chile"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/chile-flag.png"/></a></li>\n'+
                        '<li><a  href="http://www.jelly-belly.com.cn/" title="China"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/china-flag.png"/></a></li>\n'+
                        '<li><a  href="http://www.jellybelly.com" title="Colombia"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/colombia-flag.png"/></a></li>\n'+
                        '<li><a  href="http://intl.jellybelly.com/en-CA/FRA/home.aspx" title="France"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/france-flag.png"/></a></li>\n'+
                        '<li><a  href="http://www.jellybelly.de/" title="Germany"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/germany-flag.png"/></a></li>\n'+
                        '<li><a  href="http://www.jellybellyjapan.com/" title="Japan"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/japan-flag.png"/></a></li>\n'+
                        '<li><a  href="http://www.jellybelly.com" title="Mexico"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/mexico-flag.png"/></a></li>\n'+
                        '<li><a  href="http://intl.jellybelly.com/en-CA/ESP/home.aspx" title="Spain"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/spain-flag.png"/></a></li>\n'+
                        '<li><a  href="http://www.jellybelly.se/" title="Sweden"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/sweden-flag.png"/></a></li>\n'+
                        '<li><a  href="http://www.jellybelly-uk.com/" title="United Kingdom"><img src="//cdn-sb.mozu.com/10417-13240/cms/13240/files/uk-flag.png"/></a></li>\n'+
                    '</ul>\n';
        
    }
}














