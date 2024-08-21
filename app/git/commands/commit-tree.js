const fs = require("fs");
const path = require("path");

class CommitTreeCommand {
  constructor(treeSha, parent, message) {
    this.treeSha = treeSha;
    this.parentSha = parent;
    this.message = message;
  }

  execute() {
    const commitContentBuffer = Buffer.concat([
      Buffer.from(`tree ${this.treeSha}\n`),
      Buffer.from(`parent ${this.parentSha}\n`),
      Buffer.from(
        `author ${process.env.GIT_AUTHOR_NAME} <${process.env.GIT_AUTHOR_EMAIL}> ${Math.floor(Date.now() / 1000)} +0000\n`,
      ),
      Buffer.from(
        `committer ${process.env.GIT_COMMITTER_NAME} <${process.env.GIT_COMMITTER_EMAIL}> ${Math.floor(Date.now() / 1000)} +0000\n\n`,
      ),
      Buffer.from(`${this.message}\n`),
    ]);

    const header = `commit ${commitContentBuffer.length}\0`;
    const store = Buffer.concat([Buffer.from(header), commitContentBuffer]);

    const sha = require("crypto")
      .createHash("sha1")
      .update(store)
      .digest("hex");

    const directory = sha.substring(0, 2);
    const filename = sha.substring(2);

    const completePath = path.join(
      process.cwd(),
      ".git",
      "objectts",
      directory,
    );

    if (!fs.existsSync(completePath)) {
      fs.mkdirSync(completePath, { recursive: true });
    }

    const compressedData = require("zlib").deflateSync(store);
    fs.writeFileSync(path.join(completePath, filename), compressedData);

    process.stdout.write(`${sha}\n`);
  }
}

module.exports = CommitTreeCommand;
