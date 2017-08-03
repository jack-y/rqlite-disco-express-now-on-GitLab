/* Copyright (c) 2017 e-soa Jacques Desodt, MIT License */
'use strict'

// Prerequisites
const fs = require('fs')

var config = {}

// The express web app
config.protocol = 'http' // http or https
config.port = 8090

// The SSL options
// See: https://aghassi.github.io/ssl-using-express-4/
config.key = fs.readFileSync('./config/privatekey.pem')
config.cert = fs.readFileSync('./config/certificate.pem')
config.passphrase = ''

// The file storage options
config.path = './data'
config.encoding = 'utf8'

// Exports configuration
module.exports = config
