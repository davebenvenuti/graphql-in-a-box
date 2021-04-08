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
  return async (_parent, { id }) => await model.findOne({ where: { id }});
}

function indexForModel(model) {
  return async () => await model.findAll()();
}