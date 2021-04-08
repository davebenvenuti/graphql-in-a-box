import { nameForModel, pluralNameForModel } from '../src/db/adapters/sequelize';
import { makeModel } from './helpers';
import { makeQueryResolvers } from '../src/queries';
import { isFunction } from 'lodash/fp';

describe("queries", () => {
  describe("makeQueryResolvers", () => {
    it("returns get and index resolvers", async () => {
      const User = await makeModel("user");

      const users = [
        await User.create({ name: "some person" }),
        await User.create({ name: "some other person" })
      ];

      const resolvers = makeQueryResolvers({ User }, nameForModel, pluralNameForModel);

      expect(resolvers.user).toBeTruthy();
      expect(isFunction(resolvers.user)).toEqual(true);
      const fetchedUser = await resolvers.user(null, { id: users[0].id });
      expect(fetchedUser.id).toEqual(users[0].id);
      expect(fetchedUser.name).toEqual(users[0].name);

      expect(resolvers.users).toBeTruthy();
      expect(isFunction(resolvers.users)).toEqual(true);
    })
  });
});