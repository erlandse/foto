var JsonTool = (function () {
    function JsonTool() {
    }
    JsonTool.createJsonPath = function (str) {
        var list = str.split(".");
        var obj = new Object();
        var nPath = "";
        for (var temp = 0; temp < list.length; temp++) {
            if (list[temp].endsWith("[]")) {
                eval("obj." + nPath + list[temp].substring(0, list[temp].length - 2) + "= new Array()");
                break;
            }
            else {
                eval("obj." + nPath + list[temp] + "= new Object()");
            }
            nPath += list[temp] + ".";
        }
        return obj;
    };
    JsonTool.insertField = function (obj, str) {
        var l = str.split(":");
        var i;
        i = parseInt(l[1]);
        if (isNaN(i)) {
            eval("obj." + l[0] + "=\"" + l[1] + "\"");
        }
        else {
            i = parseInt(l[1]);
            eval("obj." + l[0] + "=" + i);
        }
    };
    JsonTool.createJsonParallel = function (str) {
        var obj = new Object();
        var list = str.split("&");
        for (var temp = 0; temp < list.length; temp++) {
            var st = list[temp];
            if (st.endsWith("[]")) {
                st = st.substr(0, st.length - 2);
                eval("obj." + st + "= new Array()");
            }
            else if (st.indexOf(":") != -1) {
                this.insertField(obj, st);
            }
            else
                eval("obj." + st + "= new Object()");
        }
        return obj;
    };
    JsonTool.cloneJSON = function (obj) {
        // basic type deep copy
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return obj;
        }
        // array deep copy
        if (obj instanceof Array) {
            var cloneA = [];
            for (var i = 0; i < obj.length; ++i) {
                cloneA[i] = this.cloneJSON(obj[i]);
            }
            return cloneA;
        }
        // object deep copy
        var cloneO = {};
        for (var i in obj) {
            cloneO[i] = this.cloneJSON(obj[i]);
        }
        return cloneO;
    };
    return JsonTool;
}());
