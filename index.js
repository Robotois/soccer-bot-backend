var mosca = require('mosca');
const client = require('./client');
const redis = require('redis');

var ascoltatore = {
  type: 'redis',
  redis: redis,
  db: 12,
  port: 6379,
  return_buffers: true, // to handle binary payloads
  host: 'localhost',
};

var moscaSettings = {
  port: 1883,
  backend: ascoltatore,
  persistence: {
    factory: mosca.persistence.Redis,
  },
  http: {
    port: 1884,
    bundle: true,
    static: './',
  },
};

var server = new mosca.Server(moscaSettings);
server.on('ready', setup);

server.on('clientConnected', function(client) {
  console.log('client connected', client.id);
});

// fired when a message is received
server.on('published', function(packet, client) {
  const payloadString = packet.payload.toString();
  if(payloadString === '{ x: 0.000, y: 0.000, r: 0, led: 0 , kick: 0}') {
    return;
  }
  console.log('Published', packet.topic, packet.payload.toString());
});

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
  client();
}
