import cors from "cors"
import express from "express"
import data from "./data.json" with { type: "json" }
import listEndpoints from "express-list-endpoints"

// Defines the port the app will run on. Defaults to 8080, but can be overridden
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Start defining your routes here
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json({
    message: "Welcome to tha happy thoughts API",
    endpoints: endpoints,
  })
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

// returns a single message with specific id, displays error message if id does not exist
app.get("/messages/:id", (req, res) => {
  const message = data.find(message => message._id === req.params.id)

  if (!message) {
    return res.status(404).json({ error: "no message with that id" })
  }

  res.json(message)
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
