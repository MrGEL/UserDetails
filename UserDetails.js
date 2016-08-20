var mongo = require('mongodb');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

process.on('SIGINT', OnCtrlC);

app.use(express.static('public'));
app.use(bodyParser.json());


var MongoClient = mongo.MongoClient;
var mongoDb = null;

MongoClient.connect('mongodb://localhost:27017/UserDb', function(error, db) {
    if(error !== null) {
        console.log('Unable to connect to mongodb server, error: ' + error);
    }
    else {
        mongoDb = db;
        console.log('Established connection to mongodb server: ');
    }
});

var RESULT = [
    { code : 0, text : 'Success' },
    { code : 1, text : 'Duplicate id' },
    { code : 2, text : 'Insert error' },
    { code : 3, text : 'No database' },
    { code : 4, text : 'UserDetails table not found' }
];

function OnPostAddUserDetails(userDetails, response) {
    if(mongoDb !== null) {
        var collection = mongoDb.collection('UserDetails');
        if(collection !== null) {
            collection.findOne({id:userDetails.id}, function(error, row) {
                if(row !== null) {
                    response.send(JSON.stringify(RESULT[1]));
                }
                else {
                    collection.insert(userDetails, function(error, result) {
                        if(error === null) {
                            response.send(JSON.stringify(RESULT[0]));
                        } else {
                            response.send(JSON.stringify(RESULT[2]));
                        }
                    });
                }
            });
        } else {
            response.send(JSON.stringify(RESULT[4]));
        }
    } else {
        response.send(JSON.stringify(RESULT[3]));
    }
}

function ValidateObj(fieldData, fieldCount) {
    var count = 0;
    for(prop in fieldData) {
        if(fieldData.hasOwnProperty(prop) === true) {
            count += 1;
        }
    }
    return count === fieldCount;
}

app.post('/', function(request, response) {
    debugger;
    var userDetails = request.body;
    if(ValidateObj(userDetails, 4) === false) {
        var jsonObj = BuildResponse(userDetails, 'Invalid JSON data');
        res.send(JSON.stringify(jsonObj));
    }
    else {
        OnPostAddUserDetails(userDetails, response);
    }
});

app.listen(8192, function () {
  console.log('Example app listening on port 8192!');
});

function OnExitProcess() {
    process.exit();
}

function OnMongoEnd(err) {
    console.log('SQL disconnect');
}

function OnCtrlC() {
    if(mongoDb !== null) {
        mongoDb.close();
    }
    setTimeout(OnExitProcess, 1000);
}
