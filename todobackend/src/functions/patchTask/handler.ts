import "source-map-support/register";
import * as AWS from "aws-sdk";
import { middyfy } from "@libs/lambda";
import { formatJSONResponse } from "@libs/apiGateway";

const handler = async (event) => {
  const db = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

  const id = event.pathParameters.taskID;
  const title = event.body.title! as string;
  const body = event.body.body! as string;

  // 本当はGetしてtimeなどが既存のデータと一致しているか確認
  // 時間がないから手抜き

  const param: AWS.DynamoDB.UpdateItemInput = {
    TableName: "tasks",
    Key: {
      id: { S: id },
    },
    UpdateExpression: `SET
          title = :title, 
          body = :body`,
    ExpressionAttributeValues: {
      ":title": { S: title },
      ":body": { S: body },
    },
  };
  await db.updateItem(param).promise();

  return formatJSONResponse({
    message: "ok",
  });
};

export const main = middyfy(handler);
