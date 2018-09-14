#!/usr/bin/env node

const inquirer = require("inquirer");
const fs = require("fs");

const QUESTIONS = [
  {
    name: "which-directory",
    type: "input",
    message: "Do you want a new directory (Yes/No):",
    validate: function(input) {
      if (/^(?:Yes|No)$/.test(input) || /^(?:yes|no)$/.test(input)) return true;
      else return "Enter either Yes or No";
    }
  },
  {
    name: "project-name",
    type: "input",
    message: "Project name:",
    validate: function(input) {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else
        return "Project name may only include letters, numbers, underscores and hashes.";
    }
  }
];

const CURR_DIR = process.cwd();

inquirer.prompt(QUESTIONS).then(answers => {
  const currentDirectory = answers["which-directory"];
  const projectName = answers["project-name"];
  const templatePath = `${__dirname}/templates/`;
  let projectPath = "";
  if (/^(?:No|no)$/.test(currentDirectory)) projectPath = CURR_DIR;
  else {
    projectPath = `${CURR_DIR}/${projectName}`;
    fs.mkdirSync(projectPath);
  }

  projectPath !== ""
    ? createDirectoryContents(templatePath, projectPath)
    : null;
  fs.writeFileSync(
    projectPath + "/package.json",
    JSON.stringify(pkg(projectName), null, 2),
    "utf8"
  );
});

function createDirectoryContents(templatePath, newProjectPath) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach(file => {
    const origFilePath = `${templatePath}/${file}`;

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      const contents = fs.readFileSync(origFilePath, "utf8");

      if (file === ".npmignore") file = ".gitignore";

      const writePath = `${newProjectPath}/${file}`;
      fs.writeFileSync(writePath, contents, "utf8");
    } else if (stats.isDirectory()) {
      fs.mkdirSync(`${newProjectPath}/${file}`);

      // recursive call
      createDirectoryContents(
        `${templatePath}/${file}`,
        `${newProjectPath}/${file}`
      );
    }
  });
}

const pkg = name => ({
  name: name,
  version: "0.0.0",
  private: true,
  main: "index.js",
  scripts: {
    start: "nodemon"
  },
  dependencies: {
    cors: "^2.8.4",
    express: "^4.16.3",
    helmet: "^3.13.0",
    morgan: "^1.9.1"
  },
  devDependencies: {
    nodemon: "^1.18.4"
  }
});
