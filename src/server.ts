import express, { json } from "express";
import cors from "cors";
import taskRouter from "./resources/task/task.router";
import tokenRouter from "./resources/token/token.router";
import AWS from "aws-sdk";

export const app = express();

app.use(cors());
app.use(json());

app.use("/tasks", taskRouter);
app.use("/tokens", tokenRouter);

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const start = () => {
  const PORT = process.env.PORT ?? 3000;
  try {
    app.listen(PORT, () => {
      console.log(`API is running on localhost:${PORT}`);
    });
  } catch (e) {
    console.error(e);
  }
};
