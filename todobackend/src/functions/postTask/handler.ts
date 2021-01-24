import "source-map-support/register";
import * as AWS from "aws-sdk";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const title = event.body.title! as string;
  const body = event.body.body! as string;
  const time = event.body.time! as number;
  const userID = event.body.userID! as string;
  const nickname = event.body.nickname! as string;
  const progress = event.body.progress! as string;
  const trash = event.body.trash! as string;

  const id = randomString();

  const db = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
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
  console.log(param);
  const res = await db.putItem(param).promise();
  console.log(res.$response);

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(id),
  };
};

function randomString(): string {
  const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const N = 16;
  return Array.from(Array(N))
    .map(() => S[Math.floor(Math.random() * S.length)])
    .join("");
}

export const main = middyfy(hello);
