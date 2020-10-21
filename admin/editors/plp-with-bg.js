
Ext.widget({
    xtype: 'mz-form-widget',
    itemId: 'plpwithbg',
    
    defaults: {
        xtype: 'textfield',
        listeners: {
            controller: '',
            change: function (cmp) {
                controller = cmp;
            },
            filechange: function(filelist){
                controller.up('#plpwithbg').handleUploadFile(filelist,controller.up('#plpwithbg'));
            }
        }
    },
    
    
    items: [
                {
                    xtype: "tacofilefield",
                    itemId: "imageUploadButton",
                    text: "Upload new background image",
                    width: 500
                },{
                    xtype: 'textfield',
                    width: 500,
                    itemId: "imagefileid",
                    name: 'bgImg',
                    allowBlank: false
                },{
                    xtype: 'textfield',
                    fieldLabel: 'Common link name for 4 products',
                    width: 500,
                    name: 'linkName',
                    allowBlank: false
                },{
                    xtype: "taco-productfield",
                    name: "products",
                    fieldLabel: "Products to be listed",
                    width: 500,
                    maxSelections : 4,
                    listeners : {
                        controller: '',
                        beforeselect : function(combo,record,index,opts) {
                            if (combo.getValue().length == combo.maxSelections) {
                                  // maybe popup a warning
                                return false;
                            }
                        }
                    },
                    validator : function(obj) {
                        if (this.getValue().length > this.maxSelections) {
                            
                            return false;
                        }
                        else {
                            return true;
                        }
                    }
                },  {
                    xtype: 'textfield',
                    fieldLabel: 'First button link name',
                    width: 500,
                    name: 'name1',
                    allowBlank: false
                },{
                    xtype: 'textfield',
                    fieldLabel: 'First button link url',
                    width: 500,
                    name: 'url1',
                    allowBlank: false
                },{
                    xtype: 'textfield',
                    fieldLabel: 'Second button link name',
                    width: 500,
                    name: 'name2',
                    allowBlank: false
                },{
                    xtype: 'textfield',
                    fieldLabel: 'Second button link url',
                    width: 500,
                    name: 'url2',
                    allowBlank: false
                }
                
    ],
    
    
    handleUploadFile: function(a,cmp) {
            cmp.onUploadFile(a, this.down("#imagefileid"),this, cmp);
    },

    onUploadFile: function(a, ImagNameField, meThis, cmp){
            var g = meThis,
                k = /image.*/,
                b = false,
                h = [],
                d = [];
        
                Ext.each(a, function(e) {
                    d.push(e)
                });
            Ext.each(d, function(o) {
                var e, p, n;
                e = new FileReader();
                p = Ext.create("Taco.shared.model.File", {
                    name: o.name,
                    fileType: o.type,
                    isUploaded: false,
                    file: o
                });
                var x = Taco.core.util.UploadManager.events.complete.listeners[0]
                x.fireFn = function(h){ 
                    ImagNameField.setValue(h.document.data.url);
                }
                e.onload = function(r) {
                    var q;
                    if (o.type.match(k)) {
                        p.set("fileType", "image");
                        p.set("localthumbnail", r.target.result);
                        q = new Image();
                        q.onload = function() {
                            p.set("width", q.width);
                            p.set("height", q.height);
                            n.execute();
                            // ImagNameField.setValue(p.data.name);
                        };
                        q.src = r.target.result
                    } else {
                        n.execute();
                    }
                    };
                e.readAsDataURL(o);
                n = Taco.core.util.UploadManager.requestUpload({
                    document: p,
                    file: o,
                    url: "/admin/app/fileManagement/file/upload/{docid}"
                });
                h.push(p)
            });
    }

});





