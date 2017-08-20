'use strict'

var client1 = require('redis').createClient(6379, 'redis1.example.com')
var client2 = require('redis').createClient(6379, 'redis2.example.com')
var client3 = require('redis').createClient(6379, 'redis3.example.com')
var Redlock = require('redlock')

module.exports = new Redlock(
	// you should have one client for each redis node
	// in your cluster
  [client1, client2, client3],

  {
		// the expected clock drift; for more details
		// see http://redis.io/topics/distlock
    driftFactor: 0.01, // time in ms

		// the max number of times Redlock will attempt
		// to lock a resource before erroring
    retryCount: 10,

		// the time in ms between attempts
    retryDelay: 200, // time in ms

		// the max time in ms randomly added to retries
		// to improve performance under high contention
		// see https://www.awsarchitectureblog.com/2015/03/backoff.html
    retryJitter: 200 // time in ms
  }
)
