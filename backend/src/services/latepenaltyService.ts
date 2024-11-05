import { PenaltyStrategy } from "@prisma/client";
import prisma from "../prismaClient";

class LatePenaltyService {
	private dueDate: Date;
	private submissionTime: Date;
	private penaltyStrategy: PenaltyStrategy;

	constructor(dueDate: Date, submissionTime: Date, penaltyStrategy: PenaltyStrategy, extraDays: number) {
		dueDate.setDate(dueDate.getDate() + extraDays);
		
		this.dueDate = dueDate;
		this.submissionTime = submissionTime;
		this.penaltyStrategy = penaltyStrategy;
	}

	public getDaysLate(): number {
		const timeDiff = this.dueDate.getTime() - this.submissionTime.getTime();
		return Math.ceil(timeDiff / (1000 * 3600 * 24));
	}

	public getHoursLate(): number {
		const timeDiff = this.dueDate.getTime() - this.submissionTime.getTime();
		return Math.ceil(timeDiff / (1000 * 3600));
	}
	/**
     * Calculates the late penalty for a submission based on the penalty Strategy.
     * The penalty is a percentage of the total marks that are removed.
	 * @returns the late penalty as a percentage 
	 */
	public getLatePenalty(): number {
		const daysLate = this.getDaysLate();
		const hoursLate = this.getHoursLate();
		let latePenalty = 0;
		if (daysLate > 0) {
			if (daysLate >= 5) {
				latePenalty = 100;
			} else if (this.penaltyStrategy === PenaltyStrategy.Hourly) {
				latePenalty = 0.1 * hoursLate;
			} else {
				latePenalty = 5 * daysLate;
			}
		}
		return latePenalty;
	}

	/**
	 * Calculates the extra days for a group assignment based on the group members' ELS duration.
	 * @param groupId - The group ID
	 * @param dueDate - The due date of the assignment
	 * @returns the number of extra days for the group
	 */
	public static async getExtraDaysGroup(groupId: number, dueDate: Date) {
		const groupData = await prisma.group.findUnique({ 
			where: { 
				id: groupId 
			},
			include: {
				members: {
					include: {
						ELSDuration: {
							include: {
								elsType: true
							}
						}
					}
				}
			},
		});
		
		if (!groupData) {
			return 0;
		}

		return groupData.members.reduce((acc, member) => {
			if (!member.ELSDuration) {
				return acc;
			}

			const { startDate, endDate, elsType } = member.ELSDuration;

			if (startDate > dueDate || endDate < dueDate) {
				return acc;
			}

			const extraDays = elsType.extraDays;
			return Math.max(acc, extraDays);
		}, 0);
	}

	/**
	 * Calculates the extra days for an individual assignment based on the student's ELS duration.
	 * @param studentId - The student ID
	 * @param dueDate - The due date of the assignment
	 * @returns the number of extra days for the student
	 */
	public static async getExtraDaysIndividual(studentId: number, dueDate: Date) {
		const studentData = await prisma.user.findUnique({ 
			where: { 
				zid: studentId 
			},
			include: {
				ELSDuration: {
					include: {
						elsType: true
					}
				}
			},
		});
		
		if (!studentData || !studentData.ELSDuration) {
			return 0;
		}

		const { startDate, endDate, elsType } = studentData.ELSDuration;

		if (startDate > dueDate || endDate < dueDate) {
			return 0;
		}

		return elsType.extraDays;
	}
}

export default LatePenaltyService;