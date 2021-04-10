import { DataTypes, Sequelize } from 'sequelize';
import { sample } from 'lodash/fp';

const _sequelize = new Sequelize("sqlite::memory:", { logging: false });

const modelNames = [
  "car",
  "truck",
  "author",
  "user",
  "person",
  "fable",
  "story",
  "game",
  "tweet"
];

function generateModelName() {
  return sample(modelNames);
}

function generateAttributes() {
  return {
    name: DataTypes.STRING,
    description: DataTypes.STRING
  };
}

export async function makeModel(modelName, attributes) {
  if(!modelName) modelName = generateModelName();

  if(attributes) {
    attributes = { ...attributes };
  } else {
    attributes = generateAttributes();
  }


  attributes.id = { type: DataTypes.UUID, primaryKey: true, autoIncrement: false, defaultValue: Sequelize.UUIDV1 };

  const model = _sequelize.define(modelName, attributes);

  await _sequelize.sync();

  return model;
}