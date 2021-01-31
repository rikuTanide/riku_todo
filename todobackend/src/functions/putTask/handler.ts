import "source-map-support/register";
import * as AWS from "aws-sdk";
import { middyfy } from "@libs/lambda";
import { formatJSONResponse } from "@libs/apiGateway";

const handler = async (event) => {
  const db = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

  const id = event.body.id! as string;
  const title = event.body.title! as string;
  const body = event.body.body! as string;
  const progress = event.body.progress! as string;
  const trash = event.body.trash! as string;

  // 本当はGetしてtimeなどが既存のデータと一致しているか確認
  // 時間がないから手抜き

  const param: AWS.DynamoDB.UpdateItemInput = {
    TableName: "tasks",
    Key: {
      id: { S: id },
    },
    UpdateExpression: `SET
          title = :title, 
          body = :body,
          progress = :progress,
          trash = :trash`,
    ExpressionAttributeValues: {
      ":title": { S: title },
      ":body": { S: body },
      ":progress": { S: progress },
      ":trash": { S: trash },
    },
  };
  await db.updateItem(param).promise();

  return formatJSONResponse({
    message: "ok",
  });
};

export const main = middyfy(handler);
