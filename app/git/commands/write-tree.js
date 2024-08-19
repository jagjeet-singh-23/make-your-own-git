const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const zlib = require("zlib");
const { writeBlobHash } = require("../../../utils/writeBlobHash");

class WriteTreeCommand {
  constructor() {}
  execute() {
    function recursiveCreateTree(basePath) {
      // iteratively read all files and directories in the current directory
      // if the current item is a file, hash it and write it to the objects directory
      // if the current item is a directory, recursively call this

      const results = [];
      const items = fs.readdirSync(basePath);

      for (const item of items) {
        if (item.includes(".git")) continue;

        const fullPath = path.join(basePath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isFile()) {
          const sha = writeBlobHash(fullPath, true);
          results.push({
            mode: "100644",
            basename: path.basename(fullPath),
            sha,
          });
        } else if (stat.isDirectory()) {
          const sha = recursiveCreateTree(fullPath);
          if (sha) {
            results.push({
              mode: "40000",
              basename: path.basename(fullPath),
              sha,
            });
          }
        }
      }

      if (items.length === 0 || results.length === 0) return null;

      const treeData = results.reduce((acc, current) => {
        const { mode, basename, sha } = current;
        return Buffer.concat([
          acc,
          Buffer.from(`${mode} ${basename}\0`),
          Buffer.from(sha, "hex"),
        ]);
      }, Buffer.alloc[0]);

      const tree = Buffer.concat([
        Buffer.from(`tree ${treeData.length}\0`),
        treeData,
      ]);

      const treeHash = crypto.createHash("sha1").update(tree).digest("hex");

      const directory = treeHash.slice(0, 2);
      const file = treeHash.slice(2);

      const completeTreePath = path.join(
        process.cwd(),
        ".git",
        "objects",
        directory,
      );

      if (!fs.existsSync(completeTreePath)) {
        fs.mkdirSync(completeTreePath, { recursive: true });
      }

      const compressed = zlib.deflateSync(treeHash);
      fs.writeFileSync(path.join(directory, file), compressed);

      return treeHash;
    }

    const sha = recursiveCreateTree(process.cwd());
    process.stdout.write(sha);
  }
}

module.exports = WriteTreeCommand;
