// const express = require("express");
// const bodyParser = require("body-parser");
// const fs = require("fs");
// const bcrypt = require("bcryptjs");
// const session = require("express-session");
// const path = require("path");

// const app = express();
// const PORT = 3000;

// app.use(bodyParser.urlencoded({ extended: true })); 
// app.use(express.static("public"));
// app.use(
//   session({
//     secret: "your_secret_key",
//     resave: false,
//     saveUninitialized: true,
//   })
// );

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// let blogs = [];
// let users = [];

// const loadUsersFromFile = () => {
//   if (fs.existsSync("users.json")) {
//     users = JSON.parse(fs.readFileSync("users.json"));
//   }
// };

// const saveUsersToFile = () => {
//   fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
// };

// const loadBlogsFromFile = () => {
//   if (fs.existsSync("blogs.json")) {
//     blogs = JSON.parse(fs.readFileSync("blogs.json"));
//   }
// };

// const saveBlogsToFile = () => {
//   fs.writeFileSync("blogs.json", JSON.stringify(blogs, null, 2));
// };

// loadUsersFromFile();
// loadBlogsFromFile();

// // Route Handlers
// app.get("/", (req, res) => {
//   res.render("index");
// });

// app.get("/register", (req, res) => {
//   res.render("register");
// });

// app.post("/register", (req, res, next) => {
//   const { username, password } = req.body;
//   try {
//     if (users.some((user) => user.username === username)) {
//       const err = new Error("Username already exists! Try a different one.");
//       err.statusCode = 400; 
//       return next(err);
//     }
//     const hashedPassword = bcrypt.hashSync(password, 8);
//     users.push({ username, password: hashedPassword })
//     saveUsersToFile();
//     res.redirect("/login");
//   } catch (error) {
//     next(error);
//   }
// });

// app.get("/login", (req, res) => {
//   res.render("login");
// });

// app.post("/login", (req, res, next) => {
//   const { username, password } = req.body;
//   try {
//     const user = users.find((u) => u.username === username);
//     if (!user || !bcrypt.compareSync(password, user.password)) {
//       const err = new Error("Invalid credentials");
//       err.statusCode = 401;
//       return next(err);
//     }
//     req.session.user = user;
//     res.redirect("/blogs");
//   } catch (error) {
//     next(error);
//   }
// });

// app.get("/blogs", (req, res, next) => {
//   try {
//     if (!req.session.user) {
//       const err = new Error("Unauthorized access to blogs");
//       err.statusCode = 403; 
//       return next(err);
//     }
//     const userBlogs = blogs.filter(blog => blog.user === req.session.user.username);
//     res.render("blogs", { blogs: userBlogs });
//   } catch (error) {
//     next(error);
//   }
// });

// app.post("/blogs", (req, res, next) => {
//   try {
//     if (!req.session.user) {
//       const err = new Error("Unauthorized");
//       err.statusCode = 403; 
//       return next(err);
//     }
//     const { title, content, name } = req.body;
//     blogs.push({ title, user: req.session.user.username, content, name, comments: [] });
//     saveBlogsToFile();
//     res.redirect("/blogs");
//   } catch (error) {
//     next(error);
//   }
// });

// app.post("/blogs/:id/comments", (req, res, next) => {
//   const blogId = req.params.id;
//   const { comment } = req.body;
//   try {
//     if (!req.session.user) {
//       const err = new Error("Unauthorized");
//       err.statusCode = 403; 
//       return next(err);
//     }
//     if (!blogs[blogId]) {
//       const err = new Error("Blog not found");
//       err.statusCode = 404; 
//       return next(err);
//     }
//     blogs[blogId].comments.push({ user: req.session.user.username, comment });
//     saveBlogsToFile();
//     res.redirect("/blogs");
//   } catch (error) {
//     next(error);
//   }
// });

// app.get("/blogs/:id/edit", (req, res, next) => {
//   const blogId = req.params.id;
//   try {
//     if (!req.session.user) {
//       const err = new Error("Unauthorized");
//       err.statusCode = 403; 
//       return next(err);
//     }
//     const blog = blogs[blogId];
//     if (!blog || blog.user !== req.session.user.username) {
//       const err = new Error("Blog not found or unauthorized");
//       err.statusCode = 404;
//       return next(err);
//     }
//     res.render("edit", { blog, id: blogId });
//   } catch (error) {
//     next(error);
//   }
// });

// app.post("/blogs/:id/edit", (req, res, next) => {
//   const blogId = req.params.id;
//   const { title, content } = req.body;
//   try {
//     if (!req.session.user) {
//       const err = new Error("Unauthorized");
//       err.statusCode = 403; 
//       return next(err);
//     }
//     if (!blogs[blogId] || blogs[blogId].user !== req.session.user.username) {
//       const err = new Error("Blog not found or unauthorized");
//       err.statusCode = 404;
//       return next(err);
//     }
//     blogs[blogId] = { title, user: req.session.user.username, content, name: blogs[blogId].name, comments: blogs[blogId].comments };
//     saveBlogsToFile();
//     res.redirect("/blogs");
//   } catch (error) {
//     next(error);
//   }
// });

// app.post("/blogs/:id/delete", (req, res, next) => {
//   const blogId = req.params.id;
//   try {
//     if (!req.session.user) {
//       const err = new Error("Unauthorized");
//       err.statusCode = 403;
//       return next(err);
//     }
//     if (!blogs[blogId] || blogs[blogId].user !== req.session.user.username) {
//       const err = new Error("Blog not found or unauthorized");
//       err.statusCode = 404;
//       return next(err);
//     }
//     blogs.splice(blogId, 1);
//     saveBlogsToFile();
//     res.redirect("/blogs");
//   } catch (error) {
//     next(error);
//   }
// });

// app.get("/blogs/search", (req, res, next) => {
//   const query = req.query.query.toLowerCase();
//   try {
//     if (!req.session.user) {
//       const err = new Error("Unauthorized");
//       err.statusCode = 403; 
//       return next(err);
//     }
//     const userBlogs = blogs.filter(blog => 
//       blog.user === req.session.user.username && 
//       (blog.title.toLowerCase().includes(query) || blog.content.toLowerCase().includes(query))
//     );

//     if (userBlogs.length === 0) {
//       const err = new Error("No blogs found matching your search criteria.");
//       err.statusCode = 404; 
//       return next(err);
//     }
//     res.render("blogs", { blogs: userBlogs });
//   } catch (error) {
//     next(error);
//   }
// });

// app.use((err, req, res, next) => {
//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message || 'Something went wrong',
//   });
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// MongoDB connection
const db_conn = async () => {
  try {
    await mongoose.connect("mongodb+srv://siddharthj436:sid@cluster0.6dpahmo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};


db_conn(); // Connect to MongoDB

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

// Mongoose Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  user: { type: String, required: true },
  content: { type: String, required: true },
  name: { type: String, required: true },
  comments: [{ user: String, comment: String }],
});

const User = mongoose.model('User ', userSchema);
const Blog = mongoose.model('Blog', blogSchema);

// Route Handlers
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const existingUser  = await User.findOne({ username });
    if (existingUser ) {
      const err = new Error("Username already exists! Try a different one.");
      err.statusCode = 400; 
      return next(err);
    }
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser  = new User({ username, password: hashedPassword });
    await newUser .save();
    res.redirect("/login");
  } catch (error) {
    next(error);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      return next(err);
    }
    req.session.user = user;
    res.redirect("/blogs");
  } catch (error) {
    next(error);
  }
});

app.get("/blogs", async (req, res, next) => {
  try {
    if (!req.session.user) {
      const err = new Error("Unauthorized access to blogs");
      err.statusCode = 403; 
      return next(err);
    }
    const userBlogs = await Blog.find({ user: req.session.user.username });
    res.render("blogs", { blogs: userBlogs });
  } catch (error) {
    next(error);
  }
});

app.post("/blogs", async (req, res, next) => {
  try {
    if (!req.session.user) {
      const err = new Error("Unauthorized");
      err.statusCode = 403; 
      return next(err);
    }
    const { title, content, name } = req.body;
    const newBlog = new Blog({ title, user: req.session.user.username, content, name, comments: [] });
    await newBlog.save();
    res.redirect("/blogs");
  } catch (error) {
    next(error);
  }
});

app.post("/blogs/:id/comments", async (req, res, next) => {
  const blogId = req.params.id;
  const { comment } = req.body;
  try {
    if (!req.session.user) {
      const err = new Error("Unauthorized");
      err.statusCode = 403; 
      return next(err);
    }
    const blog = await Blog.findById(blogId);
    if (!blog) {
      const err = new Error("Blog not found");
      err.statusCode = 404; 
      return next(err);
    }
    blog.comments.push({ user: req.session.user.username, comment });
    await blog.save();
    res.redirect("/blogs");
  } catch (error) {
    next(error);
  }
});

app.get("/blogs/:id/edit", async (req, res, next) => {
  const blogId = req.params.id;
  console.log("Editing blog with ID:", blogId); // Log the ID
  try {
    if (!req.session.user) {
      const err = new Error("Unauthorized");
      err.statusCode = 403; 
      return next(err);
    }

    // Validate the blogId
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      const err = new Error("Invalid blog ID");
      err.statusCode = 400;
      return next(err);
    }

    const blog = await Blog.findById(blogId);
    if (!blog || blog.user !== req.session.user.username) {
      const err = new Error("Blog not found or unauthorized");
      err.statusCode = 404;
      return next(err);
    }
    res.render("edit", { blog, id: blogId });
  } catch (error) {
    next(error);
  }
});


app.post("/blogs/:id/edit", async (req, res, next) => {
  const blogId = req.params.id;
  const { title, content } = req.body;
  try {
    if (!req.session.user) {
      const err = new Error("Unauthorized");
      err.statusCode = 403; 
      return next(err);
    }
    const blog = await Blog.findById(blogId);
    if (!blog || blog.user !== req.session.user.username) {
      const err = new Error("Blog not found or unauthorized");
      err.statusCode = 404;
      return next(err);
    }
    blog.title = title;
    blog.content = content;
    await blog.save();
    res.redirect("/blogs");
  } catch (error) {
    next(error);
  }
});

app.post("/blogs/:id/delete", async (req, res, next) => {
  const blogId = req.params.id;
  console.log("Deleting blog with ID:", blogId); // Log the ID
  try {
    if (!req.session.user) {
      const err = new Error("Unauthorized");
      err.statusCode = 403;
      return next(err);
    }

    // Validate the blogId
    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      const err = new Error("Invalid blog ID");
      err.statusCode = 400;
      return next(err);
    }

    const blog = await Blog.findById(blogId);
    if (!blog || blog.user !== req.session.user.username) {
      const err = new Error("Blog not found or unauthorized");
      err.statusCode = 404;
      return next(err);
    }
    await Blog.findByIdAndDelete(blogId);
    res.redirect("/blogs");
  } catch (error) {
    next(error);
  }
});



app.get("/blogs/search", async (req, res, next) => {
  const query = req.query.query.toLowerCase();
  try {
    if (!req.session.user) {
      const err = new Error("Unauthorized");
      err.statusCode = 403; 
      return next(err);
    }
    const userBlogs = await Blog.find({
      user: req.session.user.username,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    });

    if (userBlogs.length === 0) {
      const err = new Error("No blogs found matching your search criteria.");
      err.statusCode = 404; 
      return next(err);
    }
    res.render("blogs", { blogs: userBlogs });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong',
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});








