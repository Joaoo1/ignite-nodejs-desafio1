const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
 const { username } = request.headers;

 const user = users.find(u => u.username === username);

 if(!user) {
   return response.status(404).json({error: 'Usuário não encontrado'});
 }

 request.user = user;

 return next();
} 

app.post('/users', (request, response) => {
  const user = users.some(u => u.username === request.body.username);

  if(user) {
    return response.status(400).json({error: 'Usuário já existe'});
  }

  const newUser = {
    id: uuidv4(),
    name: request.body.name,
    username: request.body.username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const newTodo = {
    id: uuidv4(),
    title: request.body.title,
    done: false,
    deadline: new Date(request.body.deadline),
    created_at: new Date(),
  };

  request.user.todos.push(newTodo);

  return response.status(201).send(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const todo = request.user.todos.find(todo => todo.id === request.params.id);

  if(!todo) {
    return response.status(404).json({error: 'Todo não encontrado'});
  }

  todo.title = request.body.title;
  todo.deadline = request.body.deadline;

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const todo = request.user.todos.find(todo => todo.id === request.params.id);

  if(!todo) {
    return response.status(404).json({error: 'Todo não encontrado'});
  }

  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const todoIndex = request.user.todos.findIndex(todo => todo.id === request.params.id);

  if(todoIndex === -1) {
    return response.status(404).json({error: 'Todo não encontrado'});
  }

  request.user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;