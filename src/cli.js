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
    .option('-d, --databaseUrl <databaseUrl>', 'Database URL, defaults to an in-memory SQLite database', 'sqlite::memory:')
    .action(async (workDir, options) => {
      config = new Config({
        workDir: workDirOrDefault(workDir),
        databaseUrl: options.databaseUrl
      });
    });

  const commanderArguments = args ? [args, { from: 'user' }] : [];

  await program.parseAsync(...commanderArguments);

  return config;
}
