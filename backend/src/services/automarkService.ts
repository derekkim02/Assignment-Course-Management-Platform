import { spawn } from 'child_process';

class AutomarkService {
    private expectedOutput: string;
	private shellCommands: string;
	private directoryPath: string;
    private inputStream: Array<string>;

    constructor(expectedOutput: string, shellCommands: string, directoryPath: string, inputStream: Array<string>) {
        // Initialization code here
        this.expectedOutput = expectedOutput;
        this.shellCommands = shellCommands;
        this.directoryPath = directoryPath;
        this.inputStream = inputStream;
    }

    async automark(): Promise<String> {
        return new Promise((resolve, reject) => {
            let incorrectLines = "";

            try {
                // Read the input stream and run it on the students directory
                const process = spawn("bash", ["-c", this.shellCommands], { cwd: this.directoryPath });

                // Loop through the inputStream for any possible inputs required for the running of the code.
                for (let i = 0; i < this.inputStream.length; i++) {
                    process.stdin.write(this.inputStream[i]);
                }
                process.stdin.end();

                let stdout = "";
                let stderr = "";

                // Capture the stdout
                process.stdout.on('data', (data) => {
                    stdout += data.toString();
                });

                // Capture the stderr
                process.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                // Close the spawn.
                process.on('close', (code) => {
                    if (code === 0) {

                        const outputLines = stdout.split('\n');
                        const expectedLinesArray = this.expectedOutput.split('\n');

                        // Loop through each line of the output and compare it with the expected output
                        outputLines.forEach((line, index) => {
                            // .trim() is used for whitespace error correction
                            if (line.trim() !== expectedLinesArray[index]?.trim()) {
                                incorrectLines += `Line ${index + 1} is incorrect. Expected: "${expectedLinesArray[index]}", but got: "${line}"\n`;
                            }
                        });

                        if (incorrectLines) {
                            resolve(`Some lines are incorrect:\n${incorrectLines}`);
                        } else {
                            resolve('All lines are correct.');
                        }
                    } else {
                        // Students code did not run successfully, compiler error
                        reject(`Error in student code\nProcess exited with code ${code}\n${stderr}\ninputStream: ${this.inputStream}`);
                    }
                });
            } catch (error) {
                // Error executing the shellCommands
                reject(`Error executing command: ${error}`);
            }
        });
    }

}

export default AutomarkService;