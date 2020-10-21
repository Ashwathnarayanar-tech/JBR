Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'question',
     
    
    items: [
     
            {
                    xtype: 'textfield',
                    width: 700,
                    allowBlank: false,
                    fieldLabel: 'Question Text',
                    name: 'question'
            },
            {
                    xtype: 'textareafield',
                    width: 700,
                    allowBlank: false,
                    fieldLabel: 'Answer Text',
                    name: 'answer' 
            }
            
            
            
            ]
});
            

