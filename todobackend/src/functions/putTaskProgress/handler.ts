import "source-map-support/register";
import * as AWS from "aws-sdk";
import { middyfy } from "@libs/lambda";
import { formatJSONResponse } from "@libs/apiGateway";

const handler = async (event) => {
  const db = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

  const id = event.pathParameters.taskID;
  console.log(event.body);
  const progress = event.body! as string;

  // 本当はGetしてtimeなどが既存のデータと一致しているか確認
  // 時間がないから手抜き

  const param: AWS.DynamoDB.UpdateItemInput = {
    TableName: "tasks",
    Key: {
      id: { S: id },
    },
    UpdateExpression: `SET progress = :progress`,
    ExpressionAttributeValues: {
      ":progress": { S: progress },
    },
  };
  await db.updateItem(param).promise();

  return formatJSONResponse({
    message: "ok",
  });
};

export const main = middyfy(handler);
