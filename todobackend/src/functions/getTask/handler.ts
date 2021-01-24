import "source-map-support/register";
import * as AWS from "aws-sdk";
import { middyfy } from "@libs/lambda";
import { formatJSONResponse } from "@libs/apiGateway";

const handler = async (event) => {
  console.log(event.pathParameters);
  const id = event.pathParameters.taskID;
  console.log(id);
  const db = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
  const param: AWS.DynamoDB.GetItemInput = {
    TableName: "tasks",
    Key: {
      id: { S: id },
    },
  };
  const res = await db.getItem(param).promise();
  const item = (res.$response.data as any).Item as any;
  const title = item["title"].S;
  const body = item["body"].S;
  const time = parseInt(item["time"].N, 10);
  const userID = item["userID"].S;
  const nickname = item["nickname"].S;
  const progress = item["progress"].S;
  const trash = item["trash"].S;

  const payload = {
    id: id,
    title: title,
    body: body,
    time: time,
    userID: userID,
    nickname: nickname,
    progress: progress,
    trash: trash,
  };

  return formatJSONResponse(payload);
};

export const main = middyfy(handler);
