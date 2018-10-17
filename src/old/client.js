function runClient() {
  var mqtt = require('mqtt');
  var client = mqtt.connect('mqtt://localhost');
  const topic = "SoccerBots/tablet-01/soccerBot-01/drive";

  client.on('connect', function () {
    setInterval(() => {
      client.publish(
        'SoccerBots/tablet-01/soccerBot-01/drive',
        JSON.stringify({ x: 0.240, y: 0.565, r: 0.35, led: '#5A2F5F', kick: 1 })
      );
    }, 3000);
    // let fl = 0;
    // setInterval(() => {
    //   client.publish(
    //     topic,
    //     fl == 0 ? '0.0,0.0,1' : '0.0,0.0,-1'
    //   );
    //   fl = fl == 0 ? 1 : 0;
    // }, 3000);
  })


  // client.on('message', function(topic, message) {
  //   // message is Buffer
  //   console.log(message.toString());
  //   client.end();
  // });
}

module.exports = runClient;
