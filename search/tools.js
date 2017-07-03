var Tools = (function () {
    function Tools() {
    }
    Tools.addOption = function (elSel, text, value) {
        var elOptNew = document.createElement('option');
        elOptNew.text = text;
        elOptNew.value = value;
        elSel.appendChild(elOptNew);
    };
    Tools.removeOptionSelected = function (selectId) {
        var elSel = document.getElementById(selectId);
        var i;
        for (i = elSel.length - 1; i >= 0; i--) {
            if (elSel.options[i].selected) {
                elSel.remove(i);
            }
        }
    };
    Tools.removeAllOptions = function (selectId) {
        var elSel = document.getElementById(selectId);
        while (elSel.length > 0)
            elSel.remove(elSel.length - 1);
    };
    Tools.selectAllOptions = function (selectId) {
        var sel = document.getElementById(selectId);
        for (var temp = 0; temp < sel.length; temp++)
            sel.options[temp].selected = true;
    };
    Tools.gup = function (name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null)
            return "";
        else
            return results[1];
    };
    return Tools;
}());
