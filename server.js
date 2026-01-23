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

// ROUTES

// Path params
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json({
    message: "Welcome to the happy thoughts API. Here is a list of all endpoints",
    endpoints: endpoints,
  })
})

app.get("/messages", (req, res) => {
  res.json(data)
})

app.get("/messages/liked", (req, res) => {
  let likedMessages = data.filter(message => message.hearts > 0)
  
  res.json(likedMessages)
})

app.get("/messages/happy", (req, res) => {
  let happyMessages = data.filter(message => message.message.toLowerCase().includes("happy"))

  res.json(happyMessages)
})

app.get("/messages/:id", (req, res) => {
  const message = data.find(message => message._id === req.params.id)

  if (!message) {
    return res.status(404).json({ error: "no message with that id" })
  }

  res.json(message)
})

// query params
app.get("/hearts", (req, res) => {
  let result = data

  if (req.query.liked === "true") {
    result = result.filter(message => message.hearts > 0)
  }

  res.json(result)
 })

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
