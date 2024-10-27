import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

export function automark(expectedOutput: string, shellCommands: string, directoryPath: string, inputStream: Array<string>) {
    return new Promise((resolve, reject) => {
        let incorrectLines = "";

        try {
            // Read the input stream and run it on the students directory
            const process = spawn("bash", ["-c", shellCommands], { cwd: directoryPath });

            // Loop through the inputStream for any possible inputs required for the running of the code.
            for (let i = 0; i < inputStream.length; i++) {
                process.stdin.write(inputStream[i]);
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
                    const expectedLinesArray = expectedOutput.split('\n');

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
                    reject(`Error in student code\nProcess exited with code ${code}\n${stderr}\ninputStream: ${inputStream}`);
                }
            });
        } catch (error) {
            // Error executing the shellCommands
            reject(`Error executing command: ${error}`);
        }
    });
}

function main() {

    (async () => {
        try {
            const testExpectedOutput =`Hello, World!\nThis is a test\nThis is for whitespace error correction.\n`

            const testShellCommands =`python3 main.py`

            const __filename = fileURLToPath(import.meta.url);
            const __dirname = path.dirname(__filename);
            const testDirectoryPath = path.join(__dirname, '../services/testStudentFolder');

            const testInput = ['1'];

            const result = await automark(testExpectedOutput, testShellCommands, testDirectoryPath, testInput);
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    })();
}

main();