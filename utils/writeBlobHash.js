const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

export const writeBlobHash = (filepath, writeFileHash) => {
  // 1. Ensure tthat the filepath exists
  const filepath = path.resolve(filepath);
  if (!fs.existsSync(filepath)) {
    throw new Error(`could not open '${filepath}': No such file or directory`);
  }
  // 2. Read the file contents
  const fileContents = fs.readFileSync(filepath);
  const fileLength = fileContents.length;

  // 3. Create a blob object
  const header = `blob ${fileLength}\0`;
  const blob = Buffer.concat([Buffer.from(header), fileContents]);

  // 4. Calculate the hash
  const sha1 = crypto.createHash("sha1").update(blob).digest("hex");

  if (!writeFileHash) {
    return sha1;
  }

  const directory = sha1.slice(0, 2);
  const filename = sha1.slice(2);

  const completeDirectoryPath = path.join(
    process.cwd(),
    ".git",
    "objects",
    directory,
  );

  if (!fs.existsSync(completeDirectoryPath)) {
    fs.mkdirSync(completeDirectoryPath, { recursive: true });
  }

  const compressedFileContents = zlib.deflateSync(blob);
  fs.writeFileSync(
    path.join(completeDirectoryPath, filename),
    compressedFileContents,
  );
  return sha1;
};
