import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

// Create a new pool instance
const pool = new Pool({
    user: 'teamrat',
    host: 'postgres',
    database: 'igivedb',
    password: 'RATT4TA7A',
    port: 5432,
});
const prisma = new PrismaClient()
// Example function to query the database
const queryDatabase = async () => {
    const newUser = await prisma.user.create({
      data: {
        zid: 12345,
        firstName: 'firstName',
        lastName: 'lastName',
        email: 'data.email',
        password: 'default_password', // TODO Hashing and implementation? csv wouldnt have this info
        role: 'STUDENT',
      },
    });
    console.log(newUser);
    try {
        const result = await pool.query('SELECT NOW()'); // Example query
        console.log('Current Time:', result.rows[0]);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error executing query', error.message); // Use error.message for a clearer output
        } else {
            console.error('Unexpected error', error);
        }
    }
};

// Call the query function
queryDatabase()
    .then(() => pool.end())
    .catch(err => console.error('Error executing query', err));
