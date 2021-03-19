import { Command } from 'commander';
import { resolve } from 'path';
import { cwd } from 'process';

import { Config } from './config';

import packageJSON from '../package.json'

const { version } = packageJSON;

function workDirOrDefault(workDir) {
  if(workDir) {
    return resolve(workDir);
  } else {
    return cwd();
  }
}

export async function createConfigFromArgs(args) {
  // args will default to process.argv
  const program = new Command();
  let config;

  program
    .version(version)
    .arguments('[workDir]', 'working directory, defaults to the current directory')
    .action((workDir) => {
      config = new Config({ workDir: workDirOrDefault(workDir) });
    });

  await (args ? program.parseAsync(args, { from: 'user' }) : program.parseAsync());

  return config;
}
