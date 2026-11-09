require('dotenv').config()
const app = require('./src/app')
const connectToDB = require('./src/config/connect.config')

const PORT = process.env.PORT

connectToDB()

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
}) 