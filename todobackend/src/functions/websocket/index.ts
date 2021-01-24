
const onConnect = {
  handler: `src/functions/websocket/handler.onConnect`,
  events: [
    {websocket: {route: "$connect"}}
  ],
}

const onMessage = {
  handler: `src/functions/websocket/handler.onMessage`,
  events: [
    {websocket: {route: "$default"}}
  ],
}

const onDisconnect = {
  handler: `src/functions/websocket/handler.onDisconnect`,
  events: [
    {websocket: {route: "$disconnect"}}
  ],
}


export default {
   onConnect, onMessage, onDisconnect
};
