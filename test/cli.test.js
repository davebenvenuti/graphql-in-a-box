import { createConfigFromArgs } from '../src/cli';

describe("cli", () => {
  describe("createConfigFromArgs", () => {
    it("returns a workDir", async () => {
      const workDir = "/tmp";

      const config = await createConfigFromArgs([workDir])

      expect(config.workDir).toEqual(workDir);
    });

    it("defaults workDir to the current working directory", async () => {
      const config = await createConfigFromArgs();

      expect(config.workDir).toEqual(process.cwd());
    });
  });
});
