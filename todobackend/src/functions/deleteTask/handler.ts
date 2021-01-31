import "source-map-support/register";
import * as AWS from "aws-sdk";
import { middyfy } from "@libs/lambda";
import { formatJSONResponse } from "@libs/apiGateway";

const handler = async (event) => {
  const id = event.pathParameters.taskID;
  const db = new AWS.DynamoDB({ apiVersion: "2012-08-10" });

  const param: AWS.DynamoDB.DeleteItemInput = {
    TableName: "tasks",
    Key: {
      id: { S: id },
    },
  };
  await db.deleteItem(param).promise();

  return formatJSONResponse({
    message: "ok",
  });
};

export const main = middyfy(handler);
