import { flow, map, fromPairs, flattenDepth, omit, toPairs } from "lodash/fp";

const operations = ['create', 'update', 'delete'];

export function makeMutationResolvers(models) {
  const mutationName = (operation, capitalizedName) => `${operation}${capitalizedName}`;

  return flow(
    toPairs,
    map(([capitalizedName, model]) => (
      map((operation) => (
        [mutationName(operation, capitalizedName), mutationForModel[operation](model)]
      ), operations)
    )),
    flattenDepth(1),
    fromPairs
  )(models);
}

const mutationForModel = {
  create: createForModel,
  update: updateForModel,
  delete: deleteForModel
};

function createForModel(model) {
  return async (_parent, attributes) => {
    const object = await model.create(attributes);

    return object ? object.toJSON() : null;
  };
}

function updateForModel(model) {
  return async (_parent, attributes) => {
    const { id } = attributes;
    const instance = await model.findOne({ where: { id } });

    await instance.update(omit('id', attributes));

    return instance.toJSON();
  };
}

function deleteForModel(model) {
  return async (_parent, { id }) => {
    const instance = await model.findOne({ where: { id } });

    await instance.destroy();

    return instance.toJSON();
  }
}
