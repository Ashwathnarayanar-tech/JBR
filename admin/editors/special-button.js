Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'hrRuleForm',
    defaults: {
        xtype: 'textfield',
        editable: false,
        listeners: {
            change: function (cmp) {
               cmp.up('#hrRuleForm').updatePreview();
            }
        }
    },
    
    items: [
                {
                    xtype: 'textfield',
                    fieldLabel: 'label',
                    name: 'name'
                },{
                    xtype: 'textfield',
                    fieldLabel: 'label',
                    name: 'link'
                },                
                {
                    xtype: 'colorfield',
                    fieldLabel: 'Text Color',
                    name: 'textColor'
                },
                {
                    xtype: 'colorfield',
                    fieldLabel: 'Text Hover Color',
                    name: 'textHoverColor'
                },
                
                {
                    xtype: 'colorfield',
                    fieldLabel: 'Gradient starting Color',
                    name: 'gradientStartingColor'
                },{
                    xtype: 'colorfield',
                    fieldLabel: 'Gradient Ending Color',
                    name: 'gradientEndingingColor'
                },
                
                {
                    xtype: 'colorfield',
                    fieldLabel: 'Border Color',
                    name: 'borderColor'
                },{
                    xtype: 'numberfield',
                    fieldLabel: 'Border radius',
                    name: 'borderRadius'
                },
                
                {
                    xtype: 'numberfield',
                    fieldLabel: 'Font size',
                    name: 'fontSize'
                },{
                    xtype: 'combobox',
                    fieldLabel: 'Alignment of button',
                    name: 'alignment',
                     store       : [
                            ['left','Left'],
                            ['center','Center'],
                            ['right','Right']
                        ]
                },{
                    xtype: 'container',
                    width: '100%',
                    padding: '20 0 20 0',
                    itemId: 'preview-container',
                    fieldLabel: 'Preview',
                    items: [
                        {   
                            xtype: 'component',
                            itemId: 'preview',
                            autoEl: { tag: 'a', html:'123', href:'www.google.com'}
                        }
                    ]
                }
    ],


    listeners: {
        afterrender: function (cmp) {
            cmp.updatePreview();
        }
    },


    updatePreview: function () {


        var previewEl = this.down('#preview').getEl(),
            formValues = this.getForm().getValues(),
            newStyles = {};


        if (previewEl) {
            previewEl.setHTML( formValues.name);
            previewEl.dom.setAttribute('href',formValues.link);
            newStyles['color'] = formValues.textColor;
            newStyles['font-size'] = formValues.fontSize+"pt";
            newStyles['padding'] = "6px";
            newStyles['border'] = "1px solid";
            newStyles['border-radius'] = formValues.borderRadius+"px";
            newStyles['border-color'] = formValues.borderColor;
            // newStyles['background'] = '-moz-linear-gradient(top, '+formValues.gradientStartingColor+' 0%,'+formValues.gradientEndingingColor+' 100%)';
            newStyles['background'] = '-webkit-linear-gradient(top, '+formValues.gradientStartingColor+' 0%,'+formValues.gradientEndingingColor+' 100%)';
            // newStyles['background'] = '-o-linear-gradient(top, '+formValues.gradientStartingColor+' 0%,'+formValues.gradientEndingingColor+' 100%)';
            previewEl.applyStyles(newStyles);
            console.log(formValues);
        }
    }
});

            




