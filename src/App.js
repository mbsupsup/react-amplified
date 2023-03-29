import React, { useEffect, useState } from 'react'
import { Amplify, API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { withAuthenticator, Button, Heading, Text, TextField, View, Card } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const App = ({ signOut, user }) => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])

  useEffect(() => {
    fetchTodos()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, {input: todo}))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Heading style={styles.title} level={1}>Amplify Todos</Heading>
        <View style={ styles.account }>
          <View style={styles.username}>{user.username}</View>
          <Button onClick={signOut}>Sign out</Button>
        </View>
      </View>
      <Card style={styles.createTodo} variation="elevated">
        <TextField
          placeholder="Name"
          onChange={event => setInput('name', event.target.value)}
          style={styles.input}
          defaultValue={formState.name}
        />
        <TextField
          placeholder="Description"
          onChange={event => setInput('description', event.target.value)}
          style={styles.input}
          defaultValue={formState.description}
        />
        <Button style={styles.button} onClick={addTodo} variation="primary">Create Todo</Button>
      </Card>
      {
        todos.map((todo, index) => (
          <Card key={todo.id ? todo.id : index} style={styles.todo} variation="outlined">
            <Text style={styles.todoName}>{todo.name}</Text>
            <Text style={styles.todoDescription}>{todo.description}</Text>
          </Card>
        ))
      }
    </View>
  )
}

const styles = {
  container: { maxWidth: 500, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  navbar: { display: 'flex', alignItems: 'center' },
  title: { fontSize: 30, marginRight: 'auto' },
  account: { textAlign: 'right' },
  username: { marginRight: '10px', display: 'inline' },
  createTodo: { margin: '45px 0', padding: 20, borderRadius: '0.25rem', textAlign: 'right' },
  todo: {  marginBottom: 15, borderColor: '#dddddd', borderRadius: '0.25rem' },
  input: { border: 'none', backgroundColor: '#ddd', textAlign: 'left', marginBottom: 10, padding: 8, fontSize: 15 },
  todoName: { fontSize: 17, fontWeight: 'bold' },
  todoDescription: { marginBottom: 0 },
  button: { fontSize: 15 }
}

export default withAuthenticator(App)
