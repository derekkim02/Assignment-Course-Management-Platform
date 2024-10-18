import * as fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client'

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
    const names = fullName.split(' ');
    const firstName = names[0];
    const lastName = names.slice(1).join(' ');
    return { firstName, lastName };
}


const importCsvToDb = async (csvFilePath: string) => {;
    csvFilePath = "./samplecsv.csv"

    fs.createReadStream(csvFilePath).
    pipe(csv()).
    on('data', async (data: CSVRow) => {
        try {
            // Upsert user by email
            const { firstName, lastName } = splitName(data.name);
            await prisma.user.upsert({
                where: { email: data.email },
                update: {
                    firstName,
                    lastName,
                    email: data.email,
              },
              create: {
                zid: parseInt(data.zid.replace('z', ''), 10),
                firstName,
                lastName,
                email: data.email,
                password: 'default_password', // TODO Hashing and implementation? csv wouldnt have this info
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
    })
    .on('end', async () => {
        const users = await prisma.user.findMany();      // DEBUGGING: PRINTS USERS
        console.log(users)
        prisma.$disconnect;
    });
};

importCsvToDb('test');
