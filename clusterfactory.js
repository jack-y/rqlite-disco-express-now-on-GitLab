/* Copyright (c) 2017 e-soa Jacques Desodt, MIT License */
'use strict'

// Prerequisites
const moment = require('moment')
const uuid = require('uuid/v1')

// Initializations
var clusterFactory = {}

// Creates a new cluster
clusterFactory.createCluster = function () {
  return clusterFactory.getCluster(new Date(), uuid(), [])
}

// Adds a node
// Returns true if the node was actually added
clusterFactory.addNode = function (node, cluster) {
  if (cluster.nodes.indexOf(node) === -1) {
    cluster.nodes.push(node)
    return true
  }
  return false
}

// Removes a node
// Returns true if the node was actually removed
clusterFactory.removeNode = function (node, cluster) {
  if (cluster.nodes.indexOf(node) > -1) {
    cluster.nodes.splice(cluster.nodes.indexOf(node), 1)
    return true
  }
  return false
}

// Serializes the data as JSON
// See: https://github.com/rqlite/rqlite/blob/master/doc/DISCOVERY.md#example
clusterFactory.getCluster = function (date, id, nodes) {
  return {
    'created_at': moment(date).format('YYYY-MM-DD HH:mm:ss.SSSSSS'),
    'disco_id': id,
    'nodes': nodes
  }
}

module.exports = clusterFactory
