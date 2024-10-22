/* eslint-disable @typescript-eslint/no-unused-expressions */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Finds user in DB where zid = ""
async function getUser(zid: number) {
    const users = await prisma.user.findFirst({
        where: {
            zid: zid
        }
    });
    console.log(users);

    prisma.$disconnect;
}
getUser(5345256);