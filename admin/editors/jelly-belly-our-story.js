
    Ext.widget({
        xtype   : 'mz-form-widget',
        itemId: 'ourstory',
        anchor: "100%",
        
        defaults: {
            xtype: 'textfield',
            listeners: {
                controller: '',
                change: function (cmp) {
                    controller = cmp;
                    cmp.up('#ourstory').updatePreview();
                },
                filechange: function(filelist){
                    controller.up('#ourstory').handleUploadFile(filelist,controller.up('#ourstory'));
                }
            }
        },
        
        
        items: [
            {
                xtype   : "tacofilefield",
                itemId  : "imageUploadButton",
                text    : "Upload images"
            },
            {
                xtype   : 'progressbar',
                text    : 'Upload status',
                id      : 'progressbar',
                itemId  : 'progressbar',
                width   :  '97%'
            },
            {
                xtype       : 'container',
                width       : '100%',
                height      : 300,
                autoScroll  : true,
                padding     : '20 0 20 0',
                itemId      : 'preview-container',
                style: {
                    background: "#EEE",
                    color: "#FFF",
                    "text-decoration": "none"
                },
                items: [
                    {
                        xtype: 'component',
                        itemId: 'preview',
                        autoEl: {
                                    html  : ''
                                }
                    }
                ]
            },
            {
                xtype       : "taco-arrayField",
                name        : "data",
                itemId      : "arraydata",
                id          : "arraydata",
                width       : '97%',
                hidden      : true
            }
        ],
        
        handleUploadFile: function(a,cmp) {
            cmp.onUploadFile(a, this, cmp);
        },
        
        listeners: {
            afterrender: function (cmp) {
                this.updatePreview();
            }
        },
        updatePreview: function () {
            var formValues = this.getForm().getValues();
            console.log("Update preview");
            var arr = formValues.data;
            this.createHistoryPreview(arr);
        },
        createHistoryPreview: function(array){
            var meThis = this;
            var data;
            var preview = this.down('#preview');
            var el =  preview.getEl();
            if(el && el.dom){
                el.dom.innerHTML = "";
            }
            for(index =0 ;index < array.length; index++ ){
                data = array[index];
                
                var parent = document.createElement('DIV');
                parent.style.float = 'left';
                parent.style.margin = '5px';
                parent.style.textAlign = 'center';
                parent.style.border = "1px solid #CFC3C3";
                parent.style.padding = "5px";
                parent.style.borderRadius = "4px";
                
                var order = document.createElement('SPAN');
                order.style.color = "#074e7c";
                order.style.cursor = "pointer";
                order.style.display = "block";
                order.style.border = "1px solid #CCC";
                order.style.padding = "3px";
                order.style.margin = "6px 0px";
                console.log(data.order);
                order.innerText  = data.order;
                order.setAttribute("editingItem",data.id);
                order.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"),"order",data.order);  
                };
                
                var img = document.createElement('IMG');
                img.src = data.imageUrl;
                img.width = 100;
                img.height = 85;
                
                var link = document.createElement('BUTTON');
                link.innerText  = "Edit Details";
                link.setAttribute("editingItem",data.id);
                link.style.background= "#CA1010";
                link.style.border= "1px solid #EEE";
                link.style.color= "#FFF";
                link.style.width= "100%";
                link.style.display= "block";
                link.style.padding= "5px 8px";
                link.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"),"editdetails");
                };
                
                var remove = document.createElement('BUTTON');
                remove.innerText  = "Remove";
                remove.style.width= "100%";
                remove.style.display= "block";
                remove.setAttribute("editingItem",data.id);
                remove.style.background= "rgb(16, 117, 202)";
                remove.style.border= "1px solid #EEE";
                remove.style.color= "#FFF";
                remove.style.padding= "5px 8px";
                remove.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"),"remove");
                };
                parent.appendChild(order);
                parent.appendChild(img);
                parent.appendChild(link);
                parent.appendChild(remove);
                
                if(el && el.dom)
                    el.dom.appendChild(parent);
            }
        },
        
        editValue: function(id,property,oldVal){
            var meThis = this;
            var currentValue = meThis.getCurrentItem(id);
            if(property != "remove"){
                    if(property === "editdetails"){
                        meThis.editHistoryDetails(id);
                    }else if(property === "order"){
                        Ext.Msg.prompt('Change order', 'Please enter new order number:', function(btn, newVal){
                            if (btn == 'ok'){
                                meThis.changeOrder(id,property,currentValue[property],newVal);
                            }
                        },this, false,currentValue[property]?currentValue[property]:'');
                    }
            }else{
                meThis.removeItem(id);
            }
        },
        
        onUploadFile: function(a, meThis, cmp){
            var g = meThis,
                k = /image.*/,
                b = false,
                h = [],
                d = [],
                kkk = 0;
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
                //UPLOAD PROGRESS FUNCTION
                var x = Taco.core.util.UploadManager.events.progress.listeners[1];
                x.fireFn = function(h){ 
                    kkk++;
                    if(kkk != d.length && h.percentUploaded < 1){
                        Ext.getCmp('progressbar').updateProgress( (kkk/d.length) + (h.percentUploaded*100), kkk+'.'+h.percentUploaded*100+' out of '+d.length, true );
                    }else{
                        Ext.getCmp('progressbar').updateProgress( 1, 'Upload Compleated', true );
                    }
                }
                //ON UPLOAD COMPLETE
                var y = Taco.core.util.UploadManager.events.complete.listeners[0];
                y.fireFn = function(h){
                    cmp.addStory(h.document.data.url);
                }
                //ON UPLOAD ERROR
                var z = Taco.core.util.UploadManager.events.uploaderror.listeners[0];
                z.fireFn = function(h){
                    Ext.Msg.alert('ERROR!!!', 'Error in uploading file, please try again.');
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
        },
        
        addStory : function(imgURL){
            var recipeObject  = new Object();
            recipeObject.id = "UUID0";
            recipeObject.imageUrl = imgURL;
            recipeObject.order = 0;
            recipeObject.details = {};
            this.updateArrayData(recipeObject);
        },
        
        updateArrayData: function(storyObj){
            var arrayData = Ext.getCmp('arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                storyObj.id = "UUID"+arr.length;
                storyObj.order = arr.length;
                arr.push(storyObj);
                arrayData.setValue(arr);
            }else{
                arrayData.setValue(storyObj);
            }
        },
        
        
        changeOrder: function(id, property, oldVal, newVal){
            var arrayData = Ext.getCmp('arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                if(newVal < arr.length && newVal > -1 ){
                    arr[oldVal][property] = newVal;
                    arr[newVal][property] = oldVal;
                    arr =  arr.sort(function(a,b) {return a.order - b.order});
                }else{
                    Ext.Msg.alert('SORY!', 'Please provide a order number less than the number of recipies added. Please note the order indexing is starting from zero.');
                }
                arr =  arr.sort(function(a,b) {return a.order - b.order});
                arrayData.setValue(arr);
                this.updatePreview();
            }
        },
        removeItem: function(id){
            var arrayData = Ext.getCmp('arraydata');
            var removedItem;
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                for( var i = 0; i<arr.length;i++){
                    if(arr[i].id === id){
                        removedItem = arr[i];
                        arr.splice(i,1);
                    }
                }
                
                for(var i = removedItem.order; i<arr.length ; i++){
                    arr[i].order = i;
                }    
                
                arrayData.setValue(arr);
            }
        },
        getCurrentItem: function(id){
            var arrayData = Ext.getCmp('arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                for( var i = 0; i<arr.length;i++)
                    if(arr[i].id === id){
                        return arr[i];
                    }
                arrayData.setValue(arr);
            }
            return '';
        },
        
        editHistoryDetails: function(id){
            var meThis = this;
            var currentItem = this.getCurrentItem(id);
            var saveFn = function(){
                var thump = detailsWindow.down('#thumpUrl').getValue();
                var head = detailsWindow.down('#headline').getValue();
                var details = detailsWindow.down('#details').getValue();
                meThis.updateData(thump,head,details,id);
                detailsWindow.close();
            };   
            var cancelFn = function(){
                detailsWindow.close();
            };
            
            if(currentItem !== ''){
                var detailsWindow = meThis.getDetailsReadingWindow(saveFn,cancelFn,currentItem);
                detailsWindow.show();
            }
        },

        getDetailsReadingWindow: function(saveFn,cancelFn,currentItem){
            return Ext.create("Ext.Window",{
                title : 'Extra window!',
                closable : true,                    
                modal : true,
                itemId : 'detailWindow',
                id: 'detailWindow',
                layout: "vbox",
                items:[
                    {
                        xtype   : "tacofilefield",
                        itemId  : "thumpnail",
                        text    : "Upload Thumbanil",
                        listeners: {
                            filechange: function(filelist){
                                var a = filelist;
                                var meThis = this;
                                var k = /image.*/, b = false, h = [], d = [], kkk = 0;
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
                                    //ON UPLOAD COMPLETE
                                    var y = Taco.core.util.UploadManager.events.complete.listeners[0];
                                    y.fireFn = function(h){
                                        var main =  meThis.up('#detailWindow');
                                        main.down('#thumpUrl').setValue(h.document.data.url);
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
                        }
                    },
                    {
                        xtype: 'textfield',
                        width: 700,
                        allowBlank: false,
                        itemId : 'thumpUrl',
                        id: 'thumpUrl',
                        fieldLabel: 'Thimpnail URL',
                        value: currentItem.details? currentItem.details.thump : '',
                        name: 'thumpnail',
                    },
                    {
                        xtype: 'textfield',
                        width: 700,
                        allowBlank: false,
                        itemId : 'headline',
                        id: 'headline',
                        value: currentItem.details? currentItem.details.head : '',
                        fieldLabel: 'Headline Text',
                        name: 'headline',
                    },
                    {
                        xtype: 'textarea',
                        width: 700,
                        allowBlank: false,
                        itemId : 'details',
                        id: 'details',
                        value: currentItem.details? currentItem.details.details : '',
                        fieldLabel: 'Details ',
                        name: 'details',
                    },
                    {
                        xtype:'button',
                        text:'Save',
                        style: {
                            width: "250px",
                            padding: "10px 5px 5px",
                            background: "#2ecc71",
                            color: "#FFF",
                            "text-decoration": "none"
                        },
                        handler:function(){
                           saveFn();
                        }
                    },
                    {
                        xtype:'button',
                        text:'Cancel',
                        style: {
                            width: "250px",
                            padding: "10px 5px 5px",
                            background: "#95a5a6",
                            color: "#FFF",
                            "text-decoration": "none"
                        },
                        handler:function(){
                           cancelFn();
                        }
                    }
                ]
            });
        },
        updateData: function(thump,head,details,id){
            var meThis = this;
            var item = meThis.getCurrentItem(id);
            if(item !== ''){
                meThis.removeItem(id);
                item.details = {};
                item.details.thump = thump;
                item.details.head = head;
                item.details.details = details;
                var arrayData = Ext.getCmp('arraydata');
                var arr = arrayData.getValue();
                item.order = arr.length;
                arr.push(item);
                arr =  arr.sort(function(a,b) {return a.order - b.order});
                arrayData.setValue(arr);
            }
        }
        
        
    });









