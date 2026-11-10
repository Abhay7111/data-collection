const express = require('express');
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(cookieParser())

const dataRouter = require('./routes/data.route')
const authRouter = require('./routes/auth.routes')
const settingsRouter = require('./routes/settings.routes')

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error('Origin is not allowed by CORS'))
    },
    credentials: true,
}))
app.use('/api', dataRouter)
app.use('/api/auth', authRouter)
app.use('/api/settings', settingsRouter)

app.get('/', (req, res) => {
    res.send('Server is running')
})


module.exports = app