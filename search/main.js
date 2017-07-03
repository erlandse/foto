var checkbox = null;
var checkboxArray = null;
var defaultObj = null;
var runQuery = null;
var spaceSplitter = new RegExp("([\\s]+)", "g");
var pagePos = 0;
var pageSize = 20;
var resultElastic;
var randomNumber = 0;
var wheelInstance = null;
var wheelInstance2 = null;
var rowsInResult = 10;
var columnsInResult = 10;
var museumArray = null;
var firstTime = false;
var singleIndex=-1;


String.prototype.endsWith = function (pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
};


function mainInitialize() {
    $(document).ready(function () {
        // do jQuery
    });
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
      Tools.addOption(sel,arr[temp].key+" ("+arr[temp].doc_count+")",arr[temp].key);
    wheelInstance = new Wheel('wheelInstance', 'wordwheel_div', 'ul', 'lookupIndex', 'inputField');
    wheelInstance2 = new Wheel('wheelInstance2', 'wheel2', 'ul2', 'lookupIndex2', 'commentField');

    document.getElementById('inputField').value = "";
    var d = JSON.parse("{\"must\":[],\"should\":[],\"must_not\":[]}");
    defaultObj = JsonTool.createJsonPath("query");
    defaultObj.query.bool = d;
    if (wheelInstance != null) {
        wheelInstance.followObject(document.getElementById('inputField'), 0, 24);
    }
    if (wheelInstance2 != null) {
        wheelInstance2.followObject(document.getElementById('commentField'), 0, 24);
    }
    var footElement = document.getElementById("app-footer");
    footElement.style.width = window.innerWidth - (50) + "px";
    var resultdiv = document.getElementById('resultDiv');
    rowsInResult = Math.round(resultdiv.clientHeight / 200);
    columnsInResult = Math.round(resultdiv.clientWidth / 250);
    defaultObj.size = Math.round(columnsInResult * rowsInResult);
    pageSize = defaultObj.size;
    defaultObj.size = pageSize;
    var id = Tools.gup("id");
    if (id != "") {
        var q = JsonTool.createJsonPath("query.terms");
        q.query.terms._id = new Array();
        q.query.terms._id.push(id);
        formData = new Object();
        formData.elasticdata = JSON.stringify(q, null, 2);
        singleIndex=0;
        postPhpMain(formData, fillResult);
        return;
    }
    if(Tools.gup("tags")!="")
      document.getElementById("inputField").value= decodeURIComponent(Tools.gup("tags"));
    if(Tools.gup("comment")!="")
      document.getElementById("commentField").value= decodeURIComponent(Tools.gup("comment"));
      if(document.getElementById("inputField").value=="" && document.getElementById("commentField").value=="") {
       var i = Math.floor((Math.random() * document.getElementById('tagList').length) + 1);      
       document.getElementById("inputField").value = document.getElementById('tagList').options[i].value;

    }
    search();

}



function insertKeyword() {
    search();
}


function onClickCheckbox(i) {
    search();
}
function insertWordSearch(query) {
    var ob;
    var b = document.getElementById('inputField').value.trim();
    if (b.length == 0)
        return;
    var qu;
    qu = b.replace(this.spaceSplitter, "####");
    var words = qu.split("####");
    for (var temp = 0; temp < words.length; temp++) {
        var pos = void 0;
        var f = new Object();
        ob = new Object();
        if (words[temp].indexOf("*") != -1 || words[temp].indexOf("?") != -1) {
            f.tags = words[temp];
            ob.wildcard = f;
        }
        else {
            f.tags = words[temp];
            ob.match = f;
        }
        query.query.bool.must.push(ob);
    }
}
function createQuery(includeTextField,includeComment) {
    var query = JsonTool.cloneJSON(defaultObj);
    if(document.getElementById('commentField').value!="" && includeComment==true){
       var qu;
       b=document.getElementById('commentField').value;
       qu = b.replace(this.spaceSplitter, "####");
       var words = qu.split("####");
       for(let temp=0;temp < words.length;temp++){
         var ob = new Object();
         var f = new Object();
         f.message= words[temp];
         ob.match=f;
         query.query.bool.must.push(ob);
       } 
    }
    var ob;
    pagePos = 0;
    if (includeTextField)
        insertWordSearch(query);
    return query;
}
function search() {
    document.getElementById("tagList").value="";
    returnToNavigation();
    wheelInstance.clearUl();
    wheelInstance.hideOverlay();
    wheelInstance2.clearUl();
    wheelInstance2.hideOverlay();
    runQuery = createQuery(true,true);
    runQuery.from = 0;
    pagePos = 0;
    var formData = new Object();
    formData.elasticdata = JSON.stringify(runQuery, null, 2);
    formData.resturl = "";
    postPhpMain(formData, fillResult);
}

function fillResult(data) {
    document.getElementById('resultTable').innerHTML = "";
    resultElastic = new ElasticClass(data);
    var docs = resultElastic.getDocs();

    for (var temp = 0; temp < docs.length; temp++) {
        var doc = docs[temp];
        var path = "http://folk.uio.no/erlandse/familie-fotos/"+resultElastic.getSingleFieldFromDoc(doc, "path");
        insertInResult("resultTable",path,temp,doc._id,columnsInResult,"130px");
    }
    setTraversalDiv();
    var docs = resultElastic.getDocs();
    if(singleIndex!=-1){
        if(singleIndex==0){
          lookUpId(docs[docs.length-1]._id);
          return;
        }else{
          var docs = resultElastic.getDocs();
          lookUpId(docs[0]._id);
            
        }
    }
}
function insertContentIntoRelationTable(table, content) {
    if (content == "")
        return;
    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    cell1.innerHTML = content;
}
function postPhpMain(formData, callBack) {
    sessionStorage.setItem("editquery",formData.elasticdata);
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


function insertInResult(tableId, filename, nr, id, cellsprRow, width) {
    var table = document.getElementById(tableId);
    var row;
    if ((nr % cellsprRow) == 0)
        row = table.insertRow(-1);
    else
        row = table.rows[table.rows.length - 1];
    var cellSize = row.cells.length;
    var cell1 = row.insertCell(cellSize);
    cell1.setAttribute("class", "cellLabel"); //For Most Browsers
    cell1.setAttribute("className", "cellLabel");
    var img = "<img src='"+filename+"' width='"+width+"'/>";
    var aref = "<a href='#' onclick='javascript:lookUpId(\"" + id+"\""+ ")'>" + img + "</a>";
    cell1.innerHTML = aref;
}

function getObjectOffset(element) {
  var top = 0, left = 0;
  do {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while (element);

  return {
    top: top,
    left: left
  };
};

function setToZero(){
    document.getElementById('inputField').value="";
    document.getElementById('commentField').value="";
    search();
    
}

function setTraversalDiv() {
    var nrOfDocs = resultElastic.getDocCount();
    document.getElementById('zeroButtonId').disabled = false;
    if (pagePos == 0)
        document.getElementById('prevButtonId').disabled = true;
    else
        document.getElementById('prevButtonId').disabled = false;
    if ((pagePos + pageSize) >= nrOfDocs)
        document.getElementById('nextButtonId').disabled = true;
    else
        document.getElementById('nextButtonId').disabled = false;
    var to = pagePos + pageSize;
    if (to > nrOfDocs)
        to = nrOfDocs;
    var str = (pagePos + 1) + "-" + to + "  antall gjenstander ut av " + nrOfDocs;
    if (nrOfDocs == 0)
        str = "Ingen gjenstander funnet";
    document.getElementById('traversalLabel').innerHTML = str;
}
function move(i) {
    var toMove = (i * pageSize) + pagePos;
    if (toMove < 0)
        toMove = 0;
    runQuery.from = toMove;
    pagePos = toMove;
    var formData = new Object();
    formData.elasticdata = JSON.stringify(runQuery, null, 2);
    postPhpMain(formData, fillResult);
}


function changeWordwheel(event) {
    /*if(event.keyCode == 13){
      search();
      return;
   }*/
    if (wheelInstance.handleWheel(event) == true)
        return;
    var str = document.getElementById('inputField').value.toLowerCase();
    if (str.length > 0) {
        str = findWordHandleTerm();
        wordListQuery.tags.terms.include = str + ".*";
        var query = createQuery(false,true);
        setInPreviousTagsInSearch(query);
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

function changeWordwheel2(event) {
    /*if(event.keyCode == 13){
      search();
      return;
   }*/
    if (wheelInstance2.handleWheel(event) == true)
        return;
    var str = document.getElementById('commentField').value.toLowerCase();
    if (str.length > 0) {
        str = findWordHandleTerm2();
        messageWordList.message.terms.include = str + ".*";
        var query = createQuery(true,false);
        setInPreviousTermsInSearch(query);
        query.aggs = messageWordList;
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
                var ar = el.getFacetFieldWithFacetName("message");
                wheelInstance2.fillFacets(ar);
            },
            dataType: "json"
        });
    }
    else {
        wheelInstance2.clearUl();
        wheelInstance2.hideOverlay();
    }
}



function setInPreviousTagsInSearch(query){
    var str = document.getElementById('inputField').value.toLowerCase();    
    qu = str.replace(this.spaceSplitter, "####");
    var words = qu.split("####");
    for(var temp=0;temp<words.length-1;temp++){
      var f = new Object();
      ob = new Object();
      f.tags = words[temp];
      ob.match=f;
      query.query.bool.must.push(ob);
    }
}

function setInPreviousTermsInSearch(query){
    var str = document.getElementById('commentField').value;    
    qu = str.replace(this.spaceSplitter, "####");
    var words = qu.split("####");
    for(var temp=0;temp<words.length-1;temp++){
      var f = new Object();
      ob = new Object();
      f.message = words[temp];
      ob.match=f;
      query.query.bool.must.push(ob);
    }
}


function findWordHandleTerm(){
    var qu;
    var str = document.getElementById('inputField').value.toLowerCase();    
    qu = str.replace(this.spaceSplitter, "####");
    var words = qu.split("####");
    return words[words.length-1];
}
function findWordHandleTerm2(){
    var qu;
    var str = document.getElementById('commentField').value;    
    qu = str.replace(this.spaceSplitter, "####");
    var words = qu.split("####");
    return words[words.length-1];
}


function lookupIndex(string) {
    document.getElementById('inputField').value = wheelInstance.replaceLastWord(document.getElementById('inputField').value, string);
    wheelInstance.hideOverlay();
    search();
}

function lookupIndex2(string) {
    document.getElementById('commentField').value = wheelInstance2.replaceLastWord(document.getElementById('commentField').value, string);
    wheelInstance2.hideOverlay();
    search();
}

function resize() {
    if (wheelInstance != null) {
        wheelInstance.followObject(document.getElementById('inputField'), 0, 24);
    }
    if (wheelInstance2 != null) {
        wheelInstance2.followObject(document.getElementById('commentField'), 0, 24);
    }
    if(singleIndex != -1){
        var width = document.getElementById("contentDiv").clientWidth;
        var height=document.getElementById("contentDiv").clientHeight-document.getElementById("metadataDiv").clientHeight;
        document.getElementById('showObjectDiv').style.width=width+"px";
        calculatePhotoSize(height,width, 'pictureDiv');        
        return;
    }
    var footElement = document.getElementById("app-footer");
    footElement.style.width = window.innerWidth - (50) + "px";
    var resultdiv = document.getElementById('resultDiv');
    rowsInResult = Math.round(resultdiv.clientHeight / 200);
    columnsInResult = Math.round(resultdiv.clientWidth / 250);
    defaultObj.size = Math.round(columnsInResult * rowsInResult);
    pageSize = defaultObj.size;
    runQuery.size = pageSize;
    move(0);
}

function returnToNavigation(){
   singleIndex= -1;
   document.getElementById("contentDiv").style.visibility = 'visible';  
   document.getElementById('showObjectDiv').style.display='none';
}

function lookUpId(id){
  document.getElementById("contentDiv").style.visibility = 'hidden';  
  var p = getObjectOffset(document.getElementById("contentDiv"));
  document.getElementById('showObjectDiv').style.width= document.getElementById("contentDiv").clientWidth+"px";
  document.getElementById('showObjectDiv').style.height= document.getElementById("contentDiv").clientHeight+"px";
  document.getElementById('showObjectDiv').style.top= p.top+"px";
  document.getElementById('showObjectDiv').style.left= p.left+"px";
  document.getElementById('showObjectDiv').style.display='block';
  var docs = resultElastic.getDocs();
  var temp;
  for(temp=0;temp< docs.length;temp++)
    if(docs[temp]._id == id)
      break;
  singleIndex= temp;
  document.getElementById('spanTags').innerHTML="";
  document.getElementById('spanDato').innerHTML="";
  document.getElementById('spanTags').innerHTML=resultElastic.getArrayFromDoc(docs[singleIndex],"tags").join(" ");    
  document.getElementById('commentDiv').innerHTML=resultElastic.getSingleFieldFromDoc(docs[singleIndex],"message");
  calculateCommentSize();  
  document.getElementById('spanDato').innerHTML=resultElastic.getSingleFieldFromDoc(docs[singleIndex],"dato");
  document.getElementById('urlLink').href="http://itfds-utv01.uio.no/morten/Foto/search?id="+docs[singleIndex]._id;
  document.getElementById('urlLink').innerHTML="http://itfds-utv01.uio.no/morten/Foto/search?id="+docs[singleIndex]._id;
  var width = document.getElementById("contentDiv").clientWidth;
  var height=document.getElementById("contentDiv").clientHeight-document.getElementById("metadataDiv").clientHeight;
  document.getElementById('photoCalculate').onload = function () {
     calculatePhotoSize(height,width, 'pictureDiv');
  };
  document.getElementById('photoCalculate').src="http://folk.uio.no/erlandse/familie-fotos/"+resultElastic.getSingleFieldFromDoc(docs[singleIndex],"path"); 

  document.getElementById('arefPic').href="http://folk.uio.no/erlandse/familie-fotos/"+resultElastic.getSingleFieldFromDoc(docs[singleIndex],"path");
  setSingleControls();
}

function calculateCommentSize(){
    var length = document.getElementById('commentDiv').innerHTML.length;
    if(length==0){
        document.getElementById('commentDiv').style.height="0px";
    }
    if(length >0 && length < 400){
        document.getElementById('commentDiv').style.height="40px";
    }
    if(length > 400){
        document.getElementById('commentDiv').style.height="100px";
    }
    
}

function calculatePhotoSize(height, width, photoId) {
    height -= 10;
    width -= 10;
    var oldHeight = document.getElementById('photoCalculate').height;
    var oldWidth = document.getElementById('photoCalculate').width;
    var docs = resultElastic.getDocs();
    document.getElementById('pictureDiv').src="http://folk.uio.no/erlandse/familie-fotos/"+resultElastic.getSingleFieldFromDoc(docs[singleIndex],"path");
    if (oldHeight < height && oldWidth < width){
        document.getElementById(photoId).height = oldHeight;
        document.getElementById(photoId).width = oldWidth;
        var a = document.getElementById(photoId).height+document.getElementById("metadataDiv").clientHeight;
        document.getElementById('middleDiv').style.height=(document.getElementById("contentDiv").clientHeight-a)+"px";
        return;
    }    
    if (oldHeight > height) {
        var reduce = void 0;
        reduce = (height * 100) / oldHeight;
        var newWidth = (oldWidth * reduce) / 100;
        if (newWidth > width) {
            reduce = (width * 100) / oldWidth;
            document.getElementById(photoId).width = width;
            var newHeight = (oldHeight * reduce) / 100;
            document.getElementById(photoId).height = newHeight;
        }
        else {
            document.getElementById(photoId).height = height;
            document.getElementById(photoId).width = newWidth;
        }
    }else{
        var reduce= (width*100)/oldWidth;
        var newHeight=(oldHeight * reduce) / 100;
        document.getElementById(photoId).height = newHeight;
        document.getElementById(photoId).width = width;
    }
    var a = document.getElementById(photoId).height+document.getElementById("metadataDiv").clientHeight;
    document.getElementById('middleDiv').style.height=(document.getElementById("contentDiv").clientHeight-a)+"px";

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

function setSingleControls(){
    if(singleIndex==-1)
      return;
   if(singleIndex > 0 || pagePos > 0) 
     document.getElementById('singlePrev').disabled= false;
   else   
     document.getElementById('singlePrev').disabled= true;
  var docs = resultElastic.getDocs();
  if(singleIndex < docs.length-1 || document.getElementById('nextButtonId').disabled == false)   
     document.getElementById('singleNext').disabled= false;
  else
    document.getElementById('singleNext').disabled= true;
  
}

function prevSinglePic(){
    if(singleIndex > 0){
        var docs = resultElastic.getDocs();
        lookUpId(docs[singleIndex-1]._id);
        return;
    }else{
       move(-1);
    }
}
function nextSinglePic(){
    var docs = resultElastic.getDocs();
    if(singleIndex < docs.length-1){
        lookUpId(docs[singleIndex+1]._id);
        return;
    }
    else
      move(1);
}

 function postRemote(remote_url,formData) {
	return $.ajax({
		type: "POST",
		url: remote_url,
		data:formData,
		async: false
	}).responseText;
 }
