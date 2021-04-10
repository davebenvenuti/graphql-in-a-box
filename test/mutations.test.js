import { makeModel } from './helpers';
import { isFunction } from 'lodash/fp';
import { makeMutationResolvers } from '../src/mutations';
import { Sequelize, SequelizeValidationError } from 'sequelize';
import { fromPairs, map, flow, get } from 'lodash/fp';

function isValidationError(error) {
  return error instanceof SequelizeValidationError;
}

function validationErrorToJSON(error) {
  return flow(
    get('errors'),
    map((error) => [error.path, error.message]),
    fromPairs
  )(error);
}

describe("mutations", () => {
  describe("makeMutationResolvers", () => {
    let User;
    let mutationResolvers;

    beforeEach(async () => {
      User = await makeModel("user", { name: { type: Sequelize.STRING, allowNull: false }, description: Sequelize.STRING });
      mutationResolvers = await makeMutationResolvers({ User }, isValidationError);
    });

    describe("create", () => {
      it("returns a resolver that creates model instances", async () => {
        const { createUser } = mutationResolvers;

        expect(isFunction(createUser)).toBe(true);

        const userResponse = await createUser(null, { name: "me", description: "the description" });

        expect(userResponse).toBeTruthy();
        expect(userResponse.id).toBeTruthy();
        expect(userResponse.name).toEqual("me");
        expect(userResponse.description).toEqual("the description");

        const fetchedUser = await User.findOne({ where: { id: userResponse.id }});

        expect(fetchedUser).toBeTruthy();
      });
    });

    describe("update", () => {
      it("returns a resolver that updates model instances", async () => {
        const { updateUser } = mutationResolvers;

        expect(isFunction(updateUser)).toBe(true);

        const user = await User.create({ name: "me", description: "the description" });

        const userResponse = await updateUser(null, { id: user.id, description: "new description" });

        expect(userResponse).toBeTruthy();
        expect(userResponse.description).toEqual("new description");

        const fetchedUser = await User.findOne({ where: { id: user.id }});

        expect(fetchedUser).toBeTruthy();
        expect(fetchedUser.description).toEqual("new description");
        expect(fetchedUser.name).toEqual("me");
      });
    });

    describe("delete", () => {
      it("returns a working resolver", async () => {
        const { deleteUser } = mutationResolvers;

        expect(isFunction(deleteUser)).toBe(true);

        const user = await User.create({ name: "me", description: "the description" });

        const userResponse = await deleteUser(null, { id: user.id });

        expect(userResponse).toBeTruthy();

        const fetchedUser = await User.findOne({ where: { id: user.id }});

        expect(fetchedUser).toBeFalsy();
      });
    });
  });
});