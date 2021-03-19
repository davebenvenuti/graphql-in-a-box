export class Config {
  constructor({ workDir, databaseUrl }) {
    this.workDir = workDir;
    this.databaseUrl = databaseUrl;
  }

  toJSON() {
    const { workDir } = this;

    return {
      workDir
    };
  }
}
