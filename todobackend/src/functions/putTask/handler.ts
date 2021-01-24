import "source-map-support/register";
import * as AWS from "aws-sdk";
import { middyfy } from "@libs/lambda";
import { formatJSONResponse } from "@libs/apiGateway";

// 時間がないから手抜き
const handler = async (event) => {
  const id = event.pathParameters.taskID;
  const db = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
  {
    const param: AWS.DynamoDB.DeleteItemInput = {
      TableName: "tasks",
      Key: {
        id: { S: id },
      },
    };
    await db.deleteItem(param).promise();
  }

  {
    const id = event.body.id! as string;
    const title = event.body.title! as string;
    const body = event.body.body! as string;
    const time = event.body.time! as number;
    const userID = event.body.userID! as string;
    const nickname = event.body.nickname! as string;
    const progress = event.body.progress! as string;
    const trash = event.body.trash! as string;

    const param: AWS.DynamoDB.PutItemInput = {
      TableName: "tasks",
      Item: {
        id: { S: id },
        time: { N: time.toString() },
        userID: { S: userID },
        nickname: { S: nickname },
        title: { S: title },
        body: { S: body },
        progress: { S: progress },
        trash: { S: trash },
      },
    };
    await db.putItem(param).promise();
  }

  return formatJSONResponse({
    message: "ok",
  });
};

export const main = middyfy(handler);
