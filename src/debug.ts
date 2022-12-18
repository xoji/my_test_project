import * as path from "path";
import * as fs from "fs";

const errLogPath = path.resolve(__dirname, "..", "logs", "error.log");

export function error(errorMessage: Error, method: string) {
	fs.appendFile(errLogPath, `${new Date()}: ${errorMessage.message}, method: ${method}, ${errorMessage.stack} \n\n\n\n`, () => {});
}