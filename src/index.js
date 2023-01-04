const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
	const { username } = request.headers;

	const user = users.find(_user => _user.username == username);

	if(user) {
		request.user = user;
		next();
	}
	else {
		response.status(404).json({ error: "User not found." });
	}
}

app.post('/users', (request, response) => {
	const { name, username } = request.body;

	if(users.some(_user => _user.username == username)) {
		response.status(400).json({ error: "A user with this username already exists." });
	}
	
	const newUser = {
		id: uuidv4(),
		name,
		username,
		todos: []
	};

	users.push(newUser);

	return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const { title, deadline } = request.body;

	const new_todo = { 
		id: uuidv4(), // precisa ser um uuid
		title: title,
		done: false, 
		deadline: new Date(deadline), 
		created_at: new Date()
	}

	user.todos.push(new_todo);

	return response.status(201).json(new_todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const { id } = request.params;
	const { title: new_title, deadline: new_deadline } = request.body;

	const todo = user.todos.find(_todo => _todo.id == id);

	if(todo) {
		todo.title = new_title;
		todo.deadline = new Date(new_deadline);
		return response.json(todo);
	}
	else {
		return response.status(404).json({ error: 'Todo not found.' });
	}

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const { id } = request.params;

	const todo = user.todos.find(_todo => _todo.id == id);

	if(todo) {
		todo.done = true;
		return response.json(todo);
	}
	else {
		return response.status(404).json({ error: "Todo not found." });
	}
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
	const { user } = request;
	const { id } = request.params;

	const todo = user.todos.find(_todo => _todo.id == id);

	if(todo) {
		user.todos.splice(user.todos.indexOf(todo), 1);
		return response.status(204).json();
	}
	else {
		return response.status(404).json({ error: 'Todo not found.'  });
	}
});

module.exports = app;