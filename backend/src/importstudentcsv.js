"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var csv = require("csv-parser");
var dataStore_1 = require("./dataStore");
var importCsvToDb = function (csvFilePath) {
    var data = (0, dataStore_1.getData)();
    data.users;
    csvFilePath = "./samplecsv.csv";
    var results = [];
    fs.createReadStream(csvFilePath).
        pipe(csv()).
        on('data', function (data) {
        results.push(data);
    })
        .on('end', function () {
        console.log(results); // This will output your array after the CSV is fully read.
    });
};
/*
// Example usage
const csvFilePath = 'path/to/your/file.csv';
const dbFilePath = 'path/to/your/database.db';
importCsvToDb(csvFilePath, dbFilePath);
*/
importCsvToDb('test');
