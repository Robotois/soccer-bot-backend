const mqtt = require('mqtt');
let client;
const tabletId = 'Tablet-01';
const botsTopic = 'bots/available';
const requestTopic = 'connection/request';
const resetTopic = 'connection/reset';

function tabletClient() {
  client = mqtt.connect('mqtt://localhost', { clientId: tabletId });
  client.on('connect', function () {
    client.subscribe(botsTopic);
    client.subscribe(`${requestTopic}/${tabletId}`);
    client.subscribe(`${resetTopic}/${tabletId}`);
  });

  client.on('message', function(topic, message) {
    // message is Buffer
    console.log({topic, msg: message.toString()});
  });

  setTimeout(() => {
    client.publish(requestTopic, JSON.stringify({ tabletId }));
  }, 5000);
}

module.exports = tabletClient;
