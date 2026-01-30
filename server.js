import cors from "cors"
import express, { application } from "express"
// import data from "./data.json" with { type: "json" }
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"
import "dotenv/config"

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
    minlength: 5,
    // not matching frontend
  },
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// Model based on schema
const Message = mongoose.model('Message', messageSchema)

// Seed database
if (process.env.RESET_DATABASE) {

  const seedDatabase = async () => {
    // Avoid content in api from being duplicated on refresh
    await Message.deleteMany()

    const testMessage = new Message({
      message: 'Backend is fun!',
      hearts: 5
    })
    await testMessage.save()

    const testMessageTwo = new Message({
      message: 'I get happy when it is working!',
      hearts: 1
    })
    await testMessageTwo.save()

    const testMessageThree = new Message({
      message: 'Snow today, yay!!',
      hearts: 0
    })
    await testMessageThree.save()

  }
  seedDatabase()
}

// ROUTES (GET)
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json({
    message: "Welcome to the happy thoughts API. Here is a list of all endpoints",
    endpoints: endpoints,
  })
})

// GET all messages
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 'desc' })
    res.json(messages)

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages "})
  }  
})

// GET liked messages
app.get("/messages/liked", async (req, res) => {
  try {
    let likedMessages = await Message.find ({  hearts: { $gt: 0 } })
    
    if (likedMessages.length === 0) {
      return res.status(404).json ({ error: "No liked messages found" })
    } 

    res.json(likedMessages)
  } catch (error) {
    res.status(500).json({ error: "Failed to get liked messages" })
  }
})

// GET liked messages (query param)
// TODO Error handling
// app.get("/hearts", (req, res) => {
//   let result = data

//   if (req.query.liked === "true") {
//     result = result.filter(message => message.hearts > 0)
//   }

//   res.json(result)
//  })

// GET messages including word happy
app.get("/messages/happy", async (req, res) => {
  try {
    let happyMessages = await Message.find({ message: { $regex: "happy" } })

    if (happyMessages.length === 0) {
      return res.status(404).json({ error: "No messages including the word happy" })
    }
    
    res.json(happyMessages)

    } catch (error) {
      res.status(500).json({ error: "Failed to get messages including the word happy" })
    }
  })

// GET a single message 
app.get("/messages/:id", async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)

    if (message) {
      res.json(message)
  
    } else {
      return res.status(404).json({ error: "no message with that id found" })
    }
  } catch (error) {
    res.status(400).json ({  error: "Invalid user id"})
  }

})

// ROUTES (POST)

// POST a message 
app.post('/messages', async (req, res) => {
  try {
    const message = new Message({
      message: req.body.message,
      hearts: req.body.hearts
    })
    await message.save()
    res.status(200).json(message)
  } catch (error) {
    res.status(400).json({ message: 'Could not save the message', errors:error.errors })
  }
  
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

// TODO Today
// 1. Frontend should be updated with the possibility to Update and Delete a thought.
// 2. Liking a thought route



// TODO: Signing up (next week)
// TODO: signing in (next week)