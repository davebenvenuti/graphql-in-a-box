import { gql } from 'apollo-server';

import { objectTypeDefinitionsFromGQLEntities } from '../src/models';

describe("models", () => {
  describe("objectTypeDefinitionsFromGQLEntities", () => {
    it("handles types consisting of standard scalar types", () => {
      const scalarEntity = gql`
        type MyScalarType {
          id: ID!
          requiredStringAttribute: String!
          requiredIntAttribute: Int!
          requiredFloatAttribute: Float!
          requiredBooleanAttribute: Boolean!
          optionalStringAttribute: String
          optionalIntAttribute: Int
          optionalFloatAttribute: Float
          optionalBooleanAttribute: Boolean
        }
      `;

      const definitions = objectTypeDefinitionsFromGQLEntities([scalarEntity]);

      expect(definitions).toBeTruthy();

      const definition = definitions.MyScalarType;

      expect(definition).toBeTruthy();

      [
        ['requiredStringAttribute', 'String'],
        ['requiredIntAttribute', 'Int'],
        ['requiredFloatAttribute', 'Float'],
        ['requiredBooleanAttribute', 'Boolean']
      ].forEach(([field, expectedType]) => {
        const details = definition[field];

        expect(details).toBeTruthy();
        expect(details.name).toEqual(field);
        expect(details.disallowNull).toEqual(true);
        expect(details.type).toEqual(expectedType);
        expect(details.list).toBeFalsy();
      });

      [
        ['optionalStringAttribute', 'String'],
        ['optionalIntAttribute', 'Int'],
        ['optionalFloatAttribute', 'Float'],
        ['optionalBooleanAttribute', 'Boolean']
      ].forEach(([field, expectedType]) => {
        const details = definition[field];

        expect(details).toBeTruthy();
        expect(details.name).toEqual(field);
        expect(details.disallowNull).toBeFalsy();
        expect(details.type).toEqual(expectedType);
        expect(details.list).toBeFalsy();
      });
    });

    it("handles types consisting of standard list types", () => {
      const listEntity = gql`
        type MyListType {
          id: ID!
          requiredListOfStrings: [String]!
          requiredListOfInts: [Int]!
          requiredListOfFloats: [Float]!
          requiredListOfBooleans: [Boolean]!
          optionalListOfStrings: [String]
          optionalListOfInts: [Int]
          optionalListOfFloats: [Float]
          optionalListOfBooleans: [Boolean]
        }
      `;

      const definitions = objectTypeDefinitionsFromGQLEntities([listEntity]);

      expect(definitions).toBeTruthy();

      const definition = definitions.MyListType;

      expect(definition).toBeTruthy();

      [
        ['requiredListOfStrings', 'String'],
        ['requiredListOfInts', 'Int'],
        ['requiredListOfFloats', 'Float'],
        ['requiredListOfBooleans', 'Boolean']
      ].forEach(([field, expectedType]) => {
        const details = definition[field];

        expect(details).toBeTruthy();
        expect(details.name).toEqual(field);
        expect(details.disallowNull).toEqual(true);
        expect(details.type).toEqual(expectedType);
        expect(details.list).toEqual(true);
      });

      [
        ['optionalListOfStrings', 'String'],
        ['optionalListOfInts', 'Int'],
        ['optionalListOfFloats', 'Float'],
        ['optionalListOfBooleans', 'Boolean']
      ].forEach(([field, expectedType]) => {
        const details = definition[field];

        expect(details).toBeTruthy();
        expect(details.name).toEqual(field);
        expect(details.disallowNull).toBeFalsy();
        expect(details.type).toEqual(expectedType);
        expect(details.list).toEqual(true);
      });
    });

    it("handles types consisting of scalar fields of other custom types", () => {
      const scalarEntityWithCustomType = gql`
        type Thing {
          id: ID!
          stringAttribute: String
        }

        type MyScalarTypeWithCustomTypes {
          id: ID!
          requiredThing: Thing!
          optionalThing: Thing
        }
      `;

      const definitions = objectTypeDefinitionsFromGQLEntities([scalarEntityWithCustomType]);

      expect(definitions).toBeTruthy();

      const thingDefinition = definitions.Thing;

      expect(thingDefinition).toBeTruthy();

      [
        ['id', 'ID'],
        ['stringAttribute', 'String']
      ].forEach(([field, expectedType]) => {
        const details = thingDefinition[field];

        expect(details).toBeTruthy();
        expect(details.name).toEqual(field);
        expect(details.type).toEqual(expectedType);
      });

      const definition = definitions.MyScalarTypeWithCustomTypes;

      expect(definition).toBeTruthy();

      [
        ['requiredThing', 'Thing'],
      ].forEach(([field, expectedType]) => {
        const details = definition[field];

        expect(details).toBeTruthy();
        expect(details.name).toEqual(field);
        expect(details.disallowNull).toEqual(true);
        expect(details.type).toEqual(expectedType);
        expect(details.list).toBeFalsy();
      });

      [
        ['optionalThing', 'Thing'],
      ].forEach(([field, expectedType]) => {
        const details = definition[field];

        expect(details).toBeTruthy();
        expect(details.name).toEqual(field);
        expect(details.disallowNull).toBeFalsy();
        expect(details.type).toEqual(expectedType);
        expect(details.list).toBeFalsy();
      });
    });

    it("handles types consisting of list fields of other custom types", () => {
      const listEntityWithCustomTypes = gql`
        type Thing {
          id: ID!
          stringAttribute: String
        }

        type MyListTypeWithCustomTypes {
          id: ID!

          """hasMany"""
          requiredThings: [Thing]!

          """belongsToMany"""
          optionalThings: [Thing]
        }
      `;

      const definitions = objectTypeDefinitionsFromGQLEntities([listEntityWithCustomTypes]);

      expect(definitions).toBeTruthy();

      const thingDefinition = definitions.Thing;

      expect(thingDefinition).toBeTruthy();

      [
        ['id', 'ID'],
        ['stringAttribute', 'String']
      ].forEach(([field, expectedType]) => {
        const details = thingDefinition[field];

        expect(details).toBeTruthy();
        expect(details.name).toEqual(field);
        expect(details.type).toEqual(expectedType);
      });

      const definition = definitions.MyListTypeWithCustomTypes;

      expect(definition).toBeTruthy();

      [
        ['requiredThings', 'Thing'],
      ].forEach(([field, expectedType]) => {
        const details = definition[field];

        expect(details).toBeTruthy();
        expect(details.name).toEqual(field);
        expect(details.disallowNull).toEqual(true);
        expect(details.type).toEqual(expectedType);
        expect(details.list).toEqual(true);
        expect(details.hasMany).toEqual(true);
      });

      [
        ['optionalThings', 'Thing'],
      ].forEach(([field, expectedType]) => {
        const details = definition[field];

        expect(details).toBeTruthy();
        expect(details.name).toEqual(field);
        expect(details.disallowNull).toBeFalsy();
        expect(details.type).toEqual(expectedType);
        expect(details.list).toEqual(true);
        expect(details.belongsToMany).toEqual(true);
      });
    });
  });
});
