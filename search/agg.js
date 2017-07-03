
var wordListQuery = {
    "tags": {
        "terms": {
            "field": "tags",
            "include": ""
        }
    }
};

var tagList = {
    "aggs" : {
            "tags":{
              "terms" : {
                "field": "tags",
                 "size":100,
                "order" : { "_term" : "asc" }
              }
            }
    }
}

var messageWordList = {
    "message": {
        "terms": {
            "field": "message",
            "include": ""
        }
    }
};