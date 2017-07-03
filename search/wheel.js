var Wheel = (function () {
    function Wheel(instanceName, div, ul, nameOfLookUpFunction, idOfInputField) {
        this.keyDemand = false;
        this.wheel_div = null;
        this.wheel_ul = null;
        this.nameOfLookUp = null;
        this.nameOfInstance = null;
        this.offsetArray = null;
        this.levenshteinWord = "";
        this.maxWords = 0;
        this.idOfInputField = null;
        this.scrollUp = function (i) {
            var div = document.getElementById(this.wheel_div);
            if (i == 0) {
                div.scrollTop = 0;
                return;
            }
            var offset = this.offsetArray[i];
            offset = offset - (this.offsetArray[i] - this.offsetArray[i - 1]);
            if (div.scrollTop > offset)
                div.scrollTop = offset;
        };
        /*fillLevenshtein*/
        this.setLevenshteinWord = function (string, maxWords) {
            this.levenshteinWord = string;
            this.maxWords = maxWords;
        };
        this.wheel_div = div;
        this.nameOfLookUp = nameOfLookUpFunction;
        this.nameOfInstance = instanceName;
        this.wheel_ul = ul;
        this.idOfInputField = idOfInputField;
        var o = document.getElementById(div);
        o.style.visibility = 'hidden';
    }
    ;
    Wheel.prototype.findPosObject = function (obj) {
        var curleft, curtop;
        curleft = curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }
        return [curleft, curtop];
    };
    Wheel.prototype.followObject = function (object, leftOffset, topOffset) {
        var ar = this.findPosObject(object);
        var leftPos = ar[0] + leftOffset;
        var topPos = ar[1] + topOffset;
        var div = document.getElementById(this.wheel_div);
        div.style.top = topPos + "px";
        div.style.left = leftPos + "px";
    };
    Wheel.prototype.addLiElement = function (content) {
        var newLi = document.createElement('li');
        newLi.innerHTML = content;
        newLi.setAttribute('value', content);
        newLi.setAttribute('className', 'notSelectedLi');
        newLi.setAttribute('class', 'notSelectedLi');
        newLi.setAttribute('onclick', this.nameOfLookUp + "('" + content + "')");
        newLi.setAttribute('onmouseover', this.nameOfInstance + '.setbackgroundColorMouseOver(this)');
        newLi.setAttribute('onmouseout', this.nameOfInstance + '.setbackgroundColorMouseOut(this)');
        newLi.setAttribute('onmousemove', this.nameOfInstance + '.enableMouse()');
        var ul = document.getElementById(this.wheel_ul);
        ul.appendChild(newLi);
    };
    Wheel.prototype.enableMouse = function () {
        if (this.keyDemand == true) {
            var ul = document.getElementById(this.wheel_ul);
            var list = ul.getElementsByTagName("li");
            for (var temp = 0; temp < list.length; temp++) {
                list[temp].setAttribute('class', "notSelectedLi");
                list[temp].setAttribute('className', "notSelectedLi");
            }
            this.keyDemand = false;
        }
    };
    Wheel.prototype.setbackgroundColorMouseOver = function (li) {
        if (this.keyDemand == true)
            return;
        li.setAttribute('class', "selectedLi");
        li.setAttribute('className', "selectedLi");
    };
    Wheel.prototype.setbackgroundColorMouseOut = function (li) {
        if (this.keyDemand == true)
            return;
        li.setAttribute('class', "notSelectedLi");
        li.setAttribute('className', "notSelectedLi");
    };
    Wheel.prototype.clearUl = function () {
        var ul = document.getElementById(this.wheel_ul);
        var list = ul.getElementsByTagName("li");
        var cnt = list.length - 1;
        while (cnt >= 0) {
            ul.removeChild(list[cnt]);
            cnt--;
        }
    };
    Wheel.prototype.scrollDown = function (i) {
        var div = document.getElementById(this.wheel_div);
        var offset = this.offsetArray[i];
        var divHeight = div.clientHeight;
        if (offset > divHeight)
            div.scrollTop = (offset - divHeight);
    };
    Wheel.prototype.setKeySelectionDown = function () {
        var div = document.getElementById(this.wheel_div);
        var ul = document.getElementById(this.wheel_ul);
        var list = ul.getElementsByTagName("li");
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i].className == "selectedLi") {
                if (i == list.length - 1)
                    return;
                list[i].setAttribute('class', "notSelectedLi");
                list[i].setAttribute('className', "notSelectedLi");
                list[i + 1].setAttribute('class', "selectedLi");
                list[i + 1].setAttribute('className', "selectedLi");
                this.scrollDown(i + 1);
                this.keyDemand = true;
                return;
            }
        }
        list[0].setAttribute('class', "selectedLi");
        list[0].setAttribute('className', "selectedLi");
    };
    Wheel.prototype.setKeySelectionUp = function () {
        var ul = document.getElementById(this.wheel_ul);
        var list = ul.getElementsByTagName("li");
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i].className == "selectedLi") {
                if (i == 0)
                    return;
                list[i].setAttribute('class', "notSelectedLi");
                list[i].setAttribute('className', "notSelectedLi");
                list[i - 1].setAttribute('class', "selectedLi");
                list[i - 1].setAttribute('className', "selectedLi");
                this.scrollUp(i - 1);
                this.keyDemand = true;
                return;
            }
        }
    };
    Wheel.prototype.keyReturn = function () {
        var ul = document.getElementById(this.wheel_ul);
        var list = ul.getElementsByTagName("li");
        var i;
        for (i = 0; i < list.length; i++) {
            if (list[i].className == "selectedLi") {
                var st = this.nameOfLookUp + "('" + list[i].innerHTML + "')";
                eval(st);
                return true;
            }
        }
        var t = document.getElementById(this.idOfInputField).value;
        //        if(t !=""){
        st = this.nameOfLookUp + "('" + t + "')";
        eval(st);
        return true;
        //      }
        //        return false;
    };
    Wheel.prototype.showOverlay = function () {
        var o = document.getElementById(this.wheel_div);
        o.style.visibility = 'visible';
    };
    Wheel.prototype.hideOverlay = function () {
        var o = document.getElementById(this.wheel_div);
        o.style.visibility = 'hidden';
        //    $('#'+this.wheel_div).fadeOut(100);
    };
    Wheel.prototype.fillFacets = function (facetArray) {
        var ul = document.getElementById(this.wheel_ul);
        this.offsetArray = new Array();
        if (facetArray.length == 0) {
            this.hideOverlay();
            return;
        }
        this.clearUl();
        this.showOverlay();
        for (var temp = 0; temp < facetArray.length; temp++) {
            var ob = facetArray[temp];
            this.addLiElement(ob.key);
            this.offsetArray.push(ul.offsetHeight);
        }
        var div = document.getElementById(this.wheel_div);
        div.scrollTop = 0;
    };
    Wheel.prototype.levenshtein = function (s1, s2) {
        // Calculate Levenshtein distance between two strings  
        // 
        // version: 1109.2015
        // discuss at: http://phpjs.org/functions/levenshtein    // +            original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
        // +            bugfixed by: Onno Marsman
        // +             revised by: Andrea Giammarchi (http://webreflection.blogspot.com)
        // + reimplemented by: Brett Zamir (http://brett-zamir.me)
        // + reimplemented by: Alexander M Beedie    // *                example 1: levenshtein('Kevin van Zonneveld', 'Kevin van Sommeveld');
        // *                returns 1: 3
        if (s1 == s2) {
            return 0;
        }
        var s1_len = s1.length;
        var s2_len = s2.length;
        if (s1_len === 0) {
            return s2_len;
        }
        if (s2_len === 0) {
            return s1_len;
        }
        // BEGIN STATIC
        var split = false;
        try {
            split = !('0')[0];
        }
        catch (e) {
            split = true; // Earlier IE may not support access by string index
        }
        // END STATIC
        if (split) {
            s1 = s1.split('');
            s2 = s2.split('');
        }
        var v0 = new Array(s1_len + 1);
        var v1 = new Array(s1_len + 1);
        var s1_idx = 0, s2_idx = 0, cost = 0;
        for (s1_idx = 0; s1_idx < s1_len + 1; s1_idx++) {
            v0[s1_idx] = s1_idx;
        }
        var char_s1 = '', char_s2 = '';
        for (s2_idx = 1; s2_idx <= s2_len; s2_idx++) {
            v1[0] = s2_idx;
            char_s2 = s2[s2_idx - 1];
            for (s1_idx = 0; s1_idx < s1_len; s1_idx++) {
                char_s1 = s1[s1_idx];
                cost = (char_s1 == char_s2) ? 0 : 1;
                var m_min = v0[s1_idx + 1] + 1;
                var b = v1[s1_idx] + 1;
                var c = v0[s1_idx] + cost;
                if (b < m_min) {
                    m_min = b;
                }
                if (c < m_min) {
                    m_min = c;
                }
                v1[s1_idx + 1] = m_min;
            }
            var v_tmp = v0;
            v0 = v1;
            v1 = v_tmp;
        }
        return v0[s1_len];
    };
    Wheel.prototype.deleteEntrance = function () {
        var ul = document.getElementById(this.wheel_ul);
        var list = ul.getElementsByTagName("li");
        for (var temp = 0; temp < list.length; temp++) {
            if (list[temp].className == "selectedLi") {
                ul.removeChild(list[temp]);
                return;
            }
        }
    };
    Wheel.prototype.getLastWord = function (string) {
        var ar = string.split(" ");
        var i = ar.length - 1;
        while (i >= 0 && (ar[i] == " " || ar[i] == "")) {
            i--;
        }
        return ar[i];
    };
    Wheel.prototype.replaceLastWord = function (string, replace) {
        var strsplit = string.split(" ");
        var ar = new Array();
        for (var temp = 0; temp < strsplit.length; temp++)
            if (strsplit[temp] != "")
                ar.push(strsplit[temp]);
        if (ar.length == 1)
            return replace;
        var returnString = "";
        for (var temp = 0; temp < ar.length - 1; temp++) {
            if (returnString == "")
                returnString += ar[temp];
            else
                returnString += " " + ar[temp];
        }
        returnString += " " + replace;
        return returnString;
    };
    Wheel.prototype.handleSpace = function () {
        var ul = document.getElementById(this.wheel_ul);
        var list = ul.getElementsByTagName("li");
        for (var temp = 0; temp < list.length; temp++) {
            if (list[temp].className == "selectedLi") {
                var st = list[temp].getAttribute('value');
                document.getElementById(this.idOfInputField).value = this.replaceLastWord(document.getElementById(this.idOfInputField).value, st) + " ";
                list[temp].setAttribute('className', 'notSelectedLi');
                list[temp].setAttribute('class', 'notSelectedLi');
                this.hideOverlay();
                return true;
            }
        }
        return false;
    };
    Wheel.prototype.handleWheel = function (event) {
        var keyCode = (window.event) ? event.which : event.keyCode;
        switch (event.keyCode) {
            case 40:
                this.setKeySelectionDown();
                return true;
            case 38:
                this.setKeySelectionUp();
                return true;
            case 13:
                return (this.keyReturn());
            case 27:
                this.hideOverlay();
                return true;
            case 46:
                this.deleteEntrance();
                return true;
            case 32:
                return this.handleSpace();
            /*	    case 33:
                    case 34:
                      this.createOrSearch();
                      return true;*/
            case 35:
            case 36:
            case 37:
            case 39:
                return true;
            default:
                return false;
        }
    };
    Wheel.prototype.replaceCandidate = function (arr, candidate) {
        var x = this.levenshtein(this.levenshteinWord, candidate);
        var y = 0;
        var current = -1;
        for (var i = 0; i < arr.length; i++) {
            var c = arr[i];
            if (c[1] > y) {
                current = i;
                y = c[1];
            }
        }
        if (current != -1 && x < y) {
            var newMember = [candidate, x];
            arr.splice(current, 1, newMember);
        }
    };
    Wheel.prototype.fillLevenshtein = function (facetArray) {
        if (this.levenshteinWord == "")
            return;
        var listArray = new Array();
        for (var temp = 0; temp < facetArray.length; temp++) {
            var x = facetArray[temp];
            if (listArray.length == this.maxWords)
                this.replaceCandidate(listArray, x.key);
            else {
                var ar = [x.key, this.levenshtein(this.levenshteinWord, x.key)];
                listArray.push(ar);
            }
        }
        var ul = document.getElementById(this.wheel_ul);
        this.offsetArray = new Array();
        if (listArray.length == 0) {
            this.hideOverlay();
            return;
        }
        this.clearUl();
        this.showOverlay();
        for (var temp = 0; temp < listArray.length; temp++) {
            var arr2 = listArray[temp];
            this.addLiElement(arr2[0]);
            this.offsetArray.push(ul.offsetHeight);
        }
        var div = document.getElementById(this.wheel_div);
        div.scrollTop = 0;
        var inputField = document.getElementById(this.idOfInputField);
        inputField.focus();
    };
    Wheel.prototype.hasParameter = function (url, name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        if (results == null)
            return "";
        else
            return results[1];
    };
    return Wheel;
}());
