const mqtt = require('mqtt');
let client;
const tabletId = 'Tablet-01';
const botsTopic = 'bots/available';
const connectionsTopic = 'connections';

function tabletClient() {
  client = mqtt.connect('mqtt://localhost', { clientId: tabletId });
  client.on('connect', function () {
    client.subscribe(botsTopic);
    client.subscribe(`${connectionsTopic}/${tabletId}`);
    setInterval(() => {
      client.publish('SoccerBots/SoccerBot-01', JSON.stringify({
        x: 0,
        y: 0,
        r: 0,
        k: 1,
        l: '',
      }));
    }, 5000);
  });

  client.on('message', function(topic, message) {
    // message is Buffer
    console.log(topic, message.toString());
  });

  // setTimeout(() => {
  //   client.publish(connectionsTopic, JSON.stringify({ action: 'request', tabletId }));
  // }, 5000);
  // setTimeout(() => {
  //   client.publish(connectionsTopic, JSON.stringify({ action: 'reset', tabletId }));
  // }, 10000);
  // setTimeout(() => {
  //   client.publish(connectionsTopic, JSON.stringify({ action: 'request', tabletId }));
  // }, 15000);
}

module.exports = tabletClient;
