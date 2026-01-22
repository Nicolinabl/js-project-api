import cors from "cors"
import express from "express"
import data from "./data.json"

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!")
})

// returns all messages in array
app.get("/messages", (req, res) => {
  res.json(data)
})

// filters messages and returns all liked messages
app.get("/messages/liked", (req, res) => {
  let likedMessages = data.filter(message => message.hearts > 0)
  res.json(likedMessages)
})

// filters messages and returns those containing the word happy
app.get("/messages/happy", (req, res) => {
  let happyMessages = data.filter(message => message.message.toLowerCase().includes("happy"))
  res.json(happyMessages)
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
