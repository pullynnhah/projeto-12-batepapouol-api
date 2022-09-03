import {
  addParticipant,
  listParticipants,
  removeParticipants,
  addMessage,
  listMessages,
  removeMessage,
  editMessage,
  addStatus,
} from "database.js";

const postParticipant = async (req, res) => {
  const {name} = req.body;
  const {status} = await addParticipant(name);
  res.sendStatus(status);
};

const getParticipants = async (req, res) => {
  const {status, participants} = await listParticipants();
  if (!participants) {
    res.sendStatus(status);
    return;
  }

  res.status(status).send(participants);
};

const deleteParticipants = async (req, res) => {
  const {status} = await removeParticipants();
  res.sendStatus(status);
};

const postMessage = async (req, res) => {
  const {user} = req.headers;
  const {to, text, type} = req.body;
  const {status} = await addMessage(user, to, text, type);
  res.sendStatus(status);
};

const getMessages = async (req, res) => {
  const {limit} = req.query;
  const {user} = req.headers;
  const {status, messages} = await listMessages(user, limit);
  if (!messages) {
    res.sendStatus(status);
    return;
  }

  res.status(status).send(messages);
};

const deleteMessage = async (req, res) => {
  const {user} = req.headers;
  const {id} = req.params;
  const {status} = await removeMessage(user, id);
  res.sendStatus(status);
};

const putMessage = async (req, res) => {
  const {user} = req.headers;
  const {to, text, type} = req.body;
  const {id} = req.params;
  const {status} = await editMessage(user, to, text, type, id);
  res.sendStatus(status);
};

const postStatus = async (req, res) => {
  const {user} = req.headers;
  const {status} = await addStatus(user);
  res.sendStatus(status);
};

export {
  postParticipant,
  getParticipants,
  deleteParticipants,
  postMessage,
  getMessages,
  deleteMessage,
  putMessage,
  postStatus,
};
