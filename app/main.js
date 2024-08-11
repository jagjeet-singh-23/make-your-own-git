const fs = require("fs");
const path = require("path");
const GitClient = require("./git/client");

// You can use print statements as follows for debugging, they'll be visible when running tests.

const gitClient = new GitClient();

const { CatFileCommand } = require("./git/commands");

const command = process.argv[2];

switch (command) {
  case "init":
    createGitDirectory();
    break;
  case "cat-file":
    logObjectToConsole();
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}

function createGitDirectory() {
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

function logObjectToConsole() {
  const flag = process.argv[3];
  const sha = process.argv[4];
  const command = new CatFileCommand(flag, sha);
  gitClient.run(command);
}
