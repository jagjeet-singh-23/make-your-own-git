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
    // 1. Make sure that file is there
    const filepath = path.resolve(this.filepath);

    if (!fs.existsSync(filepath))
      throw new Error(
        `could not open '${this.filepath}' for reading: No such file or directory`
      );

    // 2. read the file
    const fileContents = fs.readFileSync(filepath);
    const fileLength = fileContents.length;

    // 3. create blob
    const header = `blob ${fileLength}\0`;
    const blob = Buffer.concat([Buffer.from(header), fileContents]);

    // 4. calculate hash
    const hash = crypto.createHash("sha1").update(blob).digest("hex");

    // 5. if -w then write file also (commpress)
    if (this.flag && this.flag === "-w") {
      const folder = hash.slice(0, 2);
      const file = hash.slice(2);

      const completeFolderPath = path.join(
        process.cwd(),
        ".git",
        "objects",
        folder
      );

      if (!fs.existsSync(completeFolderPath)) fs.mkdirSync(completeFolderPath);

      const compressedData = zlib.deflateSync(blob);
      fs.writeFileSync(path.join(completeFolderPath, file), compressedData);
    }

    process.stdout.write(hash);
  }
}

module.exports = HashObjectCommand;
