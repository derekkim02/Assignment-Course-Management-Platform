import * as fs from 'fs';
import csv = require('csv-parser');
import processCSVRow = require('csv-parser');
import { getData } from './dataStore';
import { PrismaClient } from '@prisma/client'
import csvParser = require('csv-parser');

const prisma = new PrismaClient()
prisma.$connect
const users = console.log(prisma.course.findMany);

