const { assert } = require('chai'),
      fs = require('fs'),
      path = require('path'),
      glob = require('glob'),
      pump = require('pump'),
      rimraf = require('rimraf'),
      ndjson = require('ndjson'),
      _ = require('lodash'),
      { ExportStream, ImportStream } = require('../../src/lib/stream'),
      { ExportFileAdapter } = require('../../src/lib/stream/adapters/file_adapter')

describe('Export Adapter', () => {

  let blob = null

  beforeEach(() => {
    blob = fs.createReadStream(`${process.cwd()}/test/data/blob.ndjson`)
  })

  afterEach(() => {
    blob = null
  })

  it('export using file adapter with default layout', (done) => {
    const tempDir = path.join(process.cwd(), `output-${new Date().getTime()}`),
          stream = ndjson.parse(),
          format = 'yaml',
          streamWriter = new ExportStream(stream, { format }),
          onEnd = (error) => {
            if (error) {
              rimraf.sync(tempDir)
              done(error)
            }
            glob('**/*.{yaml,js,png,jpeg,ico,gif,html,txt}', { cwd: tempDir }, (err, files) => {
              rimraf.sync(tempDir)
              if (err) {
                done(err)
              } else {
                assert(files.length === 120, 'there are some missing files created')
                done()
              }
            })
          }

    pump(blob, stream, streamWriter, new ExportFileAdapter(tempDir, { format }), onEnd)
  })

  it('export using file adapter with single blob layout', (done) => {
    const tempDir = path.join(process.cwd(), `output-${new Date().getTime()}`),
          stream = ndjson.parse(),
          format = 'yaml',
          streamWriter = new ExportStream({ format }),
          onEnd = (error) => {
            if (error) {
              rimraf.sync(tempDir)
              done(error)
            }
            glob('**/*.{yaml,js,png,jpeg,ico,gif,html,txt}', { cwd: tempDir }, (err, files) => {
              rimraf.sync(tempDir)
              if (err) {
                done(err)
              } else {
                assert(files.length === 75, 'there are more/less files than created')
                done()
              }
            })
          }
    pump(blob, stream, streamWriter, new ExportFileAdapter(tempDir, { format, layout: 'blob' }), onEnd)
  })

})

describe('Import Adapters', () => {

  let blob = null

  beforeEach(() => {
    blob = fs.createReadStream(`${process.cwd()}/test/data/blob.ndjson`)
  })

  afterEach(() => {
    blob = null
  })


  it('testing import adapter', (done) => {

    const tempDir = path.join(process.cwd(), `output-${new Date().getTime()}`),
          stream = ndjson.parse(),
          format = 'yaml',
          streamWriter = new ExportStream(stream, { format }),
          onEnd = async(error) => {
            if (error) {
              rimraf.sync(tempDir)
              done(error)
            }
            const importAdapter = new ImportStream(tempDir, format),
                  ndStream = ndjson.stringify(),
                  items = []

            ndStream.on('data', line => items.push(line))
            pump(importAdapter, ndStream, () => {
              rimraf.sync(tempDir)
              const loadedItems = _.map(items, i => JSON.parse(i)),
                    blobItems = _.filter(loadedItems, i => i.data && i.streamId),
                    otherItems = _.filter(loadedItems, i => !i.data && !i.streamId)
              assert(otherItems.length === 46, 'there are more/less files than loaded')
              assert(blobItems.length === 15, 'there are more/less blob items than loaded')
              done()
            })
            // call this in order to trigger end event or declare a data listener
            ndStream.resume()
          }

    pump(blob, stream, streamWriter, new ExportFileAdapter(tempDir, { format }), onEnd)
  })

})