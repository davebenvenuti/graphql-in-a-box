import { createConfigFromArgs } from './cli';
import { readGraphQLFiles } from './graphql-file-reader';

import { objectTypeDefinitionsFromGQLEntities } from './models';
// TODO: We probably shouldn't be importing directly from the adapter here.
import { makeModels } from './db/adapters/sequelize';

export async function init() {
  const config = await createConfigFromArgs();
  const { workDir } = config;

  const gqlEntities = readGraphQLFiles(workDir);
  const objectTypeDefinitions = objectTypeDefinitionsFromGQLEntities(gqlEntities);

  const models = makeModels(objectTypeDefinitions);
}

init();
