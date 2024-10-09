import * as fs from 'fs';
import csv = require('csv-parser');
import processCSVRow = require('csv-parser');
import { getData } from './dataStore';
import { PrismaClient } from '@prisma/client'
import csvParser = require('csv-parser');

const prisma = new PrismaClient()

async function main() {
    // Example query: create a new user
    // const newUser = await prisma.user.create({
    //   data: {
    //     zid: 12345,
    //     firstName: 'firstName',
    //     lastName: 'lastName',
    //     email: 'data.email',
    //     password: 'default_password', // TODO Hashing and implementation? csv wouldnt have this info
    //     role: 'STUDENT',
    //   },
    // });
    // console.log(newUser);

    // Example query: fetch all users
    const allUsers = await prisma.user.findMany();

    const allSomething = await prisma.mark.findMany();
    console.log(allUsers);
  }

main()
.catch((e) => {
    throw e;
})
.finally(async () => {
    await prisma.$disconnect();
});

const users = console.log(prisma.course.findMany);

