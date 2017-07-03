var Bucket = (function () {
    function Bucket() {
    }
    return Bucket;
}());
var ElasticClass = (function () {
    function ElasticClass(rootOb) {
        this.rootObject = null;
        this.rootObject = rootOb;
    }
    ElasticClass.prototype.getDocCount = function () {
        return this.rootObject.hits.total;
    };
    ElasticClass.prototype.getFacetFieldWithFacetName = function (nameOfField) {
        var list; //her skulle vere bucket
        try {
            list = eval("this.rootObject.aggregations." + nameOfField + ".buckets");
            return list;
        }
        catch (e) {
            return list;
        }
    };
    ElasticClass.prototype.getDocs = function () {
        var p;
        try {
            p = eval("this.rootObject.hits.hits");
            return p;
        }
        catch (e) {
            return p;
        }
    };
    ElasticClass.prototype.getArrayFromDoc = function (doc, nameOfField) {
        return eval("doc._source." + nameOfField) == null ? new Array() : eval("doc._source." + nameOfField);
    };
    ElasticClass.prototype.getSingleFieldFromDoc = function (doc, nameOfField) {
        return eval("doc._source." + nameOfField) == null ? "" : eval("doc._source." + nameOfField);
    };
    ElasticClass.prototype.getHighlightFieldFromDoc = function (doc, nameOfField) {
        return eval("doc.highlight." + nameOfField) == null ? new Array() : eval("doc.highlight." + nameOfField);
    };
    ElasticClass.prototype.getMetadataFieldFromDoc = function (doc, nameOfField) {
        return eval("doc." + nameOfField) == null ? "" : eval("doc." + nameOfField);
    };
    return ElasticClass;
}());
//export = ElasticClass;
