const mongoose = require('mongoose')

const MONGODB_URI = 'mongodb+srv://aqsa_user_11:H1BxnTtf2WzvJVLw@cluster0.5thjw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message)
})