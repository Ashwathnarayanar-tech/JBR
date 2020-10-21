
Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'plp-with-bg',
    
    items: [
            {
                    xtype: "taco-productfield",
                    name: "products",
                    fieldLabel: "Products to be listed",
                    width: 500
            },  
            {
                xtype: "checkboxfield",
                name: "showHideSpecialButton",
                fieldLabel: "Show Special Button"
            },
            {
                    xtype: 'textfield',
                    fieldLabel: 'Common link name for products',
                    width: 500,
                    allowBlank: false,
                    name: 'linkName'
            },
            {
                xtype: 'combobox',
                fieldLabel: 'Rating',
                store       : [
                        [true,'show'],
                        [false,'hide']
                    ],
                    width: 500,
                    allowBlank: false,
                name: 'rating'
            },
            {
                xtype: 'combobox',
                fieldLabel: 'Reviews',
                store       : [
                        [true,'show'],
                        [false,'hide']
                    ],
                    width: 500,
                    allowBlank: false,
                name: 'review'
            },
            {
                xtype: 'combobox',
                fieldLabel: 'Product Image size',
                store       : [
                        [100,'small'],
                        [200,'medium'],
                        [300,'large']
                    ],
                    width: 500,
                    allowBlank: false,
                name: 'imgSize'
            },
            {
                xtype: 'combobox',
                fieldLabel: 'Alignment of Products',
                name: 'alignment',
                 store       : [
                        ['left','Left'],
                        ['center','Center'],
                        ['right','Right']
                    ]
            }
            
    ],
});



