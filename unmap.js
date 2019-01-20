#!/usr/bin/env node

const fs = require('fs-extra');
const { resolve } = require('path');
const program = require('commander');
program.option('-p, --path <p>', 'input map file');
program.option('-f, --filter <f>', 'filter');
program.option('-o, --output <o>', 'output folder').parse(process.argv);

console.log(program.path);
fs.readFile(program.path)
  .then(js => {
    js = JSON.parse(js.toString());
    const files = js.sources
      .map((path, idx) => ({ path, idx }))
      .filter(({ path }) =>
        program.filter ? path.includes(program.filter) : true
      )
      .map(({ path, idx }) =>
        fs.outputFile(resolve(program.output, path), js.sourcesContent[idx])
      );
    return Promise.all(files);
  })
  .then(console.log);
