"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var csv = require("csv-parser");
var dataStore_1 = require("./dataStore");
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function splitName(fullName) {
    var names = fullName.split(' ');
    var firstName = names[0];
    var lastName = names.slice(1).join(' ');
    return { firstName: firstName, lastName: lastName };
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
var importCsvToDb = function (csvFilePath) { return __awaiter(void 0, void 0, void 0, function () {
    var dataStore, results;
    return __generator(this, function (_a) {
        dataStore = (0, dataStore_1.getData)();
        csvFilePath = "./samplecsv.csv";
        results = [];
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
            on('data', function (data) { return __awaiter(void 0, void 0, void 0, function () {
            var _a, firstName, lastName, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = splitName(data.name), firstName = _a.firstName, lastName = _a.lastName;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        // Upsert user by zid or email
                        return [4 /*yield*/, prisma.user.upsert({
                                where: { email: data.email },
                                update: {
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: data.email,
                                    // Add other fields to update if needed
                                },
                                create: {
                                    zid: parseInt(data.zid.replace('z', ''), 10),
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: data.email,
                                    password: 'default_password', // You would want to hash and securely handle passwords in real scenarios
                                    role: 'STUDENT', // Define a default role or map from CSV if provided
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
                            })];
                    case 2:
                        // Upsert user by zid or email
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error("Failed to process user ".concat(data.name, ":"), error_1);
                        return [3 /*break*/, 4];
                    case 4:
                        results.push(data);
                        dataStore.users[1]; // = 'data';
                        return [2 /*return*/];
                }
            });
        }); })
            .on('end', function () { return __awaiter(void 0, void 0, void 0, function () {
            var users;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.user.findMany()];
                    case 1:
                        users = _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); };
/*
// Example usage
const csvFilePath = 'path/to/your/file.csv';
const dbFilePath = 'path/to/your/database.db';
importCsvToDb(csvFilePath, dbFilePath);
*/
importCsvToDb('test');
