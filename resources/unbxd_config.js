//alert("hey");
window.searchobj = new Unbxd.setSearch({
  siteName : 'dev-jellybellyretailer-com809071570732436'
  ,APIKey : '70bb591fba456c80a31565aa0c866930'
  ,type : 'search'
  ,getCategoryId : ''
  ,inputSelector : '#search_input'
  ,searchButtonSelector : '#search_button'
  ,spellCheck : '#did_you_mean'
  ,spellCheckTemp : 'Did you mean : {{suggestion}} ?'
  ,searchQueryDisplay : '#search_title'
  ,searchQueryDisplayTemp : 'Showing results for {{query}} - {{start}}-{{end}} of {{numberOfProducts}} Results'
  ,pageSize : 20
  ,searchResultSetTemp : ['{{#products}}<li><a href="product.html?pid={{uniqueId}}" id="pdt-{{uniqueId}}" class="result-item" unbxdParam_sku="{{uniqueId}}" unbxdParam_pRank="{{unbxdprank}}" unbxdAttr="product">'
  		,'<div class="result-image-container">'
  			,'<span class="result-image-horizontal-holder">'
  				,'<img src="{{{image_url}}}" alt="{{{title}}}">'
  			,'</span>'
  		,'</div>'
  		,'<div class="result-brand">{{{brand}}}</div>'
  		,'<div class="result-title">{{{title}}}</div>'
  		,'<div class="result-price">'
  			,'${{price}}'
  		,'</div>'
  	,'</a></li>{{/products}}'].join('')
  ,searchResultContainer : '#results_container'
  ,isClickNScroll: true
  ,clickNScrollSelector : '#unbxd_load_more'
  ,isAutoScroll : false
  ,facetTemp : ['{{#facets}}<div class="facet-block">'
  		,'<h3>{{name}}</h3>'
  		,'<div class="facet-values">'
  			,'<ul>'
  				,'{{#selected}}'
  				,'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
  					,'<label for="{{../facet_name}}_{{value}}">'
  						,'<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue value}} ({{count}})'
  					,'</label>'
  				,'</li>'
  				,'{{/selected}}'
  				,'{{#unselected}}'
  				,'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
  					,'<label for="{{../facet_name}}_{{value}}">'
  						,'<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue value}} ({{count}})'
  					,'</label>'
  				,'</li>'
  				,'{{/unselected}}'
  			,'</ul>'
  		,'</div>'
  	,'</div>{{/facets}}'
  	,'{{#rangefacets}}<div class="facet-block"'
  	,'<h3>{{name}}</h3>'
  		,'<div class="facet-values">'
  			,'<ul>'
  				,'{{#selected}}'
  				,'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
  					,'<label for="{{../facet_name}}_{{value}}">'
  						,'<input type="checkbox" checked class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue begin}} - {{prepareFacetValue end}} ({{count}})'
  					,'</label>'
  				,'</li>'
  				,'{{/selected}}'
  				,'{{#unselected}}'
  				,'<li unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}">'
  					,'<label for="{{../facet_name}}_{{value}}">'
  						,'<input type="checkbox" class="filter-checkbox" unbxdParam_facetName="{{../facet_name}}" unbxdParam_facetValue="{{value}}" id="{{../facet_name}}_{{value}}"> {{prepareFacetValue begin}} - {{prepareFacetValue end}} ({{count}})'
  					,'</label>'
  				,'</li>'
  				,'{{/unselected}}'
  			,'</ul>'
  		,'</div>'
  	,'</div>{{/rangefacets}}'].join('')
  ,facetContainerSelector : "#facets_container"
  ,facetCheckBoxSelector : "input[type='checkbox']"
  ,facetElementSelector : "label"
  ,facetOnSelect : function(el){
  	//jQuery(el).addClass('selected');
  }
  ,facetOnDeselect : function(el){
      //jQuery(el).removeClass('selected');
  }
  ,facetMultiSelect : true
  ,selectedFacetTemp : ['{{#each filters}}'
  	,'{{#each this}}'
  		,'<div class="selected-facet clearfix">'
  			,'<div class="selected-facet-name lt">{{{prepareFacetValue @key}}}</div>'
  			,'<div class="selected-facet-delete rt" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">&times;</div>'
  		,'</div>'
  	,'{{/each}}'
  ,'{{/each}}'
  ,'{{#each ranges}}'
  	,'{{#each this}}'
  		,'<div class="selected-facet clearfix">'
  			,'<div class="selected-facet-name lt">{{{prepareFacetValue @key}}}</div>'
  			,'<div class="selected-facet-delete rt" unbxdParam_facetName="{{this}}" unbxdParam_facetValue="{{@key}}">&times;</div>'
  		,'</div>'
  	,'{{/each}}'
  ,'{{/each}}'].join('')
  ,selectedFacetContainerSelector : "#selected_facets"
  ,clearSelectedFacetsSelector : "#clear_all_selected_facets"
  ,removeSelectedFacetSelector : ".selected-facet-delete"
  ,selectedFacetHolderSelector : "selected_facet-holder"
  ,loaderSelector : "loading_indicator"//".result-loader"
  ,onFacetLoad : function(obj){}
  ,sanitizeQueryString : function(q){ return q;}
  ,getFacetStats : ""
  ,processFacetStats : function(obj){}
  ,setDefaultFilters : function(){}
  ,onIntialResultLoad : function(obj){}
  ,onPageLoad : function(obj){}
  ,onNoResult : function(obj){}
  ,bannerSelector: ".banner"
  ,isPagination: false
  ,bannerTemp: "<a href='{{landingUrl}}'><img src='{{imageUrl}}'/></a>"
  ,sortContainerSelector : "#sort_container"
  ,sortOptions: [{
  name: 'Relevancy'
  },{
  name: 'Price: H-L',
  field: 'price',
  order: 'desc'
  },{
  name: 'Price: L-H',
  field: 'price',
  order: 'asc'
  }]
  ,sortContainerType: 'select'
  ,sortContainerTemp: [
  '<select>',
  '{{#options}}',
  '{{#if selected}}',
  '<option value="{{field}}-{{order}}" unbxdsortField="{{field}}" unbxdsortValue="{{order}}" selected>{{name}}</option>',
  '{{else}}',
  '<option value="{{field}}-{{order}}" unbxdsortField="{{field}}" unbxdsortValue="{{order}}">{{name}}</option>',
  '{{/if}}',
  '{{/options}}',
  '</select>'
  ].join('')
  ,fields : ['image_url','title','brand','price','uniqueId']
  ,searchQueryParam:"q"
  ,retainbaseParam: false
  ,baseParams:[]
  });