import cors from "cors"
import express, { application } from "express"
// import data from "./data.json" with { type: "json" }
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"

// NOTE - add .env file?
const mongoUrl = process.env.MONGO_URL || "mongodb://127.0.0.1/messages"
mongoose.connect(mongoUrl)

const port = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(express.json())

// Message schema
const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    minlength: 1,
  },
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: () => Date.now()
  }
})

// Model
const Message = mongoose.model('Message', messageSchema)

if (process.env.RESET_DATABASE) {
  // create messages in database
  const seedDatabase = async () => {
    // Avoid content in api from being duplicated on refresh
    await Message.deleteMany()

    const testMessage = new Message({
      message: 'I am testing',
      hearts: 3
    })
    await testMessage.save()

    const testMessageTwo = new Message({
      message: 'is it working?',
      hearts: 10
    })
    await testMessageTwo.save()

  }
  seedDatabase()
}

// ROUTES GET
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json({
    message: "Welcome to the happy thoughts API. Here is a list of all endpoints",
    endpoints: endpoints,
  })
})

// GET all messages
app.get("/messages", async (req, res) => {
  const messages = await Message.find()
  res.json(messages)
})

// GET liked messages
app.get("/messages/liked", (req, res) => {
  let likedMessages = data.filter(message => message.hearts > 0)
  
  res.json(likedMessages)
})

// GET liked messages (query param)
app.get("/hearts", (req, res) => {
  let result = data

  if (req.query.liked === "true") {
    result = result.filter(message => message.hearts > 0)
  }

  res.json(result)
 })

// GET messages including word happy
app.get("/messages/happy", (req, res) => {
  let happyMessages = data.filter(message => message.message.toLowerCase().includes("happy"))

  res.json(happyMessages)
})

// GET a single message
app.get("/messages/:id", (req, res) => {
  const message = data.find(message => message._id === req.params.id)

  if (!message) {
    return res.status(404).json({ error: "no message with that id" })
  }

  res.json(message)
})

// ROUTES POST

// TODO: Liking a thought

// POST a message (authenticated?)
app.post('/messages', async (req, res) => {
  const message = new Message({
    message: req.body.message,
    hearts: req.body.hearts
  })
  await message.save()
  res.json(message)
})

// TODO: Update a message (authenticated)

// TODO: Delete a message

// TODO: Signing up

// TODO: signing in


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

// TODO
// 1. Connect input (messages) from happy thoughts app to api
// 2. Your API should validate user input and return appropriate errors if the input is invalid.
// 3. You should implement error handling for all your routes, with proper response statuses.
// 4. Your frontend should be updated with the possibility to Update and Delete a thought.