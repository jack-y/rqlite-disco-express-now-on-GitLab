/* Copyright (c) 2017 e-soa Jacques Desodt, MIT License */
'use strict'

// Prerequisites
const clusterFactory = require('./clusterfactory')

// Initializations
var store = {}

// Memory map
// Key = disco_id
// Value = cluster JSON string
store.map = {}

// Creates a new cluster
store.createCluster = function (options, fs) {
  return new Promise(function (resolve, reject) {
    // Generates the new cluster
    var cluster = clusterFactory.createCluster()
    // Saves the cluster
    store.save(options, cluster, fs)
    .then(function (result) { return resolve(result) })
    .catch(function (err) { return reject(err) })
  })
}

// Reads the data from the ID
store.read = function (options, id, fs) {
  return new Promise(function (resolve, reject) {
    // First, try to read in the memory map
    if (store.map[id]) {
      return resolve(store.map[id])
    } else {
      // If not in map, then reads on disk
      fs.readFile(store.getIdPath(options, id), options.encoding, (err, data) => {
        if (err) { return reject(err) }
        // ...and memorizes the data in the map
        store.map[id] = data
        return resolve(data)
      })
    }
  })
}

// Saves the cluster
store.save = function (options, cluster, fs) {
  return new Promise(function (resolve, reject) {
    const json = JSON.stringify(cluster)
    // Saves the cluster on disk
    fs.writeFile(store.getIdPath(options, cluster.disco_id),
      json, options.encoding, (err) => {
        if (err) { return reject(err) }
        // Updates the memory map
        store.map[cluster.disco_id] = json
        return resolve(cluster)
      })
  })
}

// Reads the data as cluster object from the ID
store.readAsCluster = function (options, id, fs) {
  return new Promise(function (resolve, reject) {
    // Reads the data on disk
    store.read(options, id, fs)
    .then(function (data) {
      // Converts the JSON value to an object
      try {
        let cluster = JSON.parse(data)
        return resolve(cluster)
      } catch (err) {
        // Bad JSON format
        return reject(err)
      }
    })
    .catch(function (err) { return reject(err) })
  })
}

// Adds a node and saves the cluster
store.addAndSave = function (options, node, cluster, fs) {
  return new Promise(function (resolve, reject) {
    // Adds the node
    if (clusterFactory.addNode(node, cluster)) {
      // Saves the cluster
      store.save(options, cluster, fs)
      .then(function (result) { return resolve(result) })
      .catch(function (err) { return reject(err) })
    } else {
      // The node is already set: no change to the cluster
      return resolve(cluster)
    }
  })
}

// Removes a node and saves the cluster
store.removeAndSave = function (options, node, cluster, fs) {
  return new Promise(function (resolve, reject) {
    // Removes the node
    if (clusterFactory.removeNode(node, cluster)) {
      // Saves the cluster
      store.save(options, cluster, fs)
      .then(function (result) { return resolve(result) })
      .catch(function (err) { return reject(err) })
    } else {
      // The node is already removed: no change to the cluster
      return resolve(cluster)
    }
  })
}

// Gets the file path from the ID
store.getIdPath = function (options, id) {
  var path = options.path.endsWith('/') ? options.path : options.path + '/'
  return path + id + '.json'
}

module.exports = store
