import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);


class AutomarkService {
    private expectedOutput: File;
	private inputStream: File;
	private filePath: String;

    constructor(expectedOutput: File, inputStream: File, filePath: String) {
        // Initialization code here
        this.expectedOutput = expectedOutput;
		this.inputStream = inputStream;
		this.filePath = filePath;
    }

    async automark(): Promise<number> {
        try {
            // Read the input stream
            const inputContent = this.inputStream.text();

            // Construct the command to run the executable with the input content
            const command = `${this.filePath} ${inputContent}`;

            // Run the input content on the command line
            const { stdout, stderr } = await execPromise(command);

            if (stderr) {
                console.error('Error executing command:', stderr);
                return -1;
            }

            // Read the expected output
            const expectedContent = await this.expectedOutput.text();

            // Compare the outputs line by line
            const expectedLines = expectedContent.split('\n');
            const outputLines = stdout.split('\n');

            for (let i = 0; i < expectedLines.length; i++) {
                if (expectedLines[i] !== outputLines[i]) {
                    console.error(`Automark failed: Line ${i + 1} does not match.`);
                    return -1;
                }
            }

            // Maybe store in a string or an array? the ExpectedLines and the IncorrectLines

            console.log('Automark successful: All lines match.');
        } catch (error) {
            console.error('Error automarking:', error);
            return -1;
        }
        return 0;
    }

}

export default AutomarkService;