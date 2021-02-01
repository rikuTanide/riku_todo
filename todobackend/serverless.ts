import type { AWS } from "@serverless/typescript";

import {
  hello,
  websocket,
  postTask,
  getTasks,
  getTask,
  patchTask,
  deleteTask,
  putTaskProgress,
  putTaskTrash,
} from "./src/functions";

const serverlessConfiguration: AWS = {
  service: "todobackend",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: ["serverless-webpack"],
  provider: {
    name: "aws",
    runtime: "nodejs12.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
    lambdaHashingVersion: "20201221",
    iamRoleStatements: [
      {
        Effect: "Allow",
        Resource: "arn:aws:dynamodb:us-east-1:692619880522:table/tasks",
        Action: [
          "dynamodb:UpdateItem",
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:DeleteItem",
        ],
      },
      {
        Effect: "Allow",
        Resource:
          "arn:aws:dynamodb:us-east-1:692619880522:table/websocket_connections",
        Action: [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:Scan",
          "dynamodb:DeleteItem",
        ],
      },
    ],
  },
  functions: {
    hello,
    getTasks,
    getTask,
    patchTask,
    deleteTask,
    postTask,
    putTaskProgress,
    putTaskTrash,
    ...websocket,
  },
};

module.exports = serverlessConfiguration;
