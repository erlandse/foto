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
var rowsInResult = 10;
var columnsInResult = 10;
var museumArray = null;
var firstTime = false;


String.prototype.endsWith = function (pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
};


function mainInitialize() {
    $(document).ready(function () {
        // do jQuery
    });
    wheelInstance = new Wheel('wheelInstance', 'wordwheel_div', 'ul', 'lookupIndex', 'inputField');
    document.getElementById('inputField').value = "";
    var d = JSON.parse("{\"must\":[],\"should\":[],\"must_not\":[]}");
    defaultObj = JsonTool.createJsonPath("query");
    defaultObj.query.bool = d;
    if (wheelInstance != null) {
        wheelInstance.followObject(document.getElementById('inputField'), 0, 24);
    }
    
    
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
    
    
    
    
    var footElement = document.getElementById("app-footer");
    footElement.style.width = window.innerWidth - (50) + "px";
    var resultdiv = document.getElementById('resultDiv');
    rowsInResult = Math.round(resultdiv.clientHeight / 200);
    columnsInResult = Math.round(resultdiv.clientWidth / 250);
    defaultObj.size = Math.round(columnsInResult * rowsInResult);
    pageSize = defaultObj.size;
    defaultObj.size = pageSize;
    search();

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


 function postRemote(remote_url,formData) {
	return $.ajax({
		type: "POST",
		url: remote_url,
		data:formData,
		async: false
	}).responseText;
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
function createQuery(includeTextField) {
    var query = JsonTool.cloneJSON(defaultObj);
    if(document.getElementById("whoTagged").value!=""){
       var ob = new Object();
       var f = new Object();
       f.whoTagged= document.getElementById("whoTagged").value;
       ob.match=f;
       if(document.getElementById("nottagged").checked==true)
         query.query.bool.must_not.push(ob);
       else  
         query.query.bool.must.push(ob);

    }
    if(document.getElementById('commentField').value!=""){
       var ob = new Object();
       var f = new Object();
       f.message= document.getElementById("commentField").value;
       ob.match_phrase=f;
       query.query.bool.must.push(ob);
        
    }
    var ob;
    pagePos = 0;
    if (includeTextField)
        insertWordSearch(query);
    return query;
}
function search() {
    wheelInstance.clearUl();
    wheelInstance.hideOverlay();
    runQuery = createQuery(true);
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

function lookUpId(id){
  window.location="edit.html?id="+id;
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
        var query = createQuery(false);
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
    search();
}
function resize() {
    if (wheelInstance != null) {
        wheelInstance.followObject(document.getElementById('inputField'), 0, 24);
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
