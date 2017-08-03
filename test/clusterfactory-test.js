/* Copyright (c) 2017 e-soa Jacques Desodt, MIT License */
'use strict'

// Prerequisites
const clusterFactory = require('../clusterfactory')

// Test prerequisites
const Code = require('code')
const Lab = require('lab')
var lab = (exports.lab = Lab.script())
var describe = lab.describe
var it = lab.it
var expect = Code.expect

describe('cluster factory', function () {
  //
  it('create cluster', function (fin) {
    const cluster = clusterFactory.createCluster()
    expect(cluster.created_at).to.exist()
    expect(cluster.disco_id).to.exist()
    expect(cluster.nodes).to.equal([])
    fin()
  })
  //
  it('add node on bad object', function (fin) {
    try {
      clusterFactory.addNode('a node', 'Oops! Not a cluster') // Must fire an error
      // This line should never be reached
      throw new Error('Test failed')
    } catch (err) {
      expect(err.message.indexOf('Cannot read property') > -1).to.equal(true)
      fin()
    }
  })
  //
  it('add new node', function (fin) {
    var cluster = clusterFactory.createCluster()
    const node = 'a node'
    const added = clusterFactory.addNode(node, cluster)
    expect(added).to.equal(true)
    expect(cluster.nodes.length).to.equal(1)
    expect(cluster.nodes[0]).to.equal(node)
    fin()
  })
  //
  it('add the same node once again', function (fin) {
    var cluster = clusterFactory.createCluster()
    const node = 'a node'
    clusterFactory.addNode(node, cluster)
    // Retry
    const added = clusterFactory.addNode(node, cluster)
    expect(added).to.equal(false)
    expect(cluster.nodes.length).to.equal(1)
    expect(cluster.nodes[0]).to.equal(node)
    fin()
  })
  //
  it('remove node on bad object', function (fin) {
    try {
      clusterFactory.removeNode('a node', 'Oops! Not a cluster') // Must fire an error
      // This line should never be reached
      throw new Error('Test failed')
    } catch (err) {
      expect(err.message.indexOf('Cannot read property') > -1).to.equal(true)
      fin()
    }
  })
  //
  it('remove node empty array', function (fin) {
    var cluster = clusterFactory.createCluster()
    const removed = clusterFactory.removeNode('node', cluster)
    expect(removed).to.equal(false)
    expect(cluster.nodes.length).to.equal(0)
    fin()
  })
  //
  it('remove unknown node', function (fin) {
    var cluster = clusterFactory.createCluster()
    const node1 = 'node 1'
    const added = clusterFactory.addNode(node1, cluster)
    expect(added).to.equal(true)
    const removed = clusterFactory.removeNode('node 2', cluster)
    expect(removed).to.equal(false)
    expect(cluster.nodes.length).to.equal(1)
    expect(cluster.nodes[0]).to.equal(node1)
    fin()
  })
  //
  it('remove a known node', function (fin) {
    var cluster = clusterFactory.createCluster()
    const node = 'a node'
    clusterFactory.addNode('node 1', cluster)
    clusterFactory.addNode(node, cluster)
    clusterFactory.addNode('node 3', cluster)
    expect(cluster.nodes.length).to.equal(3)
    const removed = clusterFactory.removeNode(node, cluster)
    expect(removed).to.equal(true)
    expect(cluster.nodes.length).to.equal(2)
    fin()
  })
  //
  it('remove the same node once again', function (fin) {
    var cluster = clusterFactory.createCluster()
    const node = 'a node'
    clusterFactory.addNode('node 1', cluster)
    clusterFactory.addNode(node, cluster)
    clusterFactory.addNode('node 3', cluster)
    expect(cluster.nodes.length).to.equal(3)
    var removed = clusterFactory.removeNode(node, cluster)
    expect(removed).to.equal(true)
    expect(cluster.nodes.length).to.equal(2)
    // Retry
    removed = clusterFactory.removeNode(node, cluster)
    expect(removed).to.equal(false)
    expect(cluster.nodes.length).to.equal(2)
    fin()
  })
  //
})
