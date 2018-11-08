var mosca = require('mosca');
const botClient = require('./client/bot-client');
const tabletClient = require('./client/tablet-client');
const { addConnected, removeConnected } = require('./connection-manager');
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
  const { id, connection: { stream: { remoteAddress } } } = client;
  const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
  // console.log(remoteAddress);
  const ip = remoteAddress ? remoteAddress.match(ipRegex) : undefined;
  console.log('client connected', { id, ip: ip ? ip[0] : undefined });
  addConnected(id, ip ? ip[0] : undefined);
});

server.on('clientDisconnected', function(client) {
  console.log('client disconnected', client.id);
  removeConnected(client.id);
});

// fired when a message is received
// server.on('published', function(packet, client) {
//   console.log('Published', packet.topic, packet.payload.toString());
// });

// fired when the mqtt server is ready
function setup() {
  console.log('Mosca server is up and running');
  // botClient();
  // tabletClient();
}
