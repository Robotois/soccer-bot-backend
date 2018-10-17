const WebSocket = require('ws');

const ws = new WebSocket('ws://192.168.15.8:81');
let counter = 0;
ws.on('open', function open() {
  setInterval(() => {
    ws.send(JSON.stringify({ x: 0.240, y: 0.565, r: 0.35, led: '#5A2F5F', kick: 1 }));
    counter += 1;
  }, 100);
});

ws.on('message', function incoming(data) {
  console.log(data);
});
