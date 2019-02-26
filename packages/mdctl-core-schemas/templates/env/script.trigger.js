const Base = require('./script'),
      { sortKeys } = require('mdctl-core-utils')

class Template extends Base {

  constructor(name) {
    super('trigger', name)
  }

  getBoilerplate() {

    return sortKeys(Object.assign(
      super.getBoilerplate(),
      {

      }
    ))

  }

}

module.exports = Template
