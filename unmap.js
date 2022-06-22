#!/usr/bin/env node

import fs from "fs-extra";
import filenamify from "filenamify";
import os from "os";
import { resolve } from "path";
import { Command } from "commander";
const program = new Command();
const isWindows = os.platform() == "win32";

const opts = program
  .name("unmap")
  .requiredOption("-p, --path <p>", "Input source map file")
  .option("-f, --filter <f>", "Filter out file names")
  .option("-o, --output <o>", "Output folder", "./")
  .parse(process.argv)
  .opts();

fs.readFile(opts.path)
  .catch(async (e) => {
    if (e.errno == -13) {
      console.log("Insufficient permissions to read the input file.");
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
        const outpath = resolve(
          opts.output,
          isWindows ? filenamify(path) : path
        );
        return fs.outputFile(outpath, js.sourcesContent[idx]);
      });
    return Promise.all(files);
  })
  .then(() => console.log(`${opts.path} unpacked`));
