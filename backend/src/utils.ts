import { User } from "@prisma/client";
import prisma from "./prismaClient";

const fetchCoursesForMarker = async (user: User) => {
  return await prisma.course.findMany({
    where: {
      OR: [
        { courseOfferings: { some: { lecturerId: user.zid } } },
        { courseOfferings: { some: { tutors: { some: { zid: user.zid } } } } }
      ]
    },
    select: {
      id: true,
      code: true,
      name: true,
      courseOfferings: {
        select: {
          termYear: true,
          termTerm: true,
          lecturerId: true,
          tutors: {
            select: {
              zid: true
            }
          }
        }
      }
    }
  });
};

const fetchCoursesForStudent = async (user: User) => {
  return await prisma.course.findMany({
    where: {
      OR: [
        { courseOfferings: { some: { enrolledStudents: { some: { zid: user.zid } } } } },
      ]
    },
    select: {
      code: true,
      name: true,
      courseOfferings: {
        select: {
          termYear: true,
          termTerm: true,
          enrolledStudents: {
            select: {
              zid: true
            }
          },
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