import { Sequelize, DataTypes } from 'sequelize';
import { flow, entries, map, fromPairs, get, find, filter, compact, size } from 'lodash/fp';
import { logError } from '../../util';

const primitiveGraphqlTypes = ['String', 'Int', 'Float', 'Boolean', 'ID'];
const associationTypes = ['belongsTo', 'hasOne', 'hasMany']; // TODO: belongsToMany, hasAndBelongsToMany.  Need a way to define "through".

export function makeModels(objectTypeDefinitions) {
  const models = {};
  const allAssociations = {};
  const sequelize = sequelizeInstance();

  for(let modelName in objectTypeDefinitions) {
    const objectTypeDefinition = objectTypeDefinitions[modelName];

    validateFields(objectTypeDefinition); // Raises an exception if invalid

    const fields = translateFieldTypes(objectTypeDefinition);
    models[modelName] = sequelize.define(modelName, fields);

    const associations = determineAssociations(objectTypeDefinition);
    if(size(associations)) {
      allAssociations[modelName] = associations;
    }
  }

  for(let modelName in allAssociations) {
    for(let attribute in allAssociations[modelName]) {
      for(let associationType of associationTypes) {
        const otherModelName = get([modelName, attribute, associationType], allAssociations);
        const otherModel = models[otherModelName];

        if(otherModelName) {
          models[modelName][associationType](otherModel);
        }
      }
    }
  }

  return models;
}

function isPrimitive(fieldOrType) {
  const type = get('type', fieldOrType) || fieldOrType;

  return primitiveGraphqlTypes.includes(type);
}

function translateFieldTypes(objectTypeDefinition) {
  return flow(
    entries,
    map(([fieldName, definition]) => [fieldName, typeInfoForField(definition, fieldName == 'id')]),
    filter(([_, definition]) => !!definition),
    fromPairs
  )(objectTypeDefinition);
}

function validateFields(objectTypeDefinition) {
  for(let fieldName in objectTypeDefinition) {
    validateField(fieldName, objectTypeDefinition[fieldName]);
  }
}

function validateField(fieldName, field) {
  const { type, list } = field;

  if(isPrimitive(type)) return true;

  const associationType = associationTypeForField(field);

  if(!associationType) {
    throw new Error(`${fieldName}: Non-primitive data types require an association type (${associationTypes.join(", ")})`);
  } else if(list && !associationType.match(/Many$/)) {
    throw new Error(`${fieldName}: List type detected with non-Many association`);
  } else if(!list && !!associationType.match(/Many$/)) {
    throw new Error(`${fieldName}: Scalar type detected with Many association`);
  }

  return true;
}

function typeInfoForField(field, primaryKey = false) {
  const { type, list, disallowNull } = field;

  if(isPrimitive(type)) {
    if(list) {
      return { type: DataTypes.JSON, allowNull: !disallowNull, primaryKey };
    } else {
      return { type: translateFieldType(type), allowNull: !disallowNull, primaryKey };
    }
  } else {
    return null;
  }
}

function determineAssociations(objectTypeDefinition) {
  return flow(
    entries,
    map(([fieldName, definition]) => {
      const { type } = definition;
      const associationType = associationTypeForField(definition);

      if(associationType) {
        return [fieldName, { [associationType]: type }];
      } else {
        return null;
      }
    }),
    compact,
    fromPairs
  )(objectTypeDefinition);
}

function associationTypeForField(field) {
  return find((associationType) => field[associationType], associationTypes);
}

function translateFieldType(type) {
  switch(type) {
    case 'String':
      return DataTypes.STRING;
    case 'Int':
      return DataTypes.INTEGER;
    case 'Float':
      return DataTypes.FLOAT;
    case 'Boolean':
      return DataTypes.BOOLEAN;
    case 'ID':
      return DataTypes.UUID;
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

let _sequelizeInstance;

export function init(databaseUrl) {
  _sequelizeInstance = new Sequelize(databaseUrl, {
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

export function sequelizeInstance() {
  if(!_sequelizeInstance) {
    throw new Error("Initialize the database first");
  }

  return _sequelizeInstance;
}

export async function reset() {
  try {
    await _sequelizeInstance.close();
  } catch(err) {
    logError(error);
  } finally {
    _sequelizeInstance = null;
  }
}
