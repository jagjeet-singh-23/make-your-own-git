const { writeBlobHash } = require("../../../utils/writeBlobHash");

class HashObjectCommand {
  constructor(flag, filepath) {
    this.flag = flag;
    this.filepath = filepath;
  }
  execute() {
    // Implement the hash-object command here
    const filePath = this.filepath;
    const flag = this.flag;

    const writeFlag = flag && flag === "-w" ? true : false;
    const sha1 = writeBlobHash(filePath, writeFlag);
    process.stdout.write(sha1);
  }
}
module.exports = HashObjectCommand;
