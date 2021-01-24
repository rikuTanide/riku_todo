import "source-map-support/register";
import * as AWS from "aws-sdk";
import { middyfy } from "@libs/lambda";
import { formatJSONResponse } from "@libs/apiGateway";

const handler = async () => {
  const db = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });
  const param: AWS.DynamoDB.ScanInput = {
    TableName: "tasks",
    Select: "ALL_ATTRIBUTES",
  };
  const res = await db.scan(param).promise();
  const items = (res.$response.data as any).Items.map((i) => ({
    id: i.id,
    title: i.title,
    time: i.time,
    progress: i.progress,
    trash: i.trash,
  }));
  return formatJSONResponse(items);
};

export const main = middyfy(handler);
