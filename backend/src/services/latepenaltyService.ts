import { PenaltyStrategy } from "@prisma/client";

class LatePenaltyService {
	private dueDate: Date;
	private submissionTime: Date;
	private penaltyStrategy: PenaltyStrategy;

	constructor(dueDate: Date, submissionTime: Date, penaltyStrategy: PenaltyStrategy) {
		this.dueDate = dueDate;
		this.submissionTime = submissionTime;
		this.penaltyStrategy = penaltyStrategy;
	}

	getDaysLate(): number {
		const timeDiff = this.dueDate.getTime() - this.submissionTime.getTime();
		return Math.ceil(timeDiff / (1000 * 3600 * 24));
	}

	getHoursLate(): number {
		const timeDiff = this.dueDate.getTime() - this.submissionTime.getTime();
		return Math.ceil(timeDiff / (1000 * 3600));
	}

	getLatePenalty(): number {
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
}

export default LatePenaltyService;