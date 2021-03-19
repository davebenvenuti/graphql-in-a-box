export class Config {
  constructor({ workDir }) {
    this.workDir = workDir;
  }

  toJSON() {
    const { workDir } = this;

    return {
      workDir
    };
  }
}
