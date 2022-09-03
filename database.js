import dotenv from "dotenv";
import dayjs from "dayjs";

import {MongoClient, ObjectId} from "mongodb";

import sanitaze from "./utils/sanitizer.js";

dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);

/* POST participants */
const addParticipant = async name => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("uol-api-1");
    const participant = await db.collection("participants").findOne({name});

    if (participant) {
      return {status: 409};
    }
    await db.collection("participants").insertOne({name: sanitaze(name), lastStatus: Date.now()});
    await mongoClient.close();
    return {status: 201};
  } catch (error) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* GET participants */
const listParticipant = async () => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("uol-api-1");
    const participants = await db.collection("participants").find().toArray();
    await mongoClient.close();
    return {data: participants, status: 200};
  } catch (error) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* DELETE participants */
const removeUsers = async () => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("uol-api-1");
    await db.collection("participants").deleteMany({lastStatus: {$lt: Date.now() - 10000}});
    await mongoClient.close();
    return {status: 200};
  } catch (error) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* POST messages */
const addMessage = async (from_, to, text, type) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("uol-api-1");

    await db.collection("messages").insertOne({
      from: from_,
      to: sanitaze(to),
      text: sanitaze(text),
      type,
      time: dayjs(Date.now()).format("HH:mm:ss"),
    });

    await mongoClient.close();
    return {status: 201};
  } catch (error) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* GET messages */
const listMessage = async (user, limit) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("uol-api-1");
    const messages = await db
      .collection("messages")
      .find({$or: [{type: "message"}, {from: user}, {to: user}]})
      .sort({_id: -1})
      .limit(limit)
      .toArray();
    await mongoClient.close();
    return {data: messages, status: 200};
  } catch (error) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* DELETE messages */
const removeMessage = async (user, id) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("uol-api-1");
    const message = await db.collection("messages").findOne({_id: id});
    if (!message) {
      return {status: 404};
    }

    const {deletedCount} = await db
      .collection("messages")
      .deleteOne({$and: [{_id: new ObjectId(id)}, {from: user}]});
    if (deletedCount === 0) {
      return {status: 401};
    }
    await mongoClient.close();
    return {status: 200};
  } catch (error) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* PUT messages */
const editMessage = async (from_, to, text, type, id) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("uol-api-1");

    const message = await db.collection("messages").findOne({_id: id});
    if (!message) {
      return {status: 404};
    }

    await db.collection("messages").updateOne(
      {_id: new ObjectId(id)},
      {
        $set: {
          from: from_,
          to: sanitaze(to),
          text: sanitaze(text),
          type,
          time: dayjs(Date.now()).format("HH:mm:ss"),
        },
      }
    );

    await mongoClient.close();
    return {status: 201};
  } catch (error) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* POST status */
const addStatus = async user => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db("uol-api-1");
    const {modifiedCount} = await db
      .collection("participants")
      .updateOne({name: user}, {$set: {lastStatus: Date.now()}});
    if (modifiedCount === 0) {
      return {status: 404};
    }

    await mongoClient.close();
    return {status: 200};
  } catch (error) {
    await mongoClient.close();
    return {status: 500};
  }
};

export {
  addParticipant,
  listParticipant,
  removeUsers,
  addMessage,
  listMessage,
  removeMessage,
  editMessage,
  addStatus,
};
