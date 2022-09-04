import dotenv from "dotenv";
import dayjs from "dayjs";

import {MongoClient, ObjectId} from "mongodb";

import sanitaze from "./utils/sanitizer.js";

dotenv.config();

const DB = "uol-api";
const mongoClient = new MongoClient(process.env.MONGO_URI);

/* POST participants */
const addParticipant = async name => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(DB);
    const participant = await db.collection("participants").findOne({name});

    if (participant) {
      return {status: 409};
    }
    await db.collection("participants").insertOne({name: sanitaze(name), lastStatus: Date.now()});
    await db.collection("messages").insertOne({
      from: sanitaze(name),
      to: "Todos",
      text: "entra na sala...",
      type: "status",
      time: dayjs(Date.now()).format("HH:mm:ss"),
    });

    await mongoClient.close();
    return {status: 201};
  } catch (err) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* GET participants */
const listParticipants = async () => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(DB);
    const participants = await db.collection("participants").find().toArray();
    await mongoClient.close();
    return {data: participants, status: 200};
  } catch (err) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* DELETE participants */
const removeParticipants = async () => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(DB);
    const toRemove = await db
      .collection("participants")
      .find({lastStatus: {$lt: Date.now() - 10000}})
      .toArray();

    const users = toRemove.map(participant => participant.name);
    users.map(async user => {
      await db.collection("messages").insertOne({
        from: user,
        to: "Todos",
        text: "sai da sala...",
        type: "status",
        time: dayjs(Date.now()).format("HH:mm:ss"),
      });
    });

    await db.collection("participants").deleteMany({lastStatus: {$lt: Date.now() - 10000}});

    await mongoClient.close();
    return {status: 200};
  } catch (err) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* POST messages */
const addMessage = async (user, to, text, type) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(DB);
    const participant = await db.collection("participants").findOne({name: user});
    if (!participant) {
      return {status: 422};
    }

    await db.collection("messages").insertOne({
      from: user,
      to: sanitaze(to),
      text: sanitaze(text),
      type,
      time: dayjs(Date.now()).format("HH:mm:ss"),
    });

    await mongoClient.close();
    return {status: 201};
  } catch (err) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* GET messages */
const listMessages = async (user, limit) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(DB);
    const messages = await db
      .collection("messages")
      .find({$or: [{type: "message"}, {type: "status"}, {from: user}, {to: user}]})
      .sort({_id: -1})
      .limit(limit)
      .toArray();
    await mongoClient.close();
    return {data: messages.reverse(), status: 200};
  } catch (err) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* DELETE messages */
const removeMessage = async (user, id) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(DB);
    const message = await db.collection("messages").findOne({_id: ObjectId(id)});
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
  } catch (err) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* PUT messages */
const editMessage = async (user, to, text, type, id) => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(DB);

    const message = await db.collection("messages").findOne({_id: new ObjectId(id)});
    if (!message) {
      return {status: 404};
    }

    const participant = await db.collection("participants").findOne({name: user});
    if (!participant) {
      return {status: 422};
    }

    const {modifiedCount} = await db.collection("messages").updateOne(
      {$and: [{_id: new ObjectId(id)}, {from: user}]},
      {
        $set: {
          from: user,
          to: sanitaze(to),
          text: sanitaze(text),
          type,
        },
      }
    );

    if (modifiedCount === 0) {
      return {status: 401};
    }
    await mongoClient.close();
    return {status: 201};
  } catch (err) {
    await mongoClient.close();
    return {status: 500};
  }
};

/* POST status */
const addStatus = async user => {
  try {
    await mongoClient.connect();
    const db = mongoClient.db(DB);
    const {modifiedCount} = await db
      .collection("participants")
      .updateOne({name: user}, {$set: {lastStatus: Date.now()}});
    if (modifiedCount === 0) {
      return {status: 404};
    }

    await mongoClient.close();
    return {status: 200};
  } catch (err) {
    await mongoClient.close();
    return {status: 500};
  }
};

export {
  addParticipant,
  listParticipants,
  removeParticipants,
  addMessage,
  listMessages,
  removeMessage,
  editMessage,
  addStatus,
};
