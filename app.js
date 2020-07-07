require('dotenv').config
const express = require('express')
const morgan = require('morgan')

const MOVIES = require('./MOVIES.json')
const helmet = require('helmet')
const cors = require('cors')
const port = 3000

const app = express()

app.use(morgan('dev'))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
	const authToken = req.get('Authorization')
	const apiToken = process.env.API_TOKEN

	if (!authToken || authToken.split(' ')[1] !== apiToken) {
		return res.status(401).json({ error: 'Unauthorized request' })
	}

	next()
})

app.get('/movies', (req, res) => {
	const { genre, country, avg_vote } = req.query
	const movies = [...MOVIES]
	let results = movies
	let message
	let error

	if (genre) {
		if (!isNaN(parseFloat(genre))) {
			error = `"Genre" must not contain numbers`
		}
		const genreLow = genre.toLowerCase()
		results = movies.filter(
			(movie) => movie.genre.toLowerCase() === genreLow
		)
		results.length < 1 &&
			(message = 'Sorry no movies found searching that genre')
	}

	if (country) {
		if (!isNaN(parseFloat(country))) {
			error = `"Country" must not contain numbers`
		}
		const countryLow = country.toLowerCase()
		results = movies.filter(
			(movie) => movie.country.toLowerCase() === countryLow
		)
		results.length < 1 &&
			(message =
				'Sorry no movies found searching by that country')
	}

	if (avg_vote) {
		if (!parseFloat(avg_vote) || avg_vote >= 10 || avg_vote < 1) {
			error = `"Average Vote" must be a number from 1 - 10`
		}
		results = movies.filter((movie) => movie.avg_vote >= avg_vote)
		results.length < 1 &&
			(message = `Sorry no movies found above rating: ${avg_vote}`)
	}

	error
		? res.status(400).send(error)
		: message
		? res.send(message)
		: res.json(results)
})

app.listen(port, () =>
	console.log(`Server listening on port ${port}!`)
)
