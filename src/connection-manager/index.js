const mqtt = require('mqtt');

let bots = [];
let tablets = [];
let availableBots = [];
let connections = [];
const client = mqtt.connect('mqtt://localhost', { clientId: 'conn-manager' });
const botsTopic = 'bots/available';

const connectionsTopic = 'connections';
const REQUEST_ACTION = 'request';
const RESET_ACTION = 'reset';

const addConnected = (clientId) => {
  switch (true) {
    case clientId.includes('SoccerBot'):
      if(bots.findIndex(bot => bot === clientId) === -1) {
        bots.push(clientId);
      }
      if(connections.findIndex(conn => conn.botId === clientId) === -1) {
        availableBots.push({ botId: clientId });
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
      availableBots = availableBots.filter(bot => bot.botId !== clientId);
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
      client.publish(`${connectionsTopic}/${tabletId}`, JSON.stringify(myConn));
    } else { // No active connection stored.
      client.publish(`${connectionsTopic}/${tabletId}`, JSON.stringify({ tabletId }));
    }
    return;
  }
  // request for a new connection with a SoccerBot
  // if SoccerBot not available
  if (availableBots.findIndex(item => item.botId === botId) === -1) {
    client.publish(`${connectionsTopic}/${tabletId}`, JSON.stringify({ tabletId }));
    return;
  }
  // remove SoccerBot from available
  availableBots = availableBots.filter(item => item.botId !== botId);
  connections = connections.filter(conn => conn.tabletId !== tabletId);
  connections.push(connObj);
  client.publish(`${connectionsTopic}/${tabletId}`, JSON.stringify(connObj));
}

const resetConnection = (connObj) => {
  const { tabletId } = connObj;
  const myConn = connections.find(conn => conn.tabletId === tabletId);
  if(myConn) {
    connections = connections.filter(conn => conn.tabletId !== tabletId);
    availableBots.push({ botId: myConn.botId });
    client.publish(`${connectionsTopic}/${tabletId}`, JSON.stringify(connObj));
  }
}

client.on('message', function (topic, message) {
  // message is Buffer
  const msgObj = JSON.parse(message.toString());
  console.log(msgObj);
  switch (msgObj.action) {
    case REQUEST_ACTION:
      getConnection(msgObj);
      break;
    case RESET_ACTION:
      resetConnection(msgObj);
      break;
    default:
  }
});

const sendAvailable = () => {
  client.publish(botsTopic, JSON.stringify({ availableBots }));
}

client.on('connect', () => {
  client.subscribe(connectionsTopic);
  setInterval(() => {
    sendAvailable();
  }, 3000);
});

module.exports = {
  addConnected,
  removeConnected,
}
