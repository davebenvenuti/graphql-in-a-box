import { gql } from 'apollo-server';
import { join } from 'path';
import { readFileSync } from 'fs';
import glob from 'glob';

export function readGraphQLFiles(path) {
  const entities = glob.sync(join(path, "**/*.graphql")).map((file) => {
    const contents = readFileSync(file);

    return gql`${contents}`;
  });

  return entities;
}
