import * as fs from 'fs';
import csv = require('csv-parser');
import { getData } from './dataStore';

interface DataRow {
    name: string;
    zid: string;
    groupname: string;
    class: string;
    mentor: string;
    groupid: number;
    groupid2: string;
    email: string;
}

const importCsvToDb = (csvFilePath: string) => {
    const data = getData();
    data.users;
    csvFilePath = "./samplecsv.csv"

    const results: DataRow[] = [];

    fs.createReadStream(csvFilePath).
    pipe(csv()).
    on('data', (data: DataRow) => {
        results.push(data);
    })
    .on('end', () => {
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
