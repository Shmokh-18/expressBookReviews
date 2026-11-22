const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// ---------- تسجيل مستخدم جديد ----------
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// ---------- مسارات السيرفر الأساسية ----------
public_users.get("/", (req, res) => {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

public_users.get("/isbn/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book);
});

public_users.get("/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();
  const result = Object.values(books).filter(b => b.author.toLowerCase() === author);
  if (result.length === 0) return res.status(404).json({ message: "No books found for this author" });
  return res.status(200).json(result);
});

public_users.get("/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();
  const result = Object.values(books).filter(b => b.title.toLowerCase() === title);
  if (result.length === 0) return res.status(404).json({ message: "No books found with this title" });
  return res.status(200).json(result);
});

public_users.get("/review/:isbn", (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });
  return res.status(200).json(book.reviews);
});

// ---------- نفس العمليات باستخدام Axios ----------
const sendError = (res, err) =>
  res.status(err.response ? err.response.status : 500)
     .json({ message: err.response ? err.response.data.message : "Request failed" });

// كل الكتب (async/await)
public_users.get("/axios/books", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (err) {
    return sendError(res, err);
  }
});

// حسب ISBN (Promise callbacks)
public_users.get("/axios/isbn/:isbn", (req, res) => {
  axios.get(`${BASE_URL}/isbn/${encodeURIComponent(req.params.isbn)}`)
    .then(response => res.status(200).json(response.data))
    .catch(err => sendError(res, err));
});

// حسب المؤلف (async/await)
public_users.get("/axios/author/:author", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(req.params.author)}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return sendError(res, err);
  }
});

// حسب العنوان (Promise callbacks)
public_users.get("/axios/title/:title", (req, res) => {
  axios.get(`${BASE_URL}/title/${encodeURIComponent(req.params.title)}`)
    .then(response => res.status(200).json(response.data))
    .catch(err => sendError(res, err));
});

module.exports.general = public_users;
