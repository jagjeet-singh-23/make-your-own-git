const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

class LSTreeCommand {
  constructor(flag, sha) {
    this.flag = flag;
    this.sha = sha;
  }
  execute() {
    const flag = this.flag;
    const sha = this.sha;

    const directory = sha.slice(0, 2);
    const filename = sha.slice(2);

    const directoryPath = path.join(
      process.cwd(),
      ".git",
      "objects",
      directory,
    );

    const filePath = path.join(directoryPath, filename);

    if (!fs.existsSync(directoryPath || !fs.existsSync(filePath))) {
      throw new Error(`Not a valid object name : ${sha}`);
    }

    const fileContent = fs.readFileSync(filePath);
    const outputBuffer = zlib.inflateSync(fileContent);
    const output = outputBuffer.toString();

    const treeContent = output.slice(0).filter((e) => e.includes(" "));
    const names = treeContent.map((e) => e.split(" ")[1]);

    names.forEach((name) => process.stdout.write(`${name}\n`));
  }
}

module.exports = LSTreeCommand;
