const fs = require("fs");
const path = require("path");
const GitClient = require("./git/client");

// You can use print statements as follows for debugging, they'll be visible when running tests.

const gitClient = new GitClient();
const {
  CatFileCommand,
  HashObjectCommand,
  LSTreeCommand,
  WriteTreeCommand,
} = require("./git/commands");

const command = process.argv[2];

switch (command) {
  case "init":
    handleGitInitCommand();
    break;
  case "cat-file":
    handleCatFileCommand();
    break;
  case "hash-object":
    handleHashObjectCommand();
    break;
  case "ls-tree":
    handleLSTreeCommand();
    break;
  case "write-tree":
    handleWriteTreeCommand();
    break;
  default:
    throw new Error(`Unknown command: ${command}`);
}

function handleGitInitCommand() {
  fs.mkdirSync(path.join(process.cwd(), ".git"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "objects"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(process.cwd(), ".git", "refs"), { recursive: true });

  fs.writeFileSync(
    path.join(process.cwd(), ".git", "HEAD"),
    "ref: refs/heads/main\n",
  );
  console.log("Initialized git directory");
}

function handleCatFileCommand() {
  const flag = process.argv[3];
  const sha = process.argv[4];
  const command = new CatFileCommand(flag, sha);
  gitClient.run(command);
}

function handleHashObjectCommand() {
  let flag = process.argv[3];
  let filepath = process.argv[4];
  if (!filepath) {
    filepath = flag;
    flag = null;
  }
  const command = new HashObjectCommand(flag, filepath);
  gitClient.run(command);
}

function handleLSTreeCommand() {
  const flag = process.argv[3];
  const sha = process.argv[4];
  if (!sha && flag === "--name-only") return;
  if (!sha) {
    sha = flag;
    flag = null;
  }
  const command = new LSTreeCommand(flag, sha);
  gitClient.run(command);
}

function handleWriteTreeCommand() {
  const command = new WriteTreeCommand();
  gitClient.run(command);
}
