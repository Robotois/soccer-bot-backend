const mqtt = require('mqtt');
let client1;
let client2;
let client3;
const topic1 = "SoccerBots/SoccerBot-01";
const topic2 = "SoccerBots/SoccerBot-02";
const topic3 = "SoccerBots/SoccerBot-03";

function botClient() {
  client1 = mqtt.connect('mqtt://localhost', { clientId: 'SoccerBot-01' });
  client1.on('connect', function () {
    client1.subscribe(topic1);
  })
  client1.on('message', function(topic, message) {
    console.log(message.toString());
  });

  client2 = mqtt.connect('mqtt://localhost', { clientId: 'SoccerBot-02' });
  client2.on('connect', function () {
    client2.subscribe(topic2);
  })
  client2.on('message', function(topic, message) {
    console.log(message.toString());
  });

  client3 = mqtt.connect('mqtt://localhost', { clientId: 'SoccerBot-03' });
  client3.on('connect', function () {
    client3.subscribe(topic3);
  })
  client3.on('message', function(topic, message) {
    console.log(message.toString());
  });
}

module.exports = botClient;
