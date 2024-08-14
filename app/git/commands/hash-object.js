const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");

class HashObjectCommand {
  constructor(flag, filepath) {
    this.flag = flag;
    this.filepath = filepath;
  }
  execute() {
    // Implement the hash-object command here

    // 1. Ensure tthat the filepath exists
    const filepath = path.resolve(this.filepath);
    if (!fs.existsSync(filepath)) {
      throw new Error(
        `could not open '${this.filepath}': No such file or directory`,
      );
    }

    // 2. Read the file contents
    const fileContents = fs.readFileSync(filepath);
    const fileLength = fileContents.length;

    // 3. Create a blob object
    const header = `blob ${fileLength}\0`;
    const blob = Buffer.concat([Buffer.from(header), fileContents]);

    // 4. Calculate the hash
    const sha1 = crypto.createHash("sha1").update(blob).digest("hex");

    // 5. If "-w" flag is passed:
    if (this.flag && this.flag === "-w") {
      //5.1 Write the object to the git objects directory
      const directory = sha1.slice(0, 2);
      const filename = sha1.slice(2);

      const absDirPath = path.join(process.cwd(), ".git", "objects", directory);
      if (!fs.existsSync(absDirPath)) {
        fs.mkdirSync(absDirPath, { recursive: true });
      }

      //5.2 compressed file
      const compressedFileContents = zlib.deflateSync(blob);
      fs.writeFileSync(path.join(absDirPath, filename), compressedFileContents);
    }

    process.stdout.write(sha1);
  }
}
module.exports = HashObjectCommand;
