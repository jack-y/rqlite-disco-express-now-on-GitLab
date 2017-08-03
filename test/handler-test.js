/* Copyright (c) 2017 e-soa Jacques Desodt, MIT License */
'use strict'

// Prerequisites
const handler = require('../handler')
const events = require('events')

// Test prerequisites
const Code = require('code')
const Lab = require('lab')
const lab = (exports.lab = Lab.script())
const describe = lab.describe
const beforeEach = lab.beforeEach
const it = lab.it
const expect = Code.expect

// Mocks req and res
var req = new events.EventEmitter()

var res = {}
res.set = function (type, value) {}
res.status = function (value) {
  res.statusValue = value
  return res
}
res.json = function (response) {
  res.object = response
  return res
}

// Mocks the store
var jsonCluster = '{"foo": "bar"}'
var cluster = JSON.parse(jsonCluster)
var store = {}
var error = 'foo error'
store.createCluster = function (options, fs) {
  return new Promise(function (resolve, reject) {
    if (options) {
      return resolve(cluster)
    } else {
      return reject(error)
    }
  })
}
store.read = function (options, id, fs) {
  return new Promise(function (resolve, reject) {
    if (options) {
      return resolve(jsonCluster)
    } else {
      return reject(error)
    }
  })
}
store.readAsCluster = function (options, id, fs) {
  return new Promise(function (resolve, reject) {
    if (options) {
      cluster.disco_id = id
      return resolve(cluster)
    } else {
      return reject(error)
    }
  })
}
store.addAndSave = function (options, address, cluster, fs) {
  return new Promise(function (resolve, reject) {
    if (fs) {
      return resolve(cluster)
    } else {
      return reject(error)
    }
  })
}
store.removeAndSave = function (options, address, cluster, fs) {
  return new Promise(function (resolve, reject) {
    if (fs) {
      return resolve(cluster)
    } else {
      return reject(error)
    }
  })
}

// Mocks other variables
const fs = {}

describe('handler', function () {
  // Run before every single test
  beforeEach((fin) => {
    req = new events.EventEmitter()
    req.params = {}
    req.body = {}
    fin()
  })
  //
  it('get err 404', function (fin) {
    handler.get(false, store, fs, req, res)
    .then(function (result) {
      expect(result.statusValue).to.equal(404)
      expect(result.object.error.indexOf('does not exist') > -1).to.equal(true)
      fin()
    })
  })
  //
  it('get ok', function (fin) {
    handler.get(true, store, fs, req, res)
    .then(function (result) {
      expect(result.statusValue).to.equal(200)
      expect(result.object).to.equal(cluster)
      fin()
    })
  })
  //
  it('post new err 500', function (fin) {
    handler.postNew(false, store, fs, req, res)
    .then(function (result) {
      expect(result.statusValue).to.equal(500)
      expect(result.object.error.indexOf('Cannot create') > -1).to.equal(true)
      fin()
    })
  })
  //
  it('post new ok', function (fin) {
    handler.postNew(true, store, fs, req, res)
    .then(function (result) {
      expect(result.statusValue).to.equal(200)
      expect(result.object).to.equal(cluster)
      fin()
    })
  })
  //
  it('post err 500', function (fin) {
    req.params = {id: '123456'}
    handler.post(true, store, false, req, res)
    .then(function (result) {
      expect(result.statusValue).to.equal(500)
      expect(result.object.error.indexOf('Cannot update') > -1).to.equal(true)
      fin()
    })
    req.emit('data', '{"addr":"node"}')
    req.emit('end')
  })
  //
  it('post err 404', function (fin) {
    req.params = {}
    handler.post(false, store, fs, req, res)
    .then(function (result) {
      expect(result.statusValue).to.equal(404)
      expect(result.object.error.indexOf('does not exist') > -1).to.equal(true)
      fin()
    })
    req.emit('data', '{"addr":"node"}')
    req.emit('end')
  })
  //
  it('post err 400', function (fin) {
    req.params = {id: '123456'}
    handler.post(true, store, true, req, res)
    .then(function (result) {
      expect(result.statusValue).to.equal(400)
      expect(result.object.error.indexOf('address not specified') > -1).to.equal(true)
      fin()
    })
    req.emit('data', '')
    req.emit('end')
  })
  //
  it('post ok', function (fin) {
    req.params = {id: '123456'}
    handler.post(true, store, true, req, res)
    .then(function (result) {
      expect(result.statusValue).to.equal(200)
      expect(result.object).to.equal(cluster)
      fin()
    })
    req.emit('data', '{"addr":"node"}')
    req.emit('end')
  })
  //
  it('delete err 500', function (fin) {
    req.params = {id: '123456'}
    handler.delete(true, store, false, req, res)
    .then(function (result) {
      expect(result.statusValue).to.equal(500)
      expect(result.object.error.indexOf('Cannot update') > -1).to.equal(true)
      fin()
    })
    req.emit('data', '{"addr":"node"}')
    req.emit('end')
  })
  //
  it('delete err 404', function (fin) {
    handler.delete(false, store, fs, req, res)
    .then(function (result) {
      expect(result.statusValue).to.equal(404)
      expect(result.object.error.indexOf('does not exist') > -1).to.equal(true)
      fin()
    })
    req.emit('data', '{"addr":"node"}')
    req.emit('end')
  })
  //
  it('delete err 400', function (fin) {
    req.params = {id: '123456'}
    handler.delete(true, store, true, req, res)
    .then(function (result) {
      expect(result.statusValue).to.equal(400)
      expect(result.object.error.indexOf('address not specified') > -1).to.equal(true)
      fin()
    })
    req.emit('data', '')
    req.emit('end')
  })
  //
  it('delete ok', function (fin) {
    req.params = {id: '123456'}
    handler.delete(true, store, true, req, res)
    .then(function (result) {
      expect(result.statusValue).to.equal(200)
      expect(result.object).to.equal(cluster)
      fin()
    })
    req.emit('data', '{"addr":"node"}')
    req.emit('end')
  })
  //
  it('get address no arg', function (fin) {
    handler.getPostAddress(req)
    .catch(function (err) {
      expect(err.message.indexOf('address does not exist') > -1).to.equal(true)
      fin()
    })
    req.emit('data')
    req.emit('end')
  })
  //
  it('get address error', function (fin) {
    handler.getPostAddress(req)
    .catch(function (err) {
      expect(err.message.indexOf('address does not exist') > -1).to.equal(true)
      fin()
    })
    req.emit('data', '{"foo":"bar"}')
    req.emit('end')
  })
  //
  it('get address ok', function (fin) {
    var addr = 'node'
    handler.getPostAddress(req)
    .then(function (result) {
      expect(result).to.equal(addr)
      fin()
    })
    req.emit('data', '{"addr":"' + addr + '"}')
    req.emit('end')
  })
  //
  it('res ok', function (fin) {
    handler.ok(cluster, res)
    expect(res.statusValue).to.equal(200)
    expect(res.object).to.equal(cluster)
    fin()
  })
  //
  it('res bad request', function (fin) {
    handler.badRequest(error, res)
    expect(res.statusValue).to.equal(400)
    expect(res.object.error).to.equal(error)
    fin()
  })
  //
  it('res not found', function (fin) {
    handler.notFound(error, res)
    expect(res.statusValue).to.equal(404)
    expect(res.object.error).to.equal(error)
    fin()
  })
  //
  it('res method not allowed', function (fin) {
    handler.methodNotAllowed(error, res)
    expect(res.statusValue).to.equal(405)
    expect(res.object.error).to.equal(error)
    fin()
  })
  //
  it('res server error', function (fin) {
    handler.serverError(error, res, error)
    expect(res.statusValue).to.equal(500)
    expect(res.object.error).to.equal(error)
    fin()
  })
  //
})
