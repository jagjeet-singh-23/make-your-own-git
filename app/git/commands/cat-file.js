const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

class CatFileCommond {
  constructor(flag, sha) {
    this.flag = flag;
    this.sha = sha;
  }
  execute() {
    const flag = this.flag;
    const sha = this.sha;

    switch (flag) {
      case "-p":
        const directory = sha.slice(0, 2);
        const fileName = sha.slice(2);
        const completePath = path.join(
          process.cwd(),
          ".git",
          "objects",
          directory,
          fileName,
        );

        if (!fs.existsSync(completePath)) {
          throw new Error(`Not a valid object name ${sha}`);
        }

        const fileContent = fs.readFileSync(completePath);
        const outputBuffer = zlib.inflateSync(fileContent);
        const output = outputBuffer.toString().split("\x00")[1];
        process.stdout.write(output);

        break;
    }
  }
}

module.exports = CatFileCommond;
