import { createConfigFromArgs } from '../src/cli';

describe("cli", () => {
  describe("createConfigFromArgs", () => {
    describe("workDir", () => {
      it("parses a passed-in workDir", async () => {
        const workDir = "/tmp";

        const config = await createConfigFromArgs([workDir])

        expect(config.workDir).toEqual(workDir);
      });

      it("defaults workDir to the current working directory", async () => {
        const config = await createConfigFromArgs();

        expect(config.workDir).toEqual(process.cwd());
      });
    });

    describe("databaseUrl", () => {
      it("parses a passed-in databaseUrl", async () => {
        const databaseUrl = "postgres://user:pass@example.com:5432/dbname";

        const config = await createConfigFromArgs(["-d", databaseUrl]);

        expect(config.databaseUrl).toEqual(databaseUrl);
      });

      it("defaults databaseUrl to an in-memory sqlite database", async () => {
        const config = await createConfigFromArgs();

        expect(config.databaseUrl).toEqual("sqlite::memory:")
      });
    });
  });
});
