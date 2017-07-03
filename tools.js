function addOption(elSel,text,value){
  var elOptNew = document.createElement('option');
  elOptNew.text = text;
  elOptNew.value = value;
  try {
    elSel.options.add(elOptNew, null); // standards compliant; doesn't work in IE
  }
  catch(ex) {
    elSel.options.add(elOptNew); // IE only
  }
}

function removeOptionSelected(selectId)
{
  var elSel = document.getElementById(selectId);
  var i;
  for (i = elSel.length - 1; i>=0; i--) {
    if (elSel.options[i].selected==true) {
      elSel.remove(i);
    }
  }
}

function removeAllOptions(selectId){
 var elSel = document.getElementById(selectId);
 while(elSel.length > 0)
      elSel.remove(elSel.length-1);
}

function selectAllOptions(selectId){
 var sel = document.getElementById(selectId);
 for(var temp = 0; temp < sel.length;temp++)
    sel.options[temp].selected = true;
}

function deselectAllOptions(selectId){
 var sel = document.getElementById(selectId);
 for(var temp = 0; temp < sel.length;temp++)
    sel.options[temp].selected = false;
}




//------------------------------------help functions--------------------------------------------------
function jsonValue(key){
  return key == undefined? "":key;
}


/*
 * Extract the url argument value bound to name - copied from somewhere
 */
function gup( name )
{
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

function addKeyValue(key,value){
 var res = "\""+key+"\":"+JSON.stringify(value);
 return res;
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}


function drill(p, path) {
    if(isEmpty(p))
      return'';
	 a = path.split(".");
	 for (i in a) {
	   var key = a[i];
	   if (p[key] == null)
		 return '';
	   p = p[key];
	 }
	 return p;
  }

