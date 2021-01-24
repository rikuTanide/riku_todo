export default {
  handler: `src/functions/hello/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "hello",
      },
    },
  ],
};
