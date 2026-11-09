const express = require('express');
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(cookieParser())

const dataRouter = require('./routes/data.route')
const authRouter = require('./routes/auth.routes')

app.use(cors())
app.use('/api', dataRouter)
app.use('/api/auth', authRouter)

app.get('/', (req, res) => {
    res.send('Server is running')
})


module.exports = app