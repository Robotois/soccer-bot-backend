const mqtt = require('mqtt');
const ping = require('ping');

let bots = [];
let tablets = [];
let availableBots = [];
let connections = [];
const client = mqtt.connect('mqtt://localhost', { clientId: 'conn-manager' });
const botsTopic = 'bots/available';

const connectionsTopic = 'connections';
const REQUEST_ACTION = 'request';
const RESET_ACTION = 'reset';

const addConnected = (clientId, ip) => {
  switch (true) {
    case clientId.includes('SoccerBot'):
      if(bots.findIndex(bot => bot.botId === clientId) === -1) {
        bots.push({ botId: clientId, ip });
      }
      if (availableBots.findIndex(bot => bot.botId === clientId) === -1) {
        availableBots.push({ botId: clientId });
        sendAvailable();
      }
      connections = connections.filter(conn => conn.botId !== clientId);
      break;
    case clientId.includes('Tablet'):
      if(tablets.findIndex(tablet => tablet === clientId) === -1) {
        tablets.push(clientId);
      }
      connections = connections.filter(conn => conn.tabletId == clientId);
      break;
    default:
  }
};

const removeConnected = (clientId) => {
  switch (true) {
    case clientId.includes('SoccerBot'):
      bots = bots.filter(bot => bot.botId !== clientId);
      availableBots = availableBots.filter(bot => bot.botId !== clientId);
      resetConnection({ botId: clientId });
      sendAvailable();
      break;
    case clientId.includes('Tablet'):
      tablets = tablets.filter(tablet => tablet !== clientId);
      resetConnection({ tabletId: clientId });
      break;
    default:
  }
};

const getConnection = (connObj) => {
  const { tabletId, botId } = connObj;
  const myBot = availableBots.findIndex(item => item.botId === botId);
  connections = connections.filter(item => item.tabletId !== tabletId);
  let bot;
  if (myBot !== -1) {
    bot = bots.find(b => b.botId == botId);
    pingBot(bot).then(() => {
      // remove SoccerBot from available
      connections.push({ ...connObj });
      availableBots = availableBots.filter(item => item.botId !== botId);
      client.publish(`${connectionsTopic}/${tabletId}`, JSON.stringify(connObj));
      sendAvailable();
    }).catch(() => {
      client.publish(`${connectionsTopic}/${tabletId}`, JSON.stringify({ tabletId }));
    });
  } else {
    availableBots = availableBots.filter(b => b.botId !== botId);
    sendAvailable();
  }
};

const removeTabletConnection = (tabletId) => {
  const conn = connections.find(c => c.tabletId === tabletId);
  const myBot = conn ? bots.find(bot => bot.botId === conn.botId) : undefined;

  if(myBot) {
    availableBots = availableBots.filter(b => b.botId !== myBot.botId);
    pingBot(myBot)
    .then(() => {
      availableBots.push({ botId: myBot.botId});
      connections = connections.filter(item => item.tabletId !== tabletId);
      client.publish(
        `${connectionsTopic}/${tabletId}`,
        JSON.stringify({ tabletId })
      );
      sendAvailable();
    });
  } else {
    client.publish(
      `${connectionsTopic}/${tabletId}`,
      JSON.stringify({ tabletId })
    );
    sendAvailable();
  }
}

const removeBotConnection = (botId) => {
  const conn = connections.find(c => c.botId === botId);
  if (conn) {
    connections = connections.filter(c => c.botId !== botId);
    client.publish(
      `${connectionsTopic}/${conn.tabletId}`,
      JSON.stringify({ tabletId: conn.tabletId })
    );
  }
}

const resetConnection = (connObj) => {
  const { tabletId, botId } = connObj;

  if (tabletId) {
    removeTabletConnection(tabletId);
    return;
  }

  if (botId){
    removeBotConnection(botId);
  }
}

const cfg = {
  timeout: 2,
  min_reply: 1,
}

const pingBot = (bot) => new Promise((resolve, reject) => {
  ping.sys.probe(bot.ip, (isAlive) => {
    if(isAlive) {
      console.log(`${bot.botId} Its Alive!`);
      resolve(true);
    } else {
      availableBots = availableBots.filter(b => b.botId !== bot.botId);
      bots = bots.filter(b => b.botId !== bot.botId);
      sendAvailable();
      console.log(`***Disconnected bot: ${bot.id}`);
      reject();
    }
  }, cfg);
});

client.on('message', function (topic, message) {
  const msgObj = JSON.parse(message.toString());
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
  }, 5000);
});

module.exports = {
  addConnected,
  removeConnected,
}
