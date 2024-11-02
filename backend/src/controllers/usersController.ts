import { Request, Response } from 'express';
import prisma from '../prismaClient';

// export const getUsers = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const users = await prisma.user.findMany({
//       select: {
//         zid: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         admin: {
//           select: {
//             zid: true
//           }
//         }
//       }
//     });
//     const transformedUsers = users.map(user => ({
//       zid: user.zid,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       isAdmin: user.admin.length !== 0
//     }));
//     res.json(transformedUsers);
//   } catch (e) {
//     res.status(500).json({ error: `Failed to fetch courses (${e})` });
//   }
// }

/**
 * Fetches all users from the database and returns them in the response.
 *
 * @param {Request} req - The request object from Express.
 * @param {Response} res - The response object from Express.
 * @returns {Promise<void>} - A promise that resolves when the users are fetched and the response is sent.
 *
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (e) {
    res.status(500).json({ error: `Failed to fetch users (${e})` });
  }
}
