import bodyParser from "body-parser";
import express, { Request, Response } from "express";
import { BASE_USER_PORT } from "../config";

export type SendMessageBody = {
  message: string;
  destinationUserId: number;
};

export async function user(userId: number) {
  const _user = express();
  _user.use(express.json());
  _user.use(bodyParser.json());

  let lastReceivedMessage: string | null = null;
  let lastSentMessage: string | null = null;

  _user.get("/status", (req: Request, res: Response) => {
    res.send("live");
  });

  _user.get("/getLastReceivedMessage", (req: Request, res: Response) => {
    res.json({ result: lastReceivedMessage });
  });

  _user.get("/getLastSentMessage", (req: Request, res: Response) => {
    res.json({ result: lastSentMessage });
  });

  _user.post("/message", (req: Request, res: Response) => {
    lastReceivedMessage = req.body.message;
    res.sendStatus(200);
  });

  const port = BASE_USER_PORT + userId;
  const server = _user.listen(port, () => {
    console.log(`User ${userId} is listening on port ${port}`);
  });

  return server;
}
