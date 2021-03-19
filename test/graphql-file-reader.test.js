import { resolve, join } from 'path';

import { readGraphQLFiles } from '../src/graphql-file-reader';

function findDefinition(documents, definitionKind, definitionName) {
  for(let document of documents) {
    const match = document.definitions.find(({ kind, name }) => kind == definitionKind && name.value == definitionName);

    if(match) return match;
  }

  return null;
}

expect.extend({
  toContainDefinition(documents, kind, name) {
    const pass = !!findDefinition(documents, kind, name);

    return {
      pass,
      message: () => pass ? null : `Missing ${kind} called "${name}"`
    }
  }
});

describe('graphql-file-reader', () => {
  describe('readGraphQLFiles', () => {
    it('creates gql objects from all files in a directory', () => {
      const path = resolve(join(__dirname, '/fixtures'));

      const entities = readGraphQLFiles(path);

      expect(entities).toBeTruthy();

      const documents = entities.filter(({ kind }) => kind == 'Document');

      const expected = {
        'EnumTypeDefinition': ['Subject'],
        'InterfaceTypeDefinition': ['Readable'],
        'ObjectTypeDefinition': ['Novel', 'TextBook', 'Article', 'Magazine', 'Author', 'Query']
      };

      for(let kind in expected) {
        for(let name of expected[kind]) {
          expect(documents).toContainDefinition(kind, name);
        }
      }
    });
  });
});
