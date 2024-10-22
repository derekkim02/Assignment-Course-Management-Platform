import { User } from "@prisma/client";
import prisma from "./prismaClient";

const fetchCoursesForMarker = async (user: User) => {
  return await prisma.course.findMany({
    where: {
      OR: [
        { teachingAssignments: { some: { lecturerId: user.zid } } },
        { markingAssignments: { some: { markerId: user.zid } } }
      ]
    },
    select: {
      id: true,
      code: true,
      name: true,
      teachingAssignments: {
        select: {
          termYear: true,
          termTerm: true
        }
      },
      markingAssignments: {
        select: {
          termYear: true,
          termTerm: true
        }
      }
    }
  });
};

const fetchCoursesForStudent = async (user: User) => {
  return await prisma.course.findMany({
    where: {
      OR: [
        { teachingAssignments: { some: { lecturerId: user.zid } } },
        { markingAssignments: { some: { markerId: user.zid } } }
      ]
    },
    select: {
      code: true,
      name: true,
      teachingAssignments: {
        select: {
          termYear: true,
          termTerm: true
        }
      },
      markingAssignments: {
        select: {
          termYear: true,
          termTerm: true
        }
      }
    }
  });
};

const courseFetchStrategies: { [key: string]: (user: User) => Promise<any> } = {
  marker: fetchCoursesForMarker,
  lecturer: fetchCoursesForMarker,
  default: fetchCoursesForStudent
};

export { fetchCoursesForMarker, fetchCoursesForStudent, courseFetchStrategies };