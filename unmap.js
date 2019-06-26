#!/usr/bin/env node

const fs = require('fs-extra');
const {
  resolve
} = require('path');
const program = require('commander');
program
  .option('-p, --path <p>', 'input source map file')
  .option('-f, --filter <f>', 'filter out file names')
  .option('-o, --output <o>', 'output folder', './')
  .parse(process.argv);

fs.exists(program.output)
  .then(async exists => {
    if (!exists) {
      await fs.mkdir(program.output)
    }
    return fs.readFile(program.path)
  })
  .then(js => {
    js = JSON.parse(js.toString());
    const files = js.sources
      .map((path, idx) => ({
        path,
        idx
      }))
      .filter(({
          path
        }) =>
        program.filter ? path.includes(program.filter) : true
      )
      .map(({
          path,
          idx
        }) =>
        fs.outputFile(resolve(program.output, path), js.sourcesContent[idx])
      );
    return Promise.all(files);
  })
  .then(() => console.log(`${program.path} unpacked`));