const express = require('express')
const fileUpload = require('express-fileupload')
const corsMiddleware = require('./middleware/corsMiddleware')
require('dotenv').config();


const app = express()

app.use(express.json());
app.use(corsMiddleware())

const port = 3000

app.use(fileUpload({
  useTempFiles : true,
  tempFileDir : './uploads'
}));


app.use('/api', require('./routes'))

app.listen(port)

console.log(`Server on ${port}`)