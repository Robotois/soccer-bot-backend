function runClient() {
  var mqtt = require('mqtt')
  var client  = mqtt.connect('mqtt://localhost')

  // client.on('connect', function () {
  //   // setInterval(() => {
  //   //   client.publish(
  //   //     'SoccerBots/tablet-01/soccerBot-01/drive',
  //   //     JSON.stringify({ x: 0.24, y: 0.56, rotation: 0.76 })
  //   //   );
  //   // }, 3000);
  // })

  client.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString())
    client.end()
  })
}

module.exports = runClient;
