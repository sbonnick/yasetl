
class Processor {
  constructor () {
    this.description = {
      name:           "processor",
      description:    "Base Processor. Does no actions on its own",
      inputHint:      String,
      outputHint:     String,
      configuration:  {}
    }
  }

  async describe() {
    return this.description;
  }

  async process(input, configuration) {
    return input
  }
}

module.exports = Processor