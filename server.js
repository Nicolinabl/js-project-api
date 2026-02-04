import cors from "cors"
import express, { application } from "express"
import listEndpoints from "express-list-endpoints"
import mongoose from "mongoose"
import "dotenv/config"
import crypto from "crypto"
import bcrypt from "bcrypt"
import 'dotenv/config' 

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

// Message model
const Message = mongoose.model('Message', messageSchema)

// User schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  }, 
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
    // random access token created using crypto library
  }
})

// User model
const User = mongoose.model('User', userSchema)

// Look up user based on the access token stored in the header 
// const authenticateUser = async (req, res, next) => {
//   try {
//     const user = await User.findOne({ 
//       accessToken: req.header('Authorization').replace("Bearer ", ""),
//     })
//     if (user){
//       req.user = user
//       // next function allows the protected endpoint to continue execution
//       next()
//     } else {
//       res.status(401).json({
//         message: "Authentication missing or invalid",
//         loggedOut: true 
//       })
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error: error.message })
//   }
// }

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

// ROUTES

// Show all available endpoints
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app)
  res.json({
    message: "Welcome to the happy thoughts API. Here is a list of all endpoints",
    endpoints: endpoints,
  })
})

// POST-route: register user
// user registers with name, email and password. We get an access token when they log in
app.post('/users/signup', async (req, res) => {
  try {
    const { email, password } = req.body

    const existingUser = await User.findOne({
      email: email.toLowerCase() })
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists"
      })
    }
    
    const salt = bcrypt.genSaltSync()
    const hashedPassword = bcrypt.hashSync(password, salt)
    const user = new User({ email, password: hashedPassword })

    await user.save()

    res.status(200).json({ 
      success: true,
      message: "User created successfully",
      response: {
        email: user.email,
        id: user._id,
        accessToken: user.accessToken,
      },
     })
    } catch(error) {
    res.status(400).json({ 
      success: false,
      message: 'Could not create user', 
      response: error, 
    })
  }
})

// app.get('/secrets', authenticateUser)
// app.get('/secrets', (req, res) => {
//   res.json({secret: 'This is a super secret message'})
// })

// POST-route: log in (doesnt create the user, it finds one)
app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })

    if (user && bcrypt.compareSync(password, user.password)) {
      res.json({ 
        success: true,
        message: "Logged in successfully",
        response: {
          email: user.email,
          id: user._id,
          accessToken: user.accessToken
        },
      })
    } else {
      res.status(401).json({
        success:false,
        message: "Email or password invalid",
        response: null,
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      response: error
    })
  }
})

// GET-route: show all messages
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 'desc' })
    res.json(messages)

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages "})
  }  
})

// GET-route: show liked messages
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

// GET-route: show messages including word happy
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

// GET-route: show a single message according to id
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

// PATCH-route: send likes
app.patch("/messages/:id/like", async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { $inc: { hearts: 1 } },
      { new: true }
    )

    if (!message) {
      return res.status(404).json({ error: "Message not found" })
    }

    res.json(message)

  } catch (error) {
    res.status(400).json({ error: "could not update likes" })
  }
})

// TODO UPDATE a message

// POST-route: post a message 
app.post('/messages', authenticateUser, async (req, res) => {
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

// DELETE-route: delete a message
app.delete("/messages/:id", async (req, res) => {
  try {
    const deletedMessage = await Message.findByIdAndDelete(req.params.id)

    if (!deletedMessage) {
      return res.status(404).json({ error: "Message not found" })
    } 
    res.status(200).json(deletedMessage)
  } catch (error) {
    res.status(400).json({ error: "Invalid message id" })
  }
})

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
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