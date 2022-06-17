#!/usr/bin/env node

const fs = require("fs-extra");
const { resolve } = require("path");
const { Command } = require("commander");
const program = new Command();

const opts = program
  .name("unmap")
  .requiredOption("-p, --path <p>", "input source map file")
  .option("-f, --filter <f>", "filter out file names")
  .option("-o, --output <o>", "output folder", "./")
  .parse(process.argv)
  .opts();

fs.readFile(opts.path)
  .catch(async (e) => {
    if (e.errno == -13) {
      console.log("Insufficient permissions to read the tnput file.");
    }
    if (e.errno == -2) {
      console.log("Input file does not exists.");
    }
    process.exit(1);
  })
  .then((js) => {
    js = JSON.parse(js.toString());

    const files = js.sources
      .filter((path) => (opts.filter ? path.includes(opts.filter) : true))
      .map((path, idx) => {
        const outpath = resolve(opts.output, path);
        return fs.outputFile(outpath, js.sourcesContent[idx]);
      });
    return Promise.all(files);
  })
  .then(() => console.log(`${opts.path} unpacked`));
