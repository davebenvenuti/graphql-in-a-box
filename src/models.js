import { flatten, map, get, fromPairs, flow, filter } from 'lodash/fp';

function modelClassName(definition) {
  return get('name.value', definition);
}

function fields(definition) {
  return flow(
    get('fields'),
    filter(({ kind }) => kind == "FieldDefinition"),
    map((field) => {
      const name = get('name.value', field);
      const description = get('description.value', field);

      const association = inferAssociation(description);

      const fieldInfo = combinedTypes(field);

      if(association) {
        fieldInfo[association] = true;
      }

      return [name, fieldInfo];
    }),
    fromPairs
  )(definition);
}

function inferAssociation(description) {
  if(!description) return null;

  if(description.match(/belongsToMany/)) return 'belongsToMany';
  if(description.match(/belongsTo/)) return 'belongsTo';
  if(description.match(/hasMany/)) return 'hasMany';
  if(description.match(/hasOne/)) return 'hasOne';

  return null;
}

function combinedTypes(fieldOrSubtype) {
  if(!fieldOrSubtype) return null;

  const { type, kind, name } = fieldOrSubtype;

  const combined = {};

  switch(kind) {
    case "FieldDefinition":
      combined.name = name.value;
      break;
    case "NonNullType":
      combined.disallowNull = true;
      break;
    case "Name":
    case "NamedType":
      combined.type = name.value;
      break;
    case "ListType":
      combined.list = true;
      break;
  }

  if(type) {
    const combinedSubTypes = combinedTypes(type);

    for(let prop in combinedSubTypes) {
      combined[prop] = combinedSubTypes[prop];
    }
  }

  return combined;
}

function definitionsFromGQLEntities(gqlEntities) {
  return flow(
    map(get('definitions')),
    flatten
  )(gqlEntities);
}

export function objectTypeDefinitionsFromGQLEntities(gqlEntities) {
  return flow(
    definitionsFromGQLEntities,
    map((definition) => [modelClassName(definition), fields(definition)]),
    fromPairs
  )(gqlEntities);
}
