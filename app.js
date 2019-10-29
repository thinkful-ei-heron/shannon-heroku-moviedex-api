require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const movies = require('./movies.json');

const app = express();
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const bearerToken = req.get('Authorization') ? req.get('Authorization') : '';
  const apiToken = process.env.API_TOKEN;
  if (!bearerToken.startsWith('Bearer') || bearerToken.split(' ')[1] !== apiToken) {
    return res.status(400).json({ error: 'Not authorized to view' });
  } else {
    next();
  }
});


app.get('/movie', (req, res) => {
  let filteredMovies = movies;
  const { genre, country, avg_vote } = req.query;

  if ('genre' in req.query && !req.query.genre) {
    return res.status(400).json({ error: 'Genre search field must contain a value' });
  }
  if ('country' in req.query && !req.query.country) {
    return res.status(400).json({ error: 'Country search field must contain a value' });
  }
  if ('avg_vote' in req.query && !req.query.avg_vote) {
    return res.status(400).json({ error: 'Average Vote search field must contain a value' });
  }

  if (genre) {
    filteredMovies = filteredMovies.filter(movie => movie.genre.toLowerCase().includes(genre.toLowerCase()));
  }
  if (country) {
    filteredMovies = filteredMovies.filter(movie => movie.country.toLowerCase().includes(country.toLowerCase()));
  }
  if (avg_vote) {
    const vote = parseFloat(avg_vote);
    if (isNaN(avg_vote)) {
      return res.status(400).json({ error: 'avg_vote must be a number'});
    }
    filteredMovies = filteredMovies.filter(movie => movie.avg_vote > vote);
  }

  if (filteredMovies.length === 0) {
    return res.status(400).json({ error: 'Sorry, unable to find a movie with those search specifications' });
  }

  return res.json(filteredMovies);
});

app.listen(8000, () => {
  console.log('Listening on port 8000');
});
