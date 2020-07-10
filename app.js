require('dotenv').config()
const express = require('express')
const morgan = require('morgan')

const MOVIES = require('./MOVIES.json')
const helmet = require('helmet')
const cors = require('cors')
const { API_TOKEN, NODE_ENV } = require('./config')
const logger = require('./logger')

const app = express()
const morganSetting = NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
	const authToken = req.get('Authorization')
	const apiToken = API_TOKEN

	if (!authToken || authToken.split(' ')[1] !== apiToken) {
		logger.error('Unauthorized request')
		return res.status(401).json({ error: 'Unauthorized request' })
	}

	next()
})

app.get('/movie', (req, res) => {
	const { genre, country, avg_vote } = req.query
	let movies = [...MOVIES]
	let message
	let error

	if (genre) {
		if (!isNaN(parseFloat(genre))) {
			error = { error: `"Genre" must not contain numbers` }
		}
		const genreLow = genre.toLowerCase()
		movies = movies.filter((movie) =>
			movie.genre.toLowerCase().includes(genreLow)
		)
	}

	if (country) {
		if (!isNaN(parseFloat(country))) {
			error = { error: `"Country" must not contain numbers` }
		}
		const countryLow = country.toLowerCase()
		movies = movies.filter((movie) =>
			movie.country.toLowerCase().includes(countryLow)
		)
	}

	if (avg_vote) {
		if (!parseFloat(avg_vote) || avg_vote > 10 || avg_vote < 1) {
			error = {
				error: `"Average Vote" must be a number from 1 - 10`,
			}
		}
		movies = movies.filter((movie) => movie.avg_vote >= avg_vote)
	}

	movies.length < 1 &&
		(message = {
			message: 'Sorry no movies found...search again?',
		})

	error
		? res.status(400).json(error)
		: message
		? res.json(message)
		: res.json(movies)
})

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, _next) => {
	let response
	if (process.env.NODE_ENV === 'production') {
		response = { error: { message: 'server error' } }
	} else {
		response = { error }
	}
	res.status(500).json(response)
})
