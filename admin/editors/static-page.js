Ext.widget({
   xtype:'mz-form-entity' ,
   layout:{
       type:'vbox',
       align:'stretch'
   },
   items:[
       {
           name:'title',
           xtype:'mz-input-text',
             fieldLabel: 'title'
       }, 
        {
           name:'Body',
           xtype:'mz-input-richtext',
           fieldLabel: 'Body', 
           height:500
       },
       {
           name:'category',
           xtype:'mz-input-text',
           fieldLabel: 'CategoryID'
       },
       {
           name:'metainfo',
           xtype:'mz-input-textarea',
           fieldLabel: 'Meta Description' 
       },
       {
           name:'metakey',
           xtype:'mz-input-textarea',
           fieldLabel: 'Meta Keywords'  
       }
       ]
  
});
