import * as fs from 'fs';
import csv = require('csv-parser');
import processCSVRow = require('csv-parser');
import { getData } from './dataStore';
import { PrismaClient } from '@prisma/client'
import csvParser = require('csv-parser');

const prisma = new PrismaClient()

interface CSVRow {
    name: string;
    zid: string;
    groupname: string;
    class: string;
    mentor: string;
    groupid: number;
    groupid2: string;
    email: string;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
    const names = fullName.split('');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ');
    return { firstName, lastName };
}
/*
function readCSV(filePath: string) {
    const rows: CSVRow[] = [];

    return new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (data: CSVRow) => {
            rows.push(data);
          })
          .on('end', async () => {
            for (const row of rows) {
              await processCSVRow(row);
            }
            resolve();
          })
          .on('error', reject);
      });
}
*/

const importCsvToDb = async (csvFilePath: string) => {
    const dataStore = getData();
    csvFilePath = "./samplecsv.csv"

    const results: CSVRow[] = [];

    /*
////////////////USER
  zid                 Int                @id @default(autoincrement())
  firstName           String
  lastName            String
  email               String             @unique
  role                Role
  password            String

  teachingAssignments TeachingAssignment[]
  groups              Group[]
  // This refers to the submissions that the user has marked
  marks               Mark[]


//////////////GROUP
model Group {
  id                 Int                @id @default(autoincrement())
  name               String
  size               Int

  assignmentId       Int
  assignment         Assignment         @relation(fields: [assignmentId], references: [id])

  members            User[]
  submissions        Submission[]
}

////////////////CSV FORMAT
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
    */

    /*const user = await prisma.user.create({
        data: {
            zid: 123,
            firstName: 'elsa',
            lastName: 'nguyen',
            email: 'elsa@prisma.io',
            role: 'STUDENT',
            password: 'password1',
        },
    })
    const createUser = await prisma.user.create({ data: user })


    const users = await prisma.user.findMany()
    */

    fs.createReadStream(csvFilePath).
    pipe(csv()).
    on('data', async (data: CSVRow) => {
        try {
            // Upsert user by zid or email
            // TODO fix names
            var firstName = '';
            var lastName = '';
            if (data.name) {
              const { firstName, lastName } = splitName(data.name);
            }
            await prisma.user.upsert({
              where: { email: data.email },
              update: {
                firstName,
                lastName,
                email: data.email,
                // TODO other fields
              },
              create: {
                zid: parseInt(data.zid.replace('z', ''), 10),
                firstName,
                lastName,
                email: data.email,
                password: 'default_password', // TODO Hashing and implementation? csv wouldnt have this info
                role: 'STUDENT',
                /*groups: {
                  connectOrCreate: [
                    {
                      where: { name: data['group Name'] },
                      create: { name: data['group Name'], groupId: data.group_id }
                    },
                    {
                      where: { name: data.group_id2 },
                      create: { name: data.group_id2, groupId: data.group_id2 }
                    }
                  ]
                }*/
              }
            });
          } catch (error) {
            console.error(`Failed to process user ${data.name}:`, error);
          }
        results.push(data);
        dataStore.users[1]// = 'data';
    })
    .on('end', async () => {
        const users = await prisma.user.findMany(); // TODO delete, debug line
        //console.log(results); // Outputs results[] for debugging purposes
    });
};
/*
// Example usage
const csvFilePath = 'path/to/your/file.csv';
const dbFilePath = 'path/to/your/database.db';
importCsvToDb(csvFilePath, dbFilePath);
*/
importCsvToDb('test');
