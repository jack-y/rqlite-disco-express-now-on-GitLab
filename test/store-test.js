/* Copyright (c) 2017 e-soa Jacques Desodt, MIT License */
'use strict'

// Prerequisites
const clusterFactory = require('../clusterfactory')
const fs = require('fs-extra')
const store = require('../store')
const uuid = require('uuid/v1')

// Test prerequisites
const Code = require('code')
const Lab = require('lab')
const lab = (exports.lab = Lab.script())
const describe = lab.describe
const before = lab.before
const after = lab.after
const it = lab.it
const expect = Code.expect

// Global variables
const options = {
  path: './test/data',
  encoding: 'utf8'
}
const badOptions = {
  path: '/really/bad_bad_bad_path',
  encoding: 'utf8'
}

describe('store', function () {
  //
  before((fin) => {
    // Creates the temporary file storage directory
    fs.ensureDir(options.path)
    .then(function () {
      fin()
    })
  })
  after((fin) => {
    // Removes the temporary file storage directory
    fs.remove(options.path)
    .then(function () {
      fin()
    })
  })
  //
  it('create cluster in bad path', function (fin) {
    store.createCluster(badOptions, fs)
    .catch(function (err) {
      expect(err.message.indexOf('no such file or directory') > -1).to.equal(true)
      fin()
    })
  })
  //
  it('create cluster ok', function (fin) {
    store.createCluster(options, fs)
    .then(function (cluster) {
      fs.readFile(store.getIdPath(options, cluster.disco_id),
        options.encoding, (err, data) => { // eslint-disable-line
          expect(data).to.equal(JSON.stringify(cluster))
          fin()
        })
    })
  })
  //
  it('read cluster file from bad path', function (fin) {
    store.read(badOptions, 'an id', fs)
    .catch(function (err) {
      expect(err.message.indexOf('no such file or directory') > -1).to.equal(true)
      fin()
    })
  })
  //
  it('read unknown cluster file', function (fin) {
    store.read(options, 'this-id-does-not-exist', fs)
    .catch(function (err) {
      expect(err.message.indexOf('no such file or directory') > -1).to.equal(true)
      fin()
    })
  })
  //
  it('read known cluster file', function (fin) {
    const id = uuid()
    const content = 'test'
    const path = store.getIdPath(options, id)
    fs.writeFile(path, content, options.encoding, (err) => { // eslint-disable-line
      store.read(options, id, fs)
      .then(function (data) {
        expect(data).to.equal(content)
        expect(store.map[id]).to.equal(content)
        fin()
      })
    })
  })
  //
  it('read from map', function (fin) {
    const id = uuid()
    const content = 'test'
    store.map[id] = content
    store.read({}, id, fs)
    .then(function (data) {
      expect(data).to.equal(content)
      fin()
    })
  })
  //
  it('save cluster in bad path', function (fin) {
    const cluster = {'disco_id': uuid()}
    store.save(badOptions, cluster, fs)
    .catch(function (err) {
      expect(err.message.indexOf('no such file or directory') > -1).to.equal(true)
      fin()
    })
  })
  //
  it('save cluster', function (fin) {
    const cluster = {'disco_id': uuid()}
    store.save(options, cluster, fs)
    .then(function (result) {
      expect(result).to.equal(cluster)
      fin()
    })
  })
  //
  it('read cluster no arg', function (fin) {
    const id = uuid()
    const content = 'This is not JSON.'
    const path = store.getIdPath(options, id)
    fs.writeFile(path, content, options.encoding, (err) => { // eslint-disable-line
      store.readAsCluster(null, id, fs)
      .catch(function (err) {
        expect(err.message.indexOf('Cannot read property') > -1).to.equal(true)
        fin()
      })
    })
  })
  //
  it('read cluster from bad json', function (fin) {
    const id = uuid()
    const content = 'This is not JSON.'
    const path = store.getIdPath(options, id)
    fs.writeFile(path, content, options.encoding, (err) => { // eslint-disable-line
      store.readAsCluster(options, id, fs)
      .catch(function (err) {
        expect(err.message.indexOf('Unexpected token') > -1).to.equal(true)
        fin()
      })
    })
  })
  //
  it('read cluster from json ok', function (fin) {
    const cluster = clusterFactory.createCluster()
    const path = store.getIdPath(options, cluster.disco_id)
    fs.writeFile(path, JSON.stringify(cluster), options.encoding, (err) => { // eslint-disable-line
      store.readAsCluster(options, cluster.disco_id, fs)
      .then(function (result) {
        expect(result).to.equal(cluster)
        fin()
      })
    })
  })
  //
  it('add a node and save no arg', function (fin) {
    const cluster = clusterFactory.createCluster()
    const node = 'node1'
    store.addAndSave(null, node, cluster, fs)
    .catch(function (err) {
      expect(err.message.indexOf('Cannot read property') > -1).to.equal(true)
      fin()
    })
  })
  //
  it('add a node and save', function (fin) {
    const cluster = clusterFactory.createCluster()
    const node = 'node1'
    store.addAndSave(options, node, cluster, fs)
    .then(function (result) {
      expect(result.nodes.length).to.equal(1)
      expect(result.nodes[0]).to.equal(node)
      fin()
    })
  })
  //
  it('add the same node once again', function (fin) {
    const cluster = clusterFactory.createCluster()
    const node = 'node'
    store.addAndSave(options, node, cluster, fs)
    .then(function (result) {
      expect(result.nodes.length).to.equal(1)
      expect(result.nodes[0]).to.equal(node)
      store.addAndSave(options, node, cluster, fs)
      .then(function (result2) {
        expect(result2.nodes.length).to.equal(1)
        expect(result2.nodes[0]).to.equal(node)
        fin()
      })
    })
  })
  //
  it('remove a node and save no arg', function (fin) {
    const cluster = clusterFactory.createCluster()
    const node = 'node1'
    cluster.nodes.push(node)
    store.removeAndSave(null, node, cluster, fs)
    .catch(function (err) {
      expect(err.message.indexOf('Cannot read property') > -1).to.equal(true)
      fin()
    })
  })
  //
  it('remove a node and save', function (fin) {
    var cluster = clusterFactory.createCluster()
    const node = 'node'
    cluster.nodes.push(node)
    store.removeAndSave(options, node, cluster, fs)
    .then(function (result) {
      expect(result.nodes.length).to.equal(0)
      fin()
    })
  })
  //
  it('remove the same node once again', function (fin) {
    var cluster = clusterFactory.createCluster()
    const node1 = 'node1'
    const node2 = 'node2'
    cluster.nodes.push(node1)
    cluster.nodes.push(node2)
    store.removeAndSave(options, node1, cluster, fs)
    .then(function (result) {
      expect(result.nodes.length).to.equal(1)
      expect(result.nodes[0]).to.equal(node2)
      store.removeAndSave(options, node1, cluster, fs)
      .then(function (result2) {
        expect(result2.nodes.length).to.equal(1)
        expect(result2.nodes[0]).to.equal(node2)
        fin()
      })
    })
  })
  //
  it('get id path from config not ending with /', function (fin) {
    const options = {
      path: 'foo'
    }
    const id = uuid()
    const result = store.getIdPath(options, id)
    expect(result).to.equal(options.path + '/' + id + '.json')
    fin()
  })
  //
  it('get id path from config ending with /', function (fin) {
    const options = {
      path: 'foo/'
    }
    const id = uuid()
    const result = store.getIdPath(options, id)
    expect(result).to.equal(options.path + id + '.json')
    fin()
  })
  //
})
