import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

class AutomarkService {
    private expectedOutput: String;
	private inputStream: String;
	private directoryPath: String;

    testExpectedOutput =`
        Hello World!
    `

    testInputStream =`
        1
        2
        3
        4
    `

    testDirectoryPath ="/testAssessment"

    constructor(expectedOutput: String, inputStream: String, directoryPath: String) {
        // Initialization code here
        this.expectedOutput = expectedOutput;
		this.inputStream = inputStream;
		this.directoryPath = directoryPath;
    }

    async automark(): Promise<String> {
        try {
            // Read the input stream
            const inputContent = this.inputStream;

            // Read files from the directory
            const files = await fs.readdir(this.directoryPath);

            // Construct the command to run the executable with the input content
            const command = `${this.directoryPath} ${inputContent}`;

            // Run the input content on the command line
            const { stdout, stderr } = await execPromise(command);

            if (stderr) {
                console.error('Error executing command:', stderr);
            }

            // Read the expected output
            const expectedContent = await this.expectedOutput.text();

            // Compare the outputs line by line
            const expectedLines = expectedContent.split('\n');
            const outputLines = stdout.split('\n');

            for (let i = 0; i < outputLines.length; i++) {
                if (expectedLines[i] !== outputLines[i]) {
                    console.error(`Automark failed: Line ${i + 1} does not match.`);
                }
            }



            // Maybe store in a string or an array? the ExpectedLines and the IncorrectLines

            console.log('Automark successful: All lines match.');
        } catch (error) {
            console.error('Error automarking:', error);
        }
        return "A"
    }

}

export default AutomarkService;