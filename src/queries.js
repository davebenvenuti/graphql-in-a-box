import { flow, map, fromPairs, flattenDepth } from 'lodash/fp';

export function makeQueryResolvers(models, nameForModel, pluralNameForModel) {
  return flow(
    map((model) => [
      [nameForModel(model), getForModel(model)],
      [pluralNameForModel(model), indexForModel(model)]
    ]),
    flattenDepth(1),
    fromPairs
  )(models);
}

function getForModel(model) {
  return async (_parent, { id }) => {
    const object = await model.findOne({ where: { id }});

    return object ? object.toJSON() : null;
  };
}

function indexForModel(model) {
  return async () => {
    const objects = await model.findAll();

    return map((object) => object.toJSON(), objects);
  };
}