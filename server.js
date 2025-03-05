const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

let blogs = [];
let users = [];

// Load users and blogs from JSON files
const loadUsersFromFile = () => {
  if (fs.existsSync("users.json")) {
    users = JSON.parse(fs.readFileSync("users.json"));
  }
};

const saveUsersToFile = () => {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
};

const loadBlogsFromFile = () => {
  if (fs.existsSync("blogs.json")) {
    blogs = JSON.parse(fs.readFileSync("blogs.json"));
  }
};

const saveBlogsToFile = () => {
  fs.writeFileSync("blogs.json", JSON.stringify(blogs, null, 2));
};

// Load data on startup
loadUsersFromFile();
loadBlogsFromFile();

// Home route
app.get("/", (req, res) => {
  res.render("index");
});

// User Registration
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users.some((user) => user.username === username)) {
    return res.send("Username already exists! Try a different one.");
  }
  const hashedPassword = bcrypt.hashSync(password, 8);
  users.push({ username, password: hashedPassword });
  saveUsersToFile();
  res.redirect("/login");
});

// User Login
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = user;
    return res.redirect("/blogs");
  }
  res.send("Invalid credentials");
});

// Blog Routes
app.get("/blogs", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const userBlogs = blogs.filter(blog => blog.user === req.session.user.username);
  res.render("blogs", { blogs: userBlogs });
});

app.post("/blogs", (req, res) => {
  if (!req.session.user) {
    return res.status(403).send("Unauthorized");
  }
  const { title, content, name } = req.body;
  blogs.push({ title, user: req.session.user.username, content, name, comments: [] });
  saveBlogsToFile();
  res.redirect("/blogs");
});

// Commenting System
app.post("/blogs/:id/comments", (req, res) => {
  const blogId = req.params.id;
  const { comment } = req.body;
  if (!req.session.user) {
    return res.status(403).send("Unauthorized");
  }
  if (!blogs[blogId]) {
    return res.status(404).send("Blog not found");
  }
  blogs[blogId].comments.push({ user: req.session.user.username, comment });
  saveBlogsToFile();
  res.redirect("/blogs");
});

// Search Functionality
// Search Functionality
app.get("/blogs/search", (req, res) => {
  const query = req.query.query.toLowerCase();
  const userBlogs = blogs.filter(blog => 
    blog.user === req.session.user.username && 
    (blog.title.toLowerCase().includes(query) || blog.content.toLowerCase().includes(query))
  );

  // Render a new view for search results
  if (userBlogs.length > 0) {
    res.render("searchResults", { blogs: userBlogs });
  } else {
    res.render("searchResults", { blogs: [], message: "No blogs found." });
  }
});

// Edit Blog
app.get("/blogs/:id/edit", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const blogId = req.params.id;
  const blog = blogs[blogId];
  if (!blog || blog.user !== req.session.user.username) {
    return res.status(403).send("Unauthorized");
  }
  res.render("edit", { blog, id: blogId });
});

app.post("/blogs/:id/edit", (req, res) => {
  if (!req.session.user) {
    return res.status(403).send("Unauthorized");
  }
  const blogId = req.params.id;
  const { title, content } = req.body;
  if (!blogs[blogId] || blogs[blogId].user !== req.session.user.username) {
    return res.status(404).send("Blog not found or unauthorized");
  }
  blogs[blogId] = { title, user: req.session.user.username, content, name: blogs[blogId].name, comments: blogs[blogId].comments };
  saveBlogsToFile();
  res.redirect("/blogs");
});

// Delete Blog
app.post("/blogs/:id/delete", (req, res) => {
  if (!req.session.user) {
    return res.status(403).send("Unauthorized");
  }
  const blogId = req.params.id;
  if (!blogs[blogId] || blogs[blogId].user !== req.session.user.username) {
    return res.status(404).send("Blog not found or unauthorized");
  }
  blogs.splice(blogId, 1);
  saveBlogsToFile();
  res.redirect("/blogs");
});

// Logout
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});