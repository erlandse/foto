var wheelInstance = null;
var rowsInResult = 10;
var tools;
var editDoc;
var elastic;

String.prototype.endsWith = function (pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
};


var map = {}; // You could also use an array
onkeydown = onkeyup = function(e){
    e = e || event; // to deal with IE
    map[e.keyCode] = e.type == 'keydown';
    if(map[17]==true && map[13]==true){
        map[17]=false;
        map[13]=false;
        saveAndGet();
    }
      
}
/*
document.onkeydown = function (e) {
    e = e || window.event;
    alert(e.keyCode);
};
*/
function mainInitialize() {
    $(document).ready(function () {
        // do jQuery
    });
    wheelInstance = new Wheel('wheelInstance', 'wordwheel_div', 'ul', 'lookupIndex', 'inputField');
    document.getElementById('inputField').value = "";
    
    
    document.getElementById('codeField').value = sessionStorage.getItem("secretCode");
    document.getElementById('whoTagged').value = sessionStorage.getItem("whoTagged");


    //--------
    
    var formData = new Object();
    var ob = new Object();
    formData.elasticdata = JSON.stringify(tagList,null,2);
    formData.resturl ="";
    var res = postRemote("PassFotoSearch.php",formData);
    var el = new ElasticClass(JSON.parse(res));
    var arr = el.getFacetFieldWithFacetName("tags");
    var sel = document.getElementById('tagList');
    Tools.addOption(sel,"Vælg tag","");
    for(var temp=0;temp< arr.length;temp++)
      Tools.addOption(sel,arr[temp].key,arr[temp].key);

    //-----------------
    
    
    
    var id = Tools.gup("id");
    var q = JsonTool.createJsonPath("query.terms");
    q.query.terms._id=new Array();
    q.query.terms._id.push(id);
    formData=new Object();
    formData.elasticdata=JSON.stringify(q,null,2);
    postPhpMain(formData,insertValues)
}


function insertValues(data){
    elastic = new ElasticClass(data);
    if(elastic.getDocCount() == 0){
        alert("Ingen dokumenter");
        window.location="index.html";
    }
    var docs= elastic.getDocs();
    editDoc= docs[0];
    document.getElementById('picture').onload = function () {
      resize();
    };
    document.getElementById("picture").src= "http://folk.uio.no/erlandse/familie-fotos/"+elastic.getSingleFieldFromDoc(editDoc,"path");
    document.getElementById("picRef").href="http://folk.uio.no/erlandse/familie-fotos/"+elastic.getSingleFieldFromDoc(editDoc,"path");
    var arr = elastic.getArrayFromDoc(editDoc,"tags");
    var sel = document.getElementById("tagSelect");
    Tools.removeAllOptions("tagSelect")
    for(var temp=0;temp<arr.length;temp++)
      Tools.addOption(sel,arr[temp],arr[temp]);
    var arr = elastic.getArrayFromDoc(editDoc,"whoTagged");
    document.getElementById("hasTagged").innerHTML = arr.join();
    document.getElementById("comments").value = elastic.getSingleFieldFromDoc(editDoc,"message");
    document.getElementById("datoField").value = elastic.getSingleFieldFromDoc(editDoc,"dato");
    resize();
    document.getElementById('inputField').focus();
}


function insertKeyword() {
    search();
}


function postPhpMain(formData, callBack) {
    $.ajax({
        url: "PassFotoSearch.php",
        type: 'post',
        data: formData,
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
        },
        success: function (data) {
            callBack(data);
        },
        dataType: "json"
    });
}


function insertTag(){
 var st = document.getElementById('tagList').value;
 if(st== "")
   return;
 if(document.getElementById('inputField').value =="")
   document.getElementById('inputField').value =st;
 else
   document.getElementById('inputField').value = document.getElementById('inputField').value + " " +st;
}


function changeWordwheel(event) {
    /*if(event.keyCode == 13){
      search();
      return;
   }*/
    if (wheelInstance.handleWheel(event) == true)
        return;
    var str = document.getElementById('inputField').value.toLowerCase();
    //xx
    if (str.length > 0) {
        wordListQuery.tags.terms.include = str + ".*";
        var query = new Object();
        query.aggs = wordListQuery;
        query.size = 0;
        var formData = new Object();
        formData.elasticdata = JSON.stringify(query, null, 2);
        formData.resturl = "";
        $.ajax({
            url: "PassFotoSearch.php",
            type: 'post',
            data: formData,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                alert('status:' + XMLHttpRequest.status + ', status text: ' + XMLHttpRequest.statusText + " errorthrown " + errorThrown);
            },
            success: function (data) {
                var el = new ElasticClass(data);
                var ar = el.getFacetFieldWithFacetName("tags");
                //                alert(JSON.stringify(ar,null,2));
                wheelInstance.fillFacets(ar);
            },
            dataType: "json"
        });
    }
    else {
        wheelInstance.clearUl();
        wheelInstance.hideOverlay();
    }
}

function findWordHandleTerm(){
    var qu;
    var str = document.getElementById('inputField').value.toLowerCase();    
    qu = str.replace(this.spaceSplitter, "####");
    var words = qu.split("####");
    return words[words.length-1];
}

function lookupIndex(string) {
    document.getElementById('inputField').value = wheelInstance.replaceLastWord(document.getElementById('inputField').value, string);
    wheelInstance.hideOverlay();
    addTag();
}

function resize() {
    if (wheelInstance != null) {
        wheelInstance.followObject(document.getElementById('inputField'), 0, 24);
    }
}

function addTag(){
   var str = document.getElementById('inputField').value.toLowerCase();
  
   var sel=document.getElementById("tagSelect");
   for (var temp = 0; temp < sel.length; temp++)
      if(sel.options[temp].value == str){
        document.getElementById('inputField').value = "";
        return;
      }  
   Tools.addOption(sel,str,str);
   document.getElementById('inputField').value= "";   
}
function deleteTag(){
    Tools.removeOptionSelected("tagSelect");
}

function savePost() {
   
    if (document.getElementById('whoTagged').value == "") {
        alert("Mangler at angive hvem taggede");
        return;
    }
    var arr = elastic.getArrayFromDoc(editDoc, "whoTagged");
    var resultTagged = new Array();
    resultTagged.push(document.getElementById('whoTagged').value);
    for (var temp = 0; temp < arr.length; temp++) {
        if (arr[temp] == document.getElementById('whoTagged').value)
            continue;
        if (arr[temp] == 'Automatic')
            continue;
        resultTagged.push(arr[temp]);
    }
    var obj = new Object();
    obj.whoTagged = resultTagged;
    resultTagged = new Array();
    var sel = document.getElementById('tagSelect');
    for (var temp = 0; temp < sel.length; temp++)
        resultTagged.push(sel.options[temp].value);
    obj.tags = resultTagged;
    obj.message = document.getElementById("comments").value.toLowerCase();
    obj.dato = parseInt(document.getElementById("datoField").value);
    obj.path = elastic.getSingleFieldFromDoc(editDoc,"path");
    formData = new Object();
    formData.elasticdata = JSON.stringify(obj,null,2)
    formData.id=editDoc._id;
    formData.code = document.getElementById("codeField").value;
    var str= postRemote("PassFotoUpdate.php",formData);
    sessionStorage.setItem("secretCode",document.getElementById('codeField').value);
    sessionStorage.setItem("whoTagged",document.getElementById('whoTagged').value);
    
}


 function postRemote(remote_url,formData) {
	return $.ajax({
		type: "POST",
		url: remote_url,
		data:formData,
		async: false
	}).responseText;
 }

 function saveAndGet(){
   savePost();
   var res = postRemote("PassFotoRefresh.php",new Object());
   alert("Henter næste");
   formData= new Object();
   formData.elasticdata=sessionStorage.getItem("editquery");
   formData.resturl="";
   postPhpMain(formData,insertValues);
 }

