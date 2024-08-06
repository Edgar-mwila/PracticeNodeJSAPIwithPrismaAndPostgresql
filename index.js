// app.js

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const cors = require('cors');



const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

// User CRUD operations
app.post('/users', async (req, res) => {
  const { email, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, username, password: hashedPassword },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });
  res.json(user);
});

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { email, username } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { email, username },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({
    where: { id: parseInt(id) },
  });
  res.json({ message: 'User deleted' });
});
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await prisma.user.findUnique({
        where: { email: email }
      });
  
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }
  
      const validPassword = await bcrypt.compare(password, user.password);
  
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid password" });
      }
  
      // Don't send the password in the response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: "An error occurred during login" });
    }
  });

// Post CRUD operations
app.post('/posts', async (req, res) => {
  const { title, content, authorId } = req.body;
  try {
    const post = await prisma.post.create({
      data: { title, content, authorId: parseInt(authorId) },
    });
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/posts', async (req, res) => {
    try {
      const posts = await prisma.post.findMany({
        include: {
          author: true,
          comments: {
            include: {
              author: true
            }
          },
          likes: true
        }
      });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

app.get('/posts/:id', async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: { author: true, comments: true, likes: true },
  });
  res.json(post);
});

app.put('/posts/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { title, content },
    });
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/posts/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.post.delete({
    where: { id: parseInt(id) },
  });
  res.json({ message: 'Post deleted' });
});

// Comment CRUD operations
app.post('/comments', async (req, res) => {
  const { content, authorId, postId } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: { content, authorId: parseInt(authorId), postId: parseInt(postId) },
    });
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/comments', async (req, res) => {
  const comments = await prisma.comment.findMany({
    include: { author: true, post: true },
  });
  res.json(comments);
});

app.put('/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const comment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
    });
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/comments/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.comment.delete({
    where: { id: parseInt(id) },
  });
  res.json({ message: 'Comment deleted' });
});

// Like operations
app.post('/likes', async (req, res) => {
  const { userId, postId } = req.body;
  try {
    const like = await prisma.like.create({
      data: { userId: parseInt(userId), postId: parseInt(postId) },
    });
    res.json(like);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/likes/:userId/:postId', async (req, res) => {
  const { userId, postId } = req.params;
  await prisma.like.delete({
    where: { 
      userId_postId: {
        userId: parseInt(userId),
        postId: parseInt(postId)
      }
    },
  });
  res.json({ message: 'Like removed' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));