const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid'); 
const id = uuidv4() // nesta linha guardamos a função que irá criar o nosso ID. Assim, durante o projeto, apenas chamamos o id
const app = express();

app.use(cors());
app.use(express.json());

const users = []; // Vou coletar meus usuários neste Array de users.

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username) // usamos o find para retornar se existe em user o mesmo username indicado. 
  if(!user) { // se não tiver um user
    return response.status(404).json({ error: 'User not found' })
  }

  request.user = user;

  return next() // se existir segue o processo
}

app.post('/users', (request, response) => {
  const { username, name } = request.body; // a rota deve receber name e username dentro do corpo da requisição.
    
  const user = { // Ao cadastrar um novo usuário, ele deve ser armazendo dentro de um objeto. No qual, passamos a chamar de user. 
    id, // o uuid já foi indicado na variável const acima.
    name, 
    username, 
    todos: [],
  }

  const userAlreadyExists = users.find(user => user.username === username) // usamos o find para retornar se existe em user o mesmo username indicado. 
  if(userAlreadyExists) { // se não tiver um user
    return response.status(400).json({ error: "Username already exists" })
  }

  users.push(user) // com o push inserimos este array dentro da nossa const users.

  return response.status(201).json(user) // por fim, retornamos uma resposta 201 com o usuário que foi criado.
  
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request; // recebe, pelo header da requisição, uma propriedade username, contendo o username do usuário. 
  return response.json(user.todos) // retorna uma lista com todas as tarefas desse usuário armazenada no campo todos.
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body // a rota deve receber title e deadline no corpo da requisição
  const { user } = request; // e uma propriedade contendo o username do usuário dentro do header da requisição.

  const todo = { // Formato indicado para a tarefa todos.
    id, // o uuid já foi indicado na variável const acima.
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo) // o novo todo deve ser armazenado dentro da lista.
  return response.status(201).json(todo) // o objeto todo deve ser retornado na resposta da requisição
  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request; // recebe, pelo header da requisição uma propriedade username
  const { title, deadline } = request.body // recebe as propriedades title e o deadline dentro do corpo da reuiqição. 
  const { id } = request.params;

  const checkTodo = user.todos.find(todo => todo.id === id)

  if(!checkTodo) {
    return response.status(404).json({ error: 'Not Found!' })
  }

  checkTodo.title = title;
  checkTodo.deadline = new Date(deadline)

  return response.json(checkTodo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request; // recebe, pelo header da requisição uma propriedade username
  const { id } = request.params;
 
 const checkTodo = user.todos.find(todo => todo.id === id)

 if(!checkTodo) {
  return response.status(404).json({ error: 'Not Found!' })
}

checkTodo.done = true; // alterar a propriedade done para true

 return response.json(checkTodo)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request; // recebe, pelo header da requisição uma propriedade username
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found' })
  }

  user.todos.splice(todoIndex, 1) // excluir o todo que possuir um id iagual ao id presente nos parâmetros da rota. 

  return response.status(204).send()

});



module.exports = app;