import {
  addParticipant,
  listParticipants,
  addMessage,
  listMessages,
  removeMessage,
  editMessage,
  addStatus,
} from "./database.js";

const postParticipant = async (req, res) => {
  const {name} = req.body;
  const {status} = await addParticipant(name);
  res.sendStatus(status);
};

const getParticipants = async (req, res) => {
  const {status, data} = await listParticipants();
  if (!data) {
    res.sendStatus(status);
    return;
  }

  res.status(status).send(data);
};

const postMessage = async (req, res) => {
  const {user} = req.headers;
  const {to, text, type} = req.body;
  const {status} = await addMessage(user, to, text, type);
  res.sendStatus(status);
};

const getMessages = async (req, res) => {
  const limit = Number(req.query.limit);
  const {user} = req.headers;
  const {status, data} = await listMessages(user, limit);
  if (!data) {
    res.sendStatus(status);
    return;
  }

  res.status(status).send(data);
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
  postMessage,
  getMessages,
  deleteMessage,
  putMessage,
  postStatus,
};
