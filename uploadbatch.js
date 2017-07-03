var currentId = "";
var fylke = "";
var kommune="";
var gardsnavn="";
var gardsnummer="";
var gardsid="";
var latitude ="";
var longitude="";
var creationDate;
function initialize(){
  $(document).ready(function(){

  });
 /* document.getElementById('idnumber').disabled=true;
  document.getElementById('createButton').disabled=true;*/
  var curuser = "Automatic";
  creationDate = getDate();
}

function zeroFill( number, width )
{
  width -= number.toString().length;
  if ( width > 0 )
  {
    return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
  }
  return number + ""; // always return a string
}

function getDate(){
  var d = new Date();
  var st = ""+d.getFullYear();
  st += "-"+zeroFill(d.getMonth()+1,2);
  st+="-"+ zeroFill(d.getDate(),2);
  return st;

}


function isLoaded(path){
  var d = JSON.parse("{\"must\":[],\"should\":[],\"must_not\":[]}");
  var query = JsonTool.createJsonPath("query");
  query.size=100;
  query.query.bool = d;
  var obj = new Object();
  obj.term = new Object();
  obj.term.path = path;
  query.query.bool.must.push(obj);
  var formData = new Object();
  formData.resturl="";
  formData.elasticdata = JSON.stringify(query,null,2);
  var data = JSON.parse(postRemote("PassFotoSearch.php",formData));
  var el = new ElasticClass(data);
  return el.getDocCount()==0?false:true;
}


function loadDocuments() {
  var newLoaded = 0;
  var st = document.getElementById('linkbuffer').value;
  var list = st.split("\n");


//  document.getElementById('linkbuffer').value = "";

  for (var temp = 0; temp < list.length; temp++) {
    if (isLoaded(list[temp]) == true)
      continue;
    if(list[temp]=="")
      continue;  
    var tags = new Array();
    var obj = new Object();
    obj.path = list[temp];
    obj.whoTagged = new Array();
    obj.whoTagged.push("Automatic");
    var l = list[temp].split("/");
    for (var i = 0; i < l.length - 1; i++) {
      if (l[i].startsWith("x"))
        continue;
    if(isNaN(l[i]))
      tags.push(l[i].toLowerCase());
     else{
       var dato = parseInt(l[i]);
       obj.dato = dato;
     }   
    }
    obj.tags=tags;
    obj.creationDate=creationDate;
    var formData = new Object();
    formData.id="";
    formData.elasticdata = JSON.stringify(obj,null,2);
    formData.code=document.getElementById('code').value;
    postRemote("PassFotoUpdate.php",formData);
    newLoaded++;
    document.getElementById("progress").value = newLoaded;
  }
  alert("Slutski "+ newLoaded);
}

function getRemote(remote_url) {
    return $.ajax({
        type: "GET",
        url: remote_url,
        async: false
    }).responseText;
}

 function postRemote(remote_url,formData) {
	return $.ajax({
		type: "POST",
		url: remote_url,
		data:formData,
		async: false
	}).responseText;
 }



