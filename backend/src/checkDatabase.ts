import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Finds user in DB where zid = ""
async function checkdb() {
    const users = await prisma.user.findFirst({
        where: {
            zid: 5345256
        }
    });
    console.log(users);

    prisma.$disconnect;
}
checkdb();