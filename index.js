import cors from "cors";
import express from "express";

import {removeParticipants} from "./database.js";

import {
  postParticipant,
  getParticipants,
  postMessage,
  getMessages,
  deleteMessage,
  putMessage,
  postStatus,
} from "./handlers.js";

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

app.post("/participants", postParticipant);
app.get("/participants", getParticipants);

app.post("/messages", postMessage);
app.get("/messages", getMessages);
app.delete("/messages/:id", deleteMessage);
app.put("/messages/:id", putMessage);

app.post("/status", postStatus);

setInterval(removeParticipants, 15000);

app.listen(port, () => console.log(`Magic happens @ http://localhost:${port}...`));
