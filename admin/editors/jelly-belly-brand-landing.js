var TYPE_LOGO = 1, TYPE_BEAN = 2, TYPE_BANNER = 3;
var CHANGE_TYPE_NAME = "name", CHANGE_TYPE_ORDER = "order", CAHNGE_TYPE_LINK = "link", CHANGE_TYPE_REMOVE = "remove";

    Ext.widget({
        xtype   : 'mz-form-widget',
        itemId: 'brandlanding',
        anchor: "100%",
        
        defaults: {
            xtype: 'textfield',
            listeners: {
                controller: '',
                change: function (cmp) {
                    controller = cmp;
                    cmp.up('#brandlanding').updatePreview();
                },
                filechange: function(filelist){
                    if(this.itemId === "brandlogoupload"){
                        controller.up('#brandlanding').handleUploadFile(filelist,controller.up('#brandlanding'),TYPE_LOGO);
                    }else if(this.itemId === "beans"){
                        controller.up('#brandlanding').handleUploadFile(filelist,controller.up('#brandlanding'),TYPE_BEAN);
                    }else if(this.itemId === "sidebannerupload"){
                        controller.up('#brandlanding').handleUploadFile(filelist,controller.up('#brandlanding'),TYPE_BANNER);
                    }
                }
            }
        },
        
        
        items: [
            {
                xtype   : "tacofilefield",
                itemId  : "brandlogoupload",
                text    : "Upload Brand Logo"
            },
            {
              xtype         : "textfield",
              itemId        : "brandlogo",
              id            : "brandlogo",
              fieldLabel    : "Logo Image URL",
              name          : "brandlogo",
              width         : '97%'
            },
            {
              xtype         : "textfield",
              itemId        : "brandname",
              fieldLabel    : "Brand Name",
              name          : "brandname",
              width         : '97%'
            },
            {
              xtype         : "textarea",
              itemId        : "description",
              fieldLabel    : "Description",
              name          : "description",
              width         : '97%'
            },
            {
                xtype   : "tacofilefield",
                itemId  : "beans",
                text    : "Bean images"
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
                xtype   : "tacofilefield",
                itemId  : "sidebannerupload",
                text    : "Upload Side Banner"
            },
            {
              xtype         : "textfield",
              itemId        : "sidebanner",
              id            : "sidebanner",
              fieldLabel    : "Logo Image URL",
              name          : "sidebanner",
              width         : '97%'
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
        
        handleUploadFile: function(a,cmp, type) {
            cmp.onUploadFile(a, this, cmp, type);
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
            this.createBeanEditablePreview(arr);
        },
        
        createBeanEditablePreview: function(arr){
            var meThis = this;
            var data;
            var preview = this.down('#preview');
            var el =  preview.getEl();
            if(el && el.dom){
                el.dom.innerHTML = "";
            }
            // beanObj.imgUrl = url;
            // beanObj.order = 0;
            // beanObj.id = "UUID0";
            // beanObj.link = "";
            // beanObj.name = name;
            for(var i =0 ; i < arr.length; i++){
                data = arr[i];
                
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
                    meThis.editValue(e.target.getAttribute("editingItem"),CHANGE_TYPE_ORDER);  
                };
                
                var img = document.createElement('IMG');
                img.src = data.imgUrl;
                img.width = 100;
                img.height = 85;
                
                var link = document.createElement('BUTTON');
                link.innerText  = "Edit Link : "+data.link;
                link.setAttribute("editingItem",data.id);
                link.style.background= "rgb(16, 117, 202)";
                link.style.border= "1px solid #EEE";
                link.style.color= "#FFF";
                link.style.width= "130px";
                link.style.display= "block";
                link.style.padding= "5px 8px";
                link.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"),CAHNGE_TYPE_LINK);
                };
                
                var name = document.createElement('BUTTON');
                name.innerText  = "Edit Name : "+data.name;
                name.setAttribute("editingItem",data.id);
                name.style.background= "rgb(16, 202, 47)";
                name.style.border= "1px solid #EEE";
                name.style.color= "#FFF";
                name.style.width= "130px";
                name.style.display= "block";
                name.style.padding= "5px 8px";
                name.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"),CHANGE_TYPE_NAME);
                };
                
                var remove = document.createElement('BUTTON');
                remove.innerText  = "Remove";
                remove.style.width= "100%";
                remove.style.display= "block";
                remove.setAttribute("editingItem",data.id);
                remove.style.background= "#b12613";
                remove.style.border= "1px solid #EEE";
                remove.style.color= "#FFF";
                remove.style.padding= "5px 8px";
                remove.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"),CHANGE_TYPE_REMOVE);
                };
                parent.appendChild(order);
                parent.appendChild(img);
                parent.appendChild(name);
                parent.appendChild(link);
                parent.appendChild(remove);
                
                if(el && el.dom)
                    el.dom.appendChild(parent);
            }
        },
        
        editValue: function(id,type){
            var meThis = this;
            var property = "";
            var currentValue = meThis.getCurrentItem(id);
            if(currentValue !== ''){
                switch(type) {
                    case CHANGE_TYPE_NAME:
                        Ext.Msg.prompt('NAME', 'Please enter new name for this bean:', function(btn, newVal){
                            if (btn == 'ok'){
                                meThis.updateData(id,type,currentValue.order,newVal);
                            }
                        },this, false,currentValue[type]?currentValue[type]:'');
                        
                        break;
                    case CHANGE_TYPE_ORDER:
                        Ext.Msg.prompt('ORDER', 'Please enter new ordernumber for this bean:', function(btn, newVal){
                            if (btn == 'ok'){
                                meThis.updateData(id,type,currentValue.order,newVal);
                            }
                        },this, false,currentValue[type]?currentValue[type]:'');
                        
                        break;
                    case CAHNGE_TYPE_LINK:
                        Ext.Msg.prompt('LINK', 'Please enter new link for this bean:', function(btn, newVal){
                            if (btn == 'ok'){
                                meThis.updateData(id,type,currentValue.order,newVal);
                            }
                        },this, false,currentValue[type]?currentValue[type]:'');
                        
                        break;
                    case CHANGE_TYPE_REMOVE:
                        meThis.removeItem(id);
                        break;
                }
            }
        },
        
        updateData: function(id, type, oldVal, newVal){
            var meThis = this;
            var property = "";
            var currentItem = meThis.getCurrentItem(id);
            var arrayData = Ext.getCmp('arraydata');
            var arr = arrayData.getValue();
            if(currentItem !== ''){
                switch(type) {
                    case CHANGE_TYPE_NAME:
                        if(arrayData.getValue().length > 0){
                            for( var i = 0; i<arr.length;i++){
                                if(arr[i].id === id){
                                    arr[i][type] = newVal;
                                }
                            }
                        }
                        break;
                    case CHANGE_TYPE_ORDER:
                        if(newVal> -1  && newVal < arrayData.getValue().length && arrayData.getValue().length > 0){
                            arr[oldVal][type] = newVal;
                            arr[newVal][type] = oldVal;
                        }else{
                            Ext.Msg.alert('SORY!', 'Please provide a order number less than the number of recipies added. Please note the order indexing is starting from zero.');
                        }
                        break;
                    case CAHNGE_TYPE_LINK:
                        if(arrayData.getValue().length > 0){
                            for( i = 0; i<arr.length;i++){
                                if(arr[i].id === id){
                                    arr[i][type] = newVal;
                                }
                            }
                        }
                        break;
                }
            }
            arrayData.setValue(meThis.sortArrayBasedOnOrder(arr));
            meThis.updatePreview();
        },
        
        sortArrayBasedOnOrder: function(arr){
            return arr.sort(function(a,b) {return a.order - b.order});
        },
        
        removeItem:function(id){
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
                for( i = removedItem.order; i<arr.length ; i++){
                    arr[i].order = i;
                }    
                arrayData.setValue(meThis.sortArrayBasedOnOrder(arr));
            }
            meThis.updatePreview();
        },
        
        getCurrentItem: function(id){
            var arrayData = Ext.getCmp('arraydata');
            if(arrayData.getValue().length > 0){
                var arr = arrayData.getValue();
                for( var i = 0; i<arr.length;i++){
                    if(arr[i].id === id){
                        return arr[i];
                    }
                }
            }
            return '';
        },
        
        imageUploadCompleate: function(url, name, type){
            if(type == TYPE_LOGO){
                Ext.getCmp('brandlogo').setValue(url);
            } else if(type == TYPE_BEAN){
                this.createBeanData(url,name);
            }else if (type == TYPE_BANNER){
                Ext.getCmp('sidebanner').setValue(url);
            }
        },
        
        createBeanData: function(url,name){
            var beanObj = {};
            beanObj.imgUrl = url;
            beanObj.order = 0;
            beanObj.id = "UUID0";
            beanObj.link = "";
            beanObj.name = name;
            this.updateBeanData(beanObj);
        },
        
        updateBeanData: function(beanObj){
            var arrayData = Ext.getCmp('arraydata');
            var arr = arrayData.getValue();
            if(arr.length > 0 ){
                beanObj.order = arr.length;
                beanObj.id = "UUID"+arr.length;
                arr.push(beanObj);
                arrayData.setValue(arr);
            }else{
                arrayData.setValue(beanObj);
            }
        },
        
        onUploadFile: function(a, meThis, cmp, type){
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
                    cmp.imageUploadCompleate(h.document.data.url, h.document.data.name,type);
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
        }
        
        
    });










