![Logo-rqlite][]

> A simple Express-based RQLite Cluster Discovery Service.

# rqlite-disco-express

Last update: 08/04/2017

[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Dependency Status][david-badge]][david-url]
[![Coveralls][BadgeCoveralls]][Coveralls]

[RQLite][] is a lightweight, open-source **distributed** relational database, with SQLite as its storage engine. To form a RQLite cluster, the joining node must be supplied with the network address of some other node in the cluster.

To make all this easier, RQLite also supports *discovery* mode. In this mode each node registers its network address with an external service, and learns the *join* addresses of other nodes from the same service. As a convenience, a free Discovery Service for RQLite is hosted at `discovery.rqlite.com`.

If you need **your own Discovery Service** with Node.js, here it is!

# How it works

*rqlite-disco-express* is based on the [Express][] web framework. For more information on the RQLite clusters, see the [Cluster Guidelines][] and [Cluster Discovery Service][] docs.

## disco-url parameter

By default, the Discovery Service is hosted at `http://discovery.rqlite.com`. To use this *rqlite-disco-express* Service when starting a node, the  `disco-url` parameter must be set. The *start node* command pattern becomes:

```sh
rqlited -http-addr <node-ip>:<node-http-port> -raft-addr <node-ip>:<node-raft-port> -disco-id <cluster-disco-id> -disco-url <your-service-URL> <node-data-directory>
```

Example:

```sh
rqlited -http-addr localhost:4001 -raft-addr localhost:4002 -disco-id b3da7185-725f-461c-b7a4-13f185bd5007 -disco-url http://myhost:8090 ~/node.1
```

## File storage

For simplicity, this *rqlite-disco-express* Service uses a file-based storage for the cluster data. Each cluster is stored in a file named `<disco-id>.json`. The contents of this file are the JSON string of the cluster data. For performance, these files are uploaded in a memory map on the fly.

## Configuration

The configuration is written in the `./config/config.js` file.

### Express

- **protocol**: `http` or `https`. For SSL configuration, see below.
- **port**: the service port number.

### SSL
For more information on Express and SSL, please see [this post][].

- **key**: your private key. It is read from a file, default is `./config/privatekey.pem`.
- **cert**: your certificate. It is read from a file, default is `./config/certificate.pem`.
- **passphrase**: if necessary, the passphrase string.

### File storage

- **path**: the data files path on disk.
- **encoding**: the encoding used. `utf8` is a good example.

# Run the Service

To run this *rqlite-disco-express* Service, simply use node js:

```sh
node ./main.js
```

# Test

To test this *rqlite-disco-express* Service, simply use npm:

```sh
npm test
```

## License
Copyright (c) 2017 Jacques Desodt. Licensed under [MIT][]

[Logo-rqlite]: http://www.philipotoole.com/wp-content/uploads/2016/04/j.png
[npm-badge]: https://badge.fury.io/js/rqlite-disco-express.svg
[npm-url]: https://npmjs.com/package/rqlite-disco-express
[travis-badge]: https://travis-ci.org/jack-y/rqlite-disco-express.svg
[travis-url]: https://travis-ci.org/jack-y/rqlite-disco-express
[david-badge]: https://david-dm.org/jack-y/rqlite-disco-express.svg
[david-url]: https://david-dm.org/jack-y/rqlite-disco-express
[Coveralls]: https://coveralls.io/github/jack-y/rqlite-disco-express?branch=master
[BadgeCoveralls]: https://coveralls.io/repos/github/jack-y/rqlite-disco-express/badge.svg?branch=master
[Express]: http://expressjs.com/
[RQLite]: https://github.com/rqlite/rqlite
[Discovery Service]: https://github.com/rqlite/rqlite/blob/master/doc/DISCOVERY.md
[Cluster Discovery Service]: https://github.com/rqlite/rqlite/blob/master/doc/DISCOVERY.md
[Cluster Guidelines]: https://github.com/rqlite/rqlite/blob/master/doc/CLUSTER_MGMT.md
[this post]: https://aghassi.github.io/ssl-using-express-4/
[MIT]: ./LICENSE
