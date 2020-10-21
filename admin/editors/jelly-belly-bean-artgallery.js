var TYPE_GALLERY_MAIN = 1, CHANGE_TYPE_DETAILS = "details", CHANGE_TYPE_ORDER ="order", CHANGE_TYPE_NAME = "name", CHANGE_TYPE_REMOVE = "remove";
Ext.widget({
    xtype   : 'mz-form-widget',
    itemId: 'artgallery',
    id: 'artgallery',
    anchor: "100%",
    defaults: {
        xtype: 'textfield',
        listeners: {
            controller: '',
            change: function (cmp) {
                controller = cmp;
                cmp.up('#artgallery').updatePreview();
            },
            filechange: function(filelist){
                console.log(45454545);
                if(this.itemId === "galleryMain"){
                    if(controller.up('#artgallery').down('#gallery_name').getValue().length > 0 ){
                        controller.up('#artgallery').handleUploadFile(filelist,controller.up('#artgallery'),TYPE_GALLERY_MAIN);
                    }else{
                        Ext.Msg.alert('ERROR!!!', 'A gallary name is need to add new gallery. Please specify a gallery name then upload your file again.');
                    }
                }
            }
        }
    },
    
    items: [
        
        {
            xtype       : "textfield",
            itemId      : "gallery_name",
            emptyText   : "Please type a gallary name",
            width       : 400
        },
        {
            xtype   : "tacofilefield",
            itemId  : "galleryMain",
            text    : "Add new gallery"
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
    
    listeners: {
        afterrender: function (cmp) {
            this.updatePreview();
        }
    },
    updatePreview: function () {
        var formValues = this.getForm().getValues();
        console.log("Update preview");
        var arr = formValues.data;
        this.showPreviewWithOptions(arr);
    },
    
    showPreviewWithOptions: function(arr){
        var meThis = this;
        var data;
        var preview = this.down('#preview');
        var el =  preview.getEl();
        if(el && el.dom){
            el.dom.innerHTML = "";
        }
        for(var i =0 ; i < arr.length ;  i++){
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
                img.src = data.mainImageURL;
                img.width = 100;
                img.height = 85;
                
            var name = document.createElement('BUTTON');
                name.innerText  = data.name;
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
            
            var editDetails = document.createElement('BUTTON');
                editDetails.innerText  = "Edit Details";
                editDetails.style.width= "100%";
                editDetails.style.display= "block";
                editDetails.setAttribute("editingItem",data.id);
                editDetails.style.background= "rgb(19, 79, 177)";
                editDetails.style.border= "1px solid #EEE";
                editDetails.style.color= "#FFF";
                editDetails.style.padding= "5px 8px";
                editDetails.onclick = function(e){
                    meThis.editValue(e.target.getAttribute("editingItem"),CHANGE_TYPE_DETAILS);
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
            parent.appendChild(editDetails);
            parent.appendChild(remove);
            
            if(el && el.dom)
                el.dom.appendChild(parent);    
                
        }
    },
    
    editValue: function(id,type){
        var meThis = this;
        var currentItem = meThis.getCurrentItem(id);
        if(currentItem !== ''){
            if(type === CHANGE_TYPE_DETAILS){
                this.editHistoryDetails(id);
            }else if (type === CHANGE_TYPE_ORDER){
                Ext.Msg.prompt('ORDER', 'Please enter a new order:', function(btn, newOrder){
                    if (btn == 'ok'){
                        meThis.changeGalleryOrder(currentItem.order,newOrder);
                    }
                },this, false,currentItem?currentItem.order:'');
            }else if (type === CHANGE_TYPE_REMOVE){
                this.removeGallery(id);
            }else if (type === CHANGE_TYPE_NAME){
                Ext.Msg.prompt('NAME', 'Please enter a new name:', function(btn, newName){
                    if (btn == 'ok'){
                        if(newName.length > 0){
                            newName = newName.trim();
                            currentItem[CHANGE_TYPE_NAME] = newName;
                            meThis.updateItem(currentItem);
                            meThis.updatePreview();
                        }else{
                            Ext.Msg.alert('Error','Please provide a valid name.');
                        }
                    }
                },this, false,currentItem?currentItem.name:'');
            }
        }
    },
    
    changeGalleryOrder: function(currentOrder,newOrder){
        var arrayData = Ext.getCmp('arraydata');
        if(arrayData.getValue().length > 0 && newOrder < arrayData.getValue().length){
            var arr = arrayData.getValue();
            arr[currentOrder][CHANGE_TYPE_ORDER] = newOrder;
            arr[newOrder][CHANGE_TYPE_ORDER] = currentOrder;
            arr =  arr.sort(function(a,b) {return a.order - b.order});
            arrayData.setValue(arr);
            this.updatePreview();
        }else{
            Ext.Msg.alert('SORY!', 'Please provide a order number less than the number of gallery added. Please note the order indexing is starting from zero.');
        }
    },
    
    editHistoryDetails: function(id){
        var meThis = this;
        var currentItem = this.getCurrentItem(id);
        var saveFn = function(){
            var mainImg = detailsWindow.down('#mainImage').getValue();
            var thumpImg = detailsWindow.down('#thumpUrl').getValue();
            var name = detailsWindow.down('#name').getValue();
            var artist = detailsWindow.down('#artist').getValue();
            var dimension = detailsWindow.down('#dimension').getValue();
            var year = detailsWindow.down('#year').getValue();
            var desc = detailsWindow.down('#description').getValue();
            
            if(mainImg.length <1 || thumpImg.length <1){
                Ext.Msg.alert('Error', 'Please provide both main and thump image url.');
            }else{
                var detailItem  = {};
                detailItem.mainImg = mainImg;
                detailItem.thumpImg = thumpImg;
                detailItem.name = name;
                detailItem.dimension = dimension;
                detailItem.year = year;
                detailItem.artist = artist;
                detailItem.desc = desc;
                detailItem.orderId = currentItem.details.length;
                currentItem.details.push(detailItem);
                meThis.updateItem(currentItem);
                detailsWindow.close();  
                meThis.updatePreview();
            }
        };   
        var saveFnEdit = function(){
            var mainImg = detailsWindow.down('#mainImageEdit').getValue();
            var thumpImg = detailsWindow.down('#thumpUrlEdit').getValue();
            var name = detailsWindow.down('#nameEdit').getValue();
            var dimension = detailsWindow.down('#dimensionEdit').getValue();
            var artist = detailsWindow.down('#artistEdit').getValue();
            var year = detailsWindow.down('#yearEdit').getValue();
            var desc = detailsWindow.down('#descriptionEdit').getValue();
            var orderId = detailsWindow.down('#selectedOrderId').getValue();
            if(orderId === null){
                Ext.Msg.alert('Error', 'Please select one item.');
            }else{
                if(mainImg.length <1 || thumpImg.length <1){
                    Ext.Msg.alert('Error', 'Please provide both main and thump image url.');
                }else{
                    var detailItem  = {};
                    detailItem.mainImg = mainImg;
                    detailItem.thumpImg = thumpImg;
                    detailItem.name = name;
                    detailItem.artist = artist;
                    detailItem.dimension = dimension;
                    detailItem.year = year;
                    detailItem.desc = desc;
                    detailItem.orderId = orderId;
                    for(var i = 0; i< currentItem.details.length; i++){
                        if(currentItem.details[i].orderId === detailItem.orderId){
                            currentItem.details[i] = detailItem;
                        }
                    }
                    meThis.updateItem(currentItem);
                    detailsWindow.close();  
                    meThis.updatePreview();
                }
            }
        };
        var remove =  function(){
            var orderId = detailsWindow.down('#selectedOrderId').getValue();
            if(orderId === null){
                Ext.Msg.alert('Error', 'Please select one item.');
            }else{
                for(var i = 0; i< currentItem.details.length; i++){
                    if(currentItem.details[i].orderId === orderId){
                        currentItem.details.splice(i,1);
                    }
                }
                meThis.updateItem(currentItem);
                detailsWindow.close();  
                meThis.updatePreview();
            }
        };
        var cancelFn = function(){
            detailsWindow.close();
        };
        
        if(currentItem !== ''){
            //create data for store:
            var details = Ext.create('Ext.data.Store', {
                fields: ['name','orderId'],
                data : currentItem.details
            });
            console.log(details);
            var detailsWindow = meThis.getDetailsReadingWindow(saveFn,saveFnEdit,remove,cancelFn,currentItem,details);
            detailsWindow.show();
        }
    },
    getDetailsReadingWindow: function(saveFn,saveFnEdit,remove,cancelFn,currentItem,details){
        return Ext.create("Ext.Window",{
            title : 'Edit/Add Details',
            closable : true,                    
            modal : true,
            itemId : 'detailWindow',
            id: 'detailWindow',
            layout: "vbox",
            width : 600,
            height: 500,
            anchor: "100%",
            autoScroll: true,
            items:[
                {
                    xtype : "tabpanel",
                    itemId : "addUpdatePanle",
                    width : 500,
                    items : [
                        {
                            xtype: 'container',
                            itemId : 'newFormContainer',
                            title: 'Add new item to gallery',
                            style: {
                                padding: "15px",
                                background: "#FFF"
                            },
                            items: [
                                {
                                    xtype   : "tacofilefield",
                                    itemId  : "main_image",
                                    text    : "Upload main image",
                                    width   : 250,
                                    listeners: {
                                        filechange: function(filelist){
                                            this.up('#addUpdatePanle').uploadFile(filelist, "#mainImage");
                                        }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    width: 250,
                                    allowBlank: false,
                                    itemId : 'mainImage',
                                    id: 'mainImage',
                                    emptyText   : "Main image url",
                                    name: 'mainImage'
                                },
                                {
                                    xtype   : "tacofilefield",
                                    itemId  : "thumpnail_image",
                                    text    : "Upload thumpnail",
                                    width   : 250,
                                    listeners: {
                                        filechange: function(filelist){
                                            this.up('#addUpdatePanle').uploadFile(filelist, "#thumpUrl");
                                        }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    width: 250,
                                    allowBlank: false,
                                    itemId : 'thumpUrl',
                                    id: 'thumpUrl',
                                    emptyText   : "Thumpnail image url",
                                    name: 'thumpUrl',
                                },
                                {
                                    xtype       : "textfield",
                                    emptyText   : "Name",
                                    itemId      : "name",
                                    width       : 250
                                },
                                {
                                    xtype       : "textfield",
                                    emptyText   : "Artist name",
                                    width       : 250,
                                    itemId      : "artist",
                                },{
                                    xtype       : "textfield",
                                    emptyText   : "Dimension",
                                    width       : 250,
                                    itemId      : "dimension",
                                },
                                {
                                    xtype       : "textfield",
                                    emptyText   : "Year",
                                    width       : 250,
                                    itemId      : "year",
                                },
                                {
                                    xtype       : "textarea",
                                    emptyText   : "Detailed description",
                                    width       : 250,
                                    itemId      : "description",
                                },
                                {
                                    xtype:'button',
                                    text:'Add',
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
                                }
                            ]
                        },
                        {
                            xtype: 'container',
                            title: 'Edit existing gallery item',
                            style: {
                                padding: "15px",
                                background: "#FFF"
                            },
                            items: [
                                {
                                    xtype       : "combobox",
                                    emptyText   : "Please select gallery item",
                                    width       : 400,
                                    store       : details,
                                    itemId      : "selectedOrderId",
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'orderId',
                                    listeners: {
                                        change: function (field, newValue, oldValue) {
                                            this.up('#addUpdatePanle').updateEditFields(newValue);
                                        }
                                    }
                                },
                                {
                                    xtype   : "tacofilefield",
                                    itemId  : "main_image",
                                    text    : "Upload main image",
                                    width   : 250,
                                    listeners: {
                                        filechange: function(filelist){
                                            this.up('#addUpdatePanle').uploadFile(filelist, "#mainImageEdit");
                                        }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    width: 250,
                                    allowBlank: false,
                                    itemId : 'mainImageEdit',
                                    id: 'mainImageEdit',
                                    emptyText   : "Main image url",
                                    name: 'mainImageEdit'
                                },
                                {
                                    xtype   : "tacofilefield",
                                    itemId  : "thumpnail_image",
                                    text    : "Upload thumpnail",
                                    width   : 250,
                                    listeners: {
                                        filechange: function(filelist){
                                            this.up('#addUpdatePanle').uploadFile(filelist, "#thumpUrlEdit");
                                        }
                                    }
                                },
                                {
                                    xtype: 'textfield',
                                    width: 250,
                                    allowBlank: false,
                                    itemId : 'thumpUrlEdit',
                                    id: 'thumpUrlEdit',
                                    emptyText   : "Thumpnail image url",
                                    value : currentItem.thumpImg
                                },
                                {
                                    xtype       : "textfield",
                                    emptyText   : "Edit Name",
                                    itemId      : "nameEdit",
                                    width       : 250
                                },
                                {
                                    xtype       : "textfield",
                                    emptyText   : "Edit Artist name",
                                    width       : 250,
                                    itemId      : "artistEdit",
                                },
                                {
                                    xtype       : "textfield",
                                    emptyText   : "Edit Dimension",
                                    width       : 250,
                                    itemId      : "dimensionEdit",
                                },
                                {
                                    xtype       : "textfield",
                                    emptyText   : "Edit Year",
                                    width       : 250,
                                    itemId      : "yearEdit"
                                },
                                {
                                    xtype       : "textarea",
                                    emptyText   : "Edit Detailed description",
                                    width       : 250,
                                    itemId      : "descriptionEdit",
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
                                       saveFnEdit();
                                    }
                                },
                                {
                                    xtype:'button',
                                    text:'Remove',
                                    style: {
                                        width: "250px",
                                        padding: "10px 5px 5px",
                                        background: "#FF0000",
                                        color: "#FFF",
                                        "text-decoration": "none"
                                    },
                                    handler:function(){
                                       remove();
                                    }
                                }
                            ]
                        }
                    ],
                    updateEditFields: function(orderId){
                        var meThis = this;
                        for(var i = 0; i< currentItem.details.length; i++){
                            if(currentItem.details[i].orderId === orderId){
                                meThis.down('#mainImageEdit').setValue(currentItem.details[i].mainImg);
                                meThis.down('#thumpUrlEdit').setValue(currentItem.details[i].thumpImg);
                                meThis.down('#nameEdit').setValue(currentItem.details[i].name);
                                meThis.down('#artistEdit').setValue(currentItem.details[i].artist);
                                meThis.down('#dimensionEdit').setValue(currentItem.details[i].dimension);
                                meThis.down('#yearEdit').setValue(currentItem.details[i].year);
                                meThis.down('#descriptionEdit').setValue(currentItem.details[i].desc);
                            }
                        }
                    },
                    uploadFile: function(filelist, type){
                        
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
                                meThis.down(type).setValue(h.document.data.url);
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
            ]
        });
    },
    
    addGallery: function(url){
        var meThis = this;
        var root = Ext.getCmp('artgallery');
        if(root.down('#gallery_name').getValue() !== ''){
            var newGalleryName = root.down('#gallery_name').getValue();
            meThis.addNewGallery(newGalleryName, url);
        }else{
            Ext.Msg.alert('Error', 'A gallery name is required to create a gallery.');
        }
    },
    
    addNewGallery: function(newGalleryName, mainImage){
        var root = Ext.getCmp('artgallery');
        var galleryObj = {};
        galleryObj.name = newGalleryName;
        galleryObj.mainImageURL = mainImage;
        galleryObj.details = [];
        this.addNewData(galleryObj);
    },  
    
    imageUploadCompleate : function(url, name, type){
        if(type === TYPE_GALLERY_MAIN){
            this.addGallery(url);
        }
    },
    
    addNewData: function(obj){
        var root = Ext.getCmp('artgallery');
        var meThis = this;
        var arr = root.down('#arraydata').getValue();
        obj.id = "UUID"+arr.length;
        obj.order = arr.length;
        arr.push(obj);
        root.down('#arraydata').setValue(arr);
        this.updatePreview();
    },
    
    alertFunction : function(){
        alert(101);
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
    
    updateItem: function(item){
        var arrayData = Ext.getCmp('arraydata');
        if(arrayData.getValue().length > 0){
            var arr = arrayData.getValue();
            for( var i = 0; i<arr.length;i++)
                if(arr[i].id === item.id){
                    arr[i] = item;
                }
            arrayData.setValue(arr);
        }
    },
    removeGallery: function(id){
        var arrayData = Ext.getCmp('arraydata');
        if(arrayData.getValue().length > 0){
            var arr = arrayData.getValue();
            for( var i = 0; i<arr.length;i++)
                if(arr[i].id === id){
                    arr.splice(i,1);
                }
            arrayData.setValue(arr);
            this.updatePreview();
        }
    },
    handleUploadFile: function(a,cmp, type) {
            cmp.onUploadFile(a, this, cmp, type);
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

