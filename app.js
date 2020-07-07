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

	if (genre) {
		if (!isNaN(parseFloat(genre))) {
			res.status(400).send(`"Genre" must not contain numbers`)
		}
		results = movies.filter(
			(movie) =>
				movie.genre.toLowerCase() === genre.toLowerCase()
		)
		results.length < 1 &&
			(message = 'Sorry no movies found searching that genre')
	}

	if (country) {
		if (!isNaN(parseFloat(country))) {
			res.status(400).send(`"Country" must not contain numbers`)
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
		if (!parseFloat(avg_vote) || avg_vote > 10 || avg_vote < 1) {
			res.status(400).send(
				`"Average Vote" must be a number from 1 - 10`
			)
		}
		results = movies.filter((movie) => movie.avg_vote >= avg_vote)
		results.length < 1 &&
			(message = `Sorry no movies found above rating: ${avg_vote}`)
	}

	if (message) {
		res.send(message)
	} else {
		res.json(results)
	}
})

app.listen(port, () =>
	console.log(`Example app listening on port ${port}!`)
)
