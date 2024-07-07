'use strict'

const express = require('express')
const session = require('express-session')

const app = express()
const router = require('./routers/index')
const PORT = 3002
require('dotenv').config()

const favicon = require('serve-favicon')
const path = require('path')


//config
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(favicon(path.join(__dirname, 'public', 'icons', 'logo.png')))

// session config
app.use(session({
    secret: 'IntelliTrade',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: false },
}))

//routing
app.use(router)

app.listen(PORT, () => {
    console.log(`LOCALSERVER STARTED AT PORT ${PORT}`);
})
