const { privatesAccessor } = require('@medable/mdctl-core-utils/privates'),
      _ = require('lodash'),
      ndjson = require('ndjson'),
      path = require('path'),
      pump = require('pump')


class Driver {

  constructor(client, options = {}) {
    Object.assign(privatesAccessor(this), {
      client,
      options
    })
  }

  get requestOptions() {
    return privatesAccessor(this, 'options')
  }

  get client() {
    const client = privatesAccessor(this, 'client')
    /* if (!client && isNodejs()) {
      await this.loadDefaultClient()
    }
    const cl = client || privatesAccessor(this, 'client') */
    if (!client) {
      throw new Error('There is no client set')
    }
    return client
  }

  buildUrl(name, op) {
    return path.join('/', name, 'db', op)
  }

  async cursor(stream, objectName, options = {}) {
    const json = ndjson.parse(),
          reqOptions = Object.assign(_.clone(this.requestOptions), {
            body: options, // JSON.stringify(options),
            method: 'post',
            stream: json,
            requestOptions: {
              json: true,
              headers: { accept: 'application/x-ndjson' }
            }
          }),
          result = await this.client.call(this.buildUrl(objectName, 'cursor'), reqOptions)
    return pump(result, stream)
  }

  async bulk(objectName, options) {
    return this.client.post(this.buildUrl(objectName, 'bulk'), options, this.requestOptions)
  }

  async count(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'count'), options, this.requestOptions)
  }

  async list(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'cursor'), options, this.requestOptions)
  }

  async push(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'push'), options, this.requestOptions)
  }

  async deleteOne(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'deleteOne'), options, this.requestOptions)
  }

  async deleteMany(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'deleteMany'), options, this.requestOptions)
  }

  async update(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'update'), options, this.requestOptions)
  }

  async patch(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'patch'), options, this.requestOptions)
  }

  async readOne(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'readOne'), options, this.requestOptions)
  }

  async updateOne(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'updateOne'), options, this.requestOptions)
  }

  async updateMany(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'updateMany'), options, this.requestOptions)
  }

  async insertOne(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'insertOne'), options, this.requestOptions)
  }

  async insertMany(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'insertMany'), options, this.requestOptions)
  }

  async patchOne(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'patchOne'), options, this.requestOptions)
  }

  async patchMany(objectName, options = {}) {
    return this.client.post(this.buildUrl(objectName, 'patchMany'), options, this.requestOptions)
  }

}

module.exports = Driver
