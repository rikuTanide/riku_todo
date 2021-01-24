import * as AWS from "aws-sdk";
const db = new AWS.DynamoDB({ apiVersion: "2012-10-08" });

//websocket_connections
export const onMessage = async (event, _2, callback) => {
  const scanParam: AWS.DynamoDB.Types.ScanInput = {
    Select: "ALL_ATTRIBUTES",
    TableName: "websocket_connections",
  };
  const data = (await db.scan(scanParam).promise()).Items as { id: string }[];

  const apiGateway = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: event.requestContext.domainName + "/" + event.requestContext.stage
  });
  for (const item of data) {
    const sendParam: AWS.ApiGatewayManagementApi.Types.PostToConnectionRequest = {
      ConnectionId: (item.id as any).S,
      Data: "message",
    };
    try {
      await apiGateway.postToConnection(sendParam).promise();
    } catch (e) {
      // エラーになっても気にしない。
      console.log(e);
    }
  }
  callback(null, {
    statusCode: 200,
    body: "",
  });
};
export const onConnect = async (event: any, _, callback) => {
  console.log(event.requestContext);
  const putParam: AWS.DynamoDB.PutItemInput = {
    TableName: "websocket_connections",
    Item: {
      id: { S: event.requestContext.connectionId },
    },
  };
  await db.putItem(putParam).promise();
  callback(null, {
    statusCode: 200,
    body: "",
  });
};

export const onDisconnect = async (event: any, _: any, callback: any) => {
  const putParam: AWS.DynamoDB.DeleteItemInput = {
    TableName: "websocket_connections",
    Key: {
      id: { S: event.requestContext.connectionId },
    },
  };
  await db.deleteItem(putParam).promise();
  callback(null, {
    statusCode: 200,
    body: "",
  });
};
