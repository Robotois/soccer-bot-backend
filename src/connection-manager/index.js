const mqtt = require('mqtt');

let bots = [];
let tablets = [];
let availableBots = [];
let connections = [{tabletId: 'Tablet-01', botId: 'SoccerBot-01'}];
const client = mqtt.connect('mqtt://localhost', { clientId: 'conn-manager' });
const botsTopic = 'bots/available';
const requestTopic = 'connection/request';
const resetTopic = 'connection/reset';

const addConnected = (clientId) => {
  switch (true) {
    case clientId.includes('SoccerBot'):
      if(bots.findIndex(bot => bot === clientId) === -1) {
        bots.push(clientId);
      }
      if(connections.findIndex(conn => conn.botId === clientId) === -1) {
        availableBots.push(clientId);
      }
      break;
    case clientId.includes('Tablet'):
      if(tablets.findIndex(tablet => tablet === clientId) === -1) {
        tablets.push(clientId);
      }
      break;
    default:
  }
};

const removeConnected = (clientId) => {
  switch (true) {
    case clientId.includes('SoccerBot'):
      bots = bots.filter(bot => bot !== clientId);
      availableBots = availableBots.filter(bot => bot !== clientId);
      break;
    case clientId.includes('Tablet'):
      tablets = tablets.filter(tablet => tablet !== clientId);
      break;
    default:
  }
};

const getConnection = (connObj) => {
  const { tabletId, botId } = connObj;
  // request for active connection,
  if (botId == undefined) {
    // if there is an active connection it will send it
    const myConn = connections.find(conn => conn.tabletId === tabletId);
    if (myConn) {
      client.publish(`${requestTopic}/${tabletId}`, JSON.stringify(myConn));
    } else { // No active connection stored.
      client.publish(`${requestTopic}/${tabletId}`, JSON.stringify({ tabletId }));
    }
    return;
  }
  // request for a new connection with a SoccerBot
  // if SoccerBot not available
  if (availableBots.findIndex(item => item === botId) === -1) {
    client.publish(`${requestTopic}/${tabletId}`, JSON.stringify({ tabletId }));
    return;
  }
  // remove SoccerBot from available
  availableBots = availableBots.filter(item => item !== botId);
  connections = connections.filter(conn => conn.tabletId !== tabletId);
  connections.push(connObj);
  client.publish(`${requestTopic}/${tabletId}`, JSON.stringify(connObj));
}

const resetConnection = ({ tabletId }) => {
  const myConn = connections.find(conn => conn.tabletId === tabletId);
  if(myConn) {
    connections.filter(conn => conn.tabletId !== tabletId);
    availableBots.push(myConn.botId);
  }
}

client.on('message', function (topic, message) {
  // message is Buffer
  const msgObj = JSON.parse(message.toString());
  console.log(msgObj);
  switch (topic) {
    case requestTopic:
      getConnection(msgObj);
      break;
    case resetTopic:
      resetConnection(msgObj);
      break;
    default:
  }
});

const sendAvailable = () => {
  client.publish(botsTopic, JSON.stringify({ availableBots }));
}

client.on('connect', () => {
  client.subscribe(requestTopic);
  client.subscribe(resetTopic);
  setInterval(() => {
    sendAvailable();
  }, 3000);
});

module.exports = {
  addConnected,
  removeConnected,
}
