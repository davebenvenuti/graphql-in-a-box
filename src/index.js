import { createConfigFromArgs } from './cli';
import { readGraphQLFiles } from './graphql-file-reader';

export async function init() {
  const config = await createConfigFromArgs();
  const { workDir } = config;

  const gqlEntities = readGraphQLFiles(workDir);
}

init();
