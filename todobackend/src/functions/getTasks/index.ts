export default {
  handler: `src/functions/getTasks/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "tasks",
        authorizer:
          "arn:aws:cognito-idp:us-east-1:692619880522:userpool/us-east-1_ijq19eVV6",
        cors: true,
      },
    },
  ],
};
