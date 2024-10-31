import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { extract } from 'tar';
import { fileURLToPath } from 'url';

class AutomarkService {
    private static __filename = fileURLToPath(import.meta.url);
    private static __dirname = path.dirname(AutomarkService.__filename);

    public static testEnvDir = path.join(AutomarkService.__dirname, "..", "..", "app", "test_env");

    private testCases: TestCase[];
	private shellCommands: string;
	private submissionPath: string;
    private testDirectory: string;

    constructor(testCases: TestCase[], shellCommands: string, submissionPath: string) {
        // Initialization code here
        this.testCases = testCases;
        this.shellCommands = shellCommands;
        this.submissionPath = submissionPath;

        const fileName = this.getSubmissionName();
        this.testDirectory = path.join(AutomarkService.testEnvDir, fileName + '_test');
    }

    public async runTests(): Promise<TestResult[]> {
        try {
            await this.extractFiles();
            const results = await Promise.allSettled(this.testCases.map(testCase => this.runTestCase(testCase)));
            await this.cleanup();

            return results.map(result => ({
                passed: result.status === 'fulfilled' && result.value === "Passed",
                message: result.status === 'fulfilled' 
                    ? (result.value === "Passed" ? "Passed" : result.value) 
                    : (result.reason as Error).message,
            }));
            
        } catch (error) {
            await this.cleanup();
            throw error;
        }
    }

    private getSubmissionName = (): string => {
        return path.basename(this.submissionPath, '.tar.gz');
    }

    // This function must be called first to run the test cases
    private async extractFiles(): Promise<void> {
        await fs.promises.mkdir(this.testDirectory, { recursive: true });
        await extract({
            file: this.submissionPath,
            cwd: this.testDirectory,
            gzip: true,
        });
    }

    private async runTestCase(testCase: TestCase): Promise<string> {
        const { input, expectedOutput } = testCase;
        const inputLines = input.split('\n');
        const expectedLines = expectedOutput.split('\n');

        const evalDiscrepancies = (output: string[], expected: string[]): string => {
            return output.reduce((acc, line, index) => {
                if (line.trim() !== expected[index]?.trim()) {
                    return acc + `Line ${index + 1} is incorrect. Expected: "${expected[index]}", but got: "${line}"\n`;
                }
                return acc;
            }, '');
        }

        // Rejection only occurs if the student's code cannot be executed
        // Or if the student code did not run successfully
        return new Promise((resolve, reject) => {
            try {
                const process = spawn("bash", ["-c", this.shellCommands], { cwd: this.testDirectory });

                // Write inputs to the process's stdin, and end the stream after all are written
                inputLines.forEach((line) => process.stdin.write(line));
                process.stdin.end();

                let stdout = "";
                let stderr = "";

                // Collect data from stdout and stderr
                process.stdout.on('data', data => (stdout += data.toString()));
                process.stderr.on('data', data => (stderr += data.toString()));

                // Close the spawn.
                process.on('close', (code) => {
                    if (code !== 0) {
                        // Students code did not run successfully, compiler error
                        reject(`Error in student code\nProcess exited with code ${code}\n${stderr}\ninputStream: ${input}`);
                    }
                    const outputLines = stdout.split('\n');
                    const discrepancies = evalDiscrepancies(outputLines, expectedLines);
                    resolve(discrepancies ? `Some lines are incorrect:\n${discrepancies}` : 'Passed');
                });
            } catch (error) {
                // Error executing the shellCommands
                reject(`Error executing command: ${error}`);
            }
        });
    }

    private async cleanup(): Promise<void> {
        await fs.promises.rm(this.testDirectory, { recursive: true, force: true });
    }

}

export default AutomarkService;