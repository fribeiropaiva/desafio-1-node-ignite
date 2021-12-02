const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(cors);
app.use(express.json());

const users = [];

function checkIfUserExists(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", checkIfUserExists, (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(user);
});

app.get("/todos", checkIfUserExists, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checkIfUserExists, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checkIfUserExists, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const { title, deadline } = request.body;

  const todoToUpdate = user.todos.find(todo => todo.id === id);

  if (todoToUpdate) {
    if (title) {
      todoToUpdate.title = title;
    }

    if (deadline) {
      todoToUpdate.deadline = deadline;
    }

    return response.status(200).json(todoToUpdate);
  } else {
    return response.status(404).json({ error: "Todo not found" });
  }
});

app.patch("/todos/:id/done", checkIfUserExists, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoToUpdate = user.todos.find(todo => todo.id === id);

  if (todoToUpdate) {
    todoToUpdate.done = true;
    return response.status(200).json(todoToUpdate);
  } else {
    return response.status(404).json({ error: "Todo not found" });
  }
});

app.delete("/todos/:id", checkIfUserExists, (request, response) => {
  const { user } = request;

  const todoToDelete = user.todos.find(todo => todo.id === id);

  if (todoToDelete) {
    user.todos.splice(todoToDelete, 1);
    return response.status(200);
  } else {
    return response.status(404).json({ error: "Todo not found" });
  }
})

module.exports = app;
