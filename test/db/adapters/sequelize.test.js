import { init, sequelizeInstance, makeModels, pluralNameForModel } from '../../../src/db/adapters/sequelize';
import { makeModel } from '../../helpers';

async function expectGeneratedId(model, attributes) {
  const instance = await model.create(attributes);

  expect(instance.id).toBeTruthy();
}

describe("db/adapters/sequelize", () => {
  describe("initialization and singleton instance", () => {
    describe("sequelizeInstance()", () => {
      it("raises an exception if the singleton was never initialized", () => {
        expect(() => sequelizeInstance()).toThrow(/initialize the database first/i);

        init("sqlite::memory:");

        const instance = sequelizeInstance();

        expect(instance).toBeTruthy();
      });
    });
  });

  describe("makeModels()", () => {
    it("constructs models that properly auto-generate uuids", async () => {
      const objectTypeDefinitions = {
        Person: {
          id: { type: 'ID', disallowNull: true },
          name: { type: 'String', disallowNull: true },
          age: { type: 'Int' },
          weight: { type: 'Float' },
          alive: { type: 'Boolean', disallowNull: true }
        }
      };

      const { Person } = makeModels(objectTypeDefinitions);

      await sequelizeInstance().sync();

      await expectGeneratedId(Person, { name: "someone", alive: true });
    });

    it("constructs models with scalar primitive types", async () => {
      const objectTypeDefinitions = {
        Person: {
          id: { type: 'ID', disallowNull: true },
          name: { type: 'String', disallowNull: true },
          age: { type: 'Int' },
          weight: { type: 'Float' },
          alive: { type: 'Boolean', disallowNull: true }
        },
        Car: {
          id: { type: 'ID', disallowNull: true },
          make: { type: 'String' },
          model: { type: 'String' },
          year: { type: 'Int' }
        }
      };

      const { Person, Car } = makeModels(objectTypeDefinitions);

      expect(Person).toBeTruthy();

      [['id', 'UUID', false, true],
        ['name', 'STRING', false, false],
        ['age', 'INTEGER', true, false],
        ['weight', 'FLOAT', true, false],
        ['alive', 'BOOLEAN', false, false]
      ].forEach(([attributeName, type, allowNull, primaryKey]) => {
        const attribute = Person.tableAttributes[attributeName];

        expect(attribute).toBeTruthy();
        expect(attribute.type.__proto__.key).toEqual(type);
        expect(attribute.allowNull).toEqual(allowNull);
        expect(attribute.primaryKey).toEqual(primaryKey);
      });

      expect(Car).toBeTruthy();

      [['id', 'UUID', false, true],
        ['make', 'STRING', true, false],
        ['model', 'STRING', true, false],
        ['year', 'INTEGER', true, false]
      ].forEach(([attributeName, type, allowNull, primaryKey]) => {
        const attribute = Car.tableAttributes[attributeName];

        expect(attribute).toBeTruthy();
        expect(attribute.type.__proto__.key).toEqual(type);
        expect(attribute.allowNull).toEqual(allowNull);
        expect(attribute.primaryKey).toEqual(primaryKey);
      });
    });

    it("constructs models with array scalar types", () => {
      const objectTypeDefinitions = {
        LotteryTicket: {
          id: { type: 'ID', disallowNull: true },
          name: { type: 'String', disallowNull: true },
          winningNumbers: { type: 'Int', disallowNull: true, list: true }
        }
      };

      const { LotteryTicket } = makeModels(objectTypeDefinitions);

      expect(LotteryTicket).toBeTruthy();

      [['id', 'UUID', false, true],
        ['name', 'STRING', false, false],
        ['winningNumbers', 'JSON', false, false]
      ].forEach(([attributeName, type, allowNull, primaryKey]) => {
        const attribute = LotteryTicket.tableAttributes[attributeName];

        expect(attribute).toBeTruthy();
        expect(attribute.type.__proto__.key).toEqual(type);
        expect(attribute.allowNull).toEqual(allowNull);
        expect(attribute.primaryKey).toEqual(primaryKey);
      });
    });

    describe("with attributes with custom types", () => {
      it("requires an association", () => {
        const objectTypeDefinitions = {
          Book: {
            id: { type: 'ID', disallowNull: true, },
            name: { type: 'String', disallowNull: true },
            author: { type: 'Author' }
          },
          Author: {
            id: { type: 'ID', disallowNull: true },
            name: { type: 'String', disallowNull: true }
          }
        };

        expect(() => makeModels(objectTypeDefinitions)).toThrow(/non-primitive data types require an association type/i);
      });

      it("handles a hasOne relationship", () => {
        const objectTypeDefinitions = {
          Book: {
            id: { type: 'ID', disallowNull: true, },
            name: { type: 'String', disallowNull: true },
            author: { type: 'Author', hasOne: true }
          },
          Author: {
            id: { type: 'ID', disallowNull: true },
            name: { type: 'String', disallowNull: true }
          }
        };

        const { Book } = makeModels(objectTypeDefinitions);

        expect(Book).toBeTruthy();
        expect(Book.associations.Author.associationType).toEqual("HasOne");
      });

      it("handles a belongsTo relationship", () => {
        const objectTypeDefinitions = {
          Book: {
            id: { type: 'ID', disallowNull: true, },
            name: { type: 'String', disallowNull: true },
            author: { type: 'Author', hasOne: true }
          },
          Author: {
            id: { type: 'ID', disallowNull: true },
            name: { type: 'String', disallowNull: true },
            book: { type: 'Book', belongsTo: true }
          }
        };

        const { Author } = makeModels(objectTypeDefinitions);

        expect(Author).toBeTruthy();
        expect(Author.associations.Book.associationType).toEqual("BelongsTo");
      });

      it("handles a hasMany relationship", () => {
        const objectTypeDefinitions = {
          Book: {
            id: { type: 'ID', disallowNull: true, },
            name: { type: 'String', disallowNull: true },
            authors: { type: 'Author', list: true, hasMany: true }
          },
          Author: {
            id: { type: 'ID', disallowNull: true },
            name: { type: 'String', disallowNull: true }
          }
        };

        const { Book } = makeModels(objectTypeDefinitions);

        expect(Book).toBeTruthy();
        expect(Book.associations.Authors.associationType).toEqual("HasMany");
      });

      it("requires a hasMany relationship to be a list", () => {
        const objectTypeDefinitions = {
          Book: {
            id: { type: 'ID', disallowNull: true, },
            name: { type: 'String', disallowNull: true },
            authors: { type: 'Author', hasMany: true }
          },
          Author: {
            id: { type: 'ID', disallowNull: true },
            name: { type: 'String', disallowNull: true }
          }
        };

        expect(() => makeModels(objectTypeDefinitions)).toThrow(/scalar type detected with many association/i);
      });

      it("requires a hasOne relationship not to be a list", () => {
        const objectTypeDefinitions = {
          Book: {
            id: { type: 'ID', disallowNull: true, },
            name: { type: 'String', disallowNull: true },
            author: { type: 'Author', hasOne: true, list: true }
          },
          Author: {
            id: { type: 'ID', disallowNull: true },
            name: { type: 'String', disallowNull: true }
          }
        };

        expect(() => makeModels(objectTypeDefinitions)).toThrow(/list type detected with non-many association/i);
      });

     it("requires a belongsTo relationship not to be a list", () => {
        const objectTypeDefinitions = {
          Book: {
            id: { type: 'ID', disallowNull: true, },
            name: { type: 'String', disallowNull: true },
            author: { type: 'Author', hasOne: true }
          },
          Author: {
            id: { type: 'ID', disallowNull: true },
            name: { type: 'String', disallowNull: true },
            book: { type: 'Book', belongsTo: true, list: true }
          }
        };

        expect(() => makeModels(objectTypeDefinitions)).toThrow(/list type detected with non-many association/i);
      });
    });
  });

  describe("pluralNameForModel()", () => {
    it("returns the plural name for a model", async () => {
      const User = await makeModel("user");

      expect(pluralNameForModel(User)).toEqual("users");

      const Person = await makeModel("person");

      expect(pluralNameForModel(Person)).toEqual("people");
    })
  });
});