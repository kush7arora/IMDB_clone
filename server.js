
const express = require('express');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const sessionConfig = require('./config/sessions');
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const path = require('path');
const app = express();
const movieRoutes = require('./routes/movieRoutes');
const cors = require('cors');
const axios = require('axios');


connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionConfig);
app.use(cors({
  origin: 'http://localhost:5050',
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/movies', movieRoutes);


app.get('/api/proxy/movies', async (req, res) => {
  try {
    const query = req.query.query;
  
    const yearMatch = query.match(/(\d{4})-(\d{4})/);
    let searchQuery = query;
    let yearParam = '';
    
    if (yearMatch) {
    
      searchQuery = query.replace(/\d{4}-\d{4}/, '').trim();
    
      yearParam = `&y=${yearMatch[1]}`;
    }
    
    console.log(`Searching OMDB API with query: ${searchQuery}${yearParam}`);
    const response = await axios.get(`http://www.omdbapi.com/?apikey=228b48c4&s=${encodeURIComponent(searchQuery)}${yearParam}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

app.get('/api/proxy/movie', async (req, res) => {
  try {
    const id = req.query.id;
    const response = await axios.get(`http://www.omdbapi.com/?apikey=228b48c4&i=${id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

app.get('/api/tmdb/discover', async (req, res) => {
  try {
    const { genre, minDuration, maxDuration, minRating, startYear, endYear, page = 1 } = req.query;
    
    // TMDb API key
    const tmdbApiKey = '2e1ee69b814f88e54efdef84927bc4b3';
    
  
    const genreMap = {
      'Action': '28',
      'Drama': '18',
      'Comedy': '35',
      'Sci-Fi': '878',
      'Thriller': '53'
    };
    
    
    const genreId = genreMap[genre] || '28'; 
    
    
    const tmdbMinRating = parseFloat(minRating || 0);
    
  
    const minRuntime = Math.max(1, parseInt(minDuration || 60));
    const maxRuntime = parseInt(maxDuration || 240);
    
    
    const minVoteCount = 1000; 
    
    
    const url = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&with_genres=${genreId}&vote_average.gte=${tmdbMinRating}&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31&with_runtime.gte=${minRuntime}&with_runtime.lte=${maxRuntime}&vote_count.gte=${minVoteCount}&page=${page}`;
    
    console.log(`Searching TMDb API: Genre=${genre}, Rating>=${tmdbMinRating}, Years=${startYear}-${endYear}, Duration=${minRuntime}-${maxRuntime} min, Page=${page}, Min Votes=${minVoteCount}`);
    console.log(`Request URL: ${url}`);
    
    const response = await axios.get(url, { timeout: 5000 }); // 5 second timeout
    
    
    if (response.data.results && response.data.results.length > 0) {
      console.log(`Found ${response.data.results.length} popular movies. First movie: ${response.data.results[0].title}`);
    } else {
      console.log('No movies found matching criteria with minimum vote count');
      
    
      console.log('Trying without minimum vote count requirement...');
      const fallbackUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&with_genres=${genreId}&vote_average.gte=${tmdbMinRating}&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31&with_runtime.gte=${minRuntime}&with_runtime.lte=${maxRuntime}&page=${page}`;
      
      const fallbackResponse = await axios.get(fallbackUrl, { timeout: 5000 }); // 5 second timeout
      if (fallbackResponse.data.results && fallbackResponse.data.results.length > 0) {
        console.log(`Found ${fallbackResponse.data.results.length} movies without vote count restriction. First movie: ${fallbackResponse.data.results[0].title}`);
        res.json(fallbackResponse.data);
        return;
      } else {
      
        if (minRuntime > 1 || maxRuntime < 240) {
          console.log('Trying without runtime restrictions...');
          const secondFallbackUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&with_genres=${genreId}&vote_average.gte=${tmdbMinRating}&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31&page=${page}`;
          
          const secondFallbackResponse = await axios.get(secondFallbackUrl, { timeout: 5000 }); // 5 second timeout
          if (secondFallbackResponse.data.results && secondFallbackResponse.data.results.length > 0) {
            console.log(`Found ${secondFallbackResponse.data.results.length} movies without runtime and vote restrictions. First movie: ${secondFallbackResponse.data.results[0].title}`);
            res.json(secondFallbackResponse.data);
            return;
          }
        }
      }
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching movies from TMDb:', error);
    if (error.code === 'ECONNABORTED') {
      res.status(504).json({ error: 'Request to TMDb API timed out' });
    } else if (error.response) {
      console.error('TMDb API Error Response:', error.response.data);
      res.status(error.response.status).json({ 
        error: 'TMDb API Error',
        details: error.response.data
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch movies from TMDb' });
    }
  }
});


app.get('/api/tmdb/movie', async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Movie ID is required' });
    }

    const tmdbApiKey = '2e1ee69b814f88e54efdef84927bc4b3';
    const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${tmdbApiKey}&language=en-US&append_to_response=credits`;
    
    console.log(`Fetching movie details for ID: ${id}`);
    
    const response = await axios.get(url, { timeout: 5000 }); // 5 second timeout
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching movie details from TMDb:', error);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});


app.get('/api/omdb/movie/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`http://www.omdbapi.com/?apikey=228b48c4&i=${id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});


app.get('/api/omdb/movie', async (req, res) => {
  try {
    const { title, year } = req.query;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    let queryUrl = `http://www.omdbapi.com/?apikey=228b48c4&t=${encodeURIComponent(title)}`;
    if (year) {
      queryUrl += `&y=${year}`;
    }
    
    const response = await axios.get(queryUrl);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching movie details by title:', error);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});


app.use(express.static(path.join(__dirname, 'public')));

// Page Routes
app.get('/', (req, res) => {
  res.redirect('/movies');
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/movies', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'movies.html'));
});

app.get('/wishlist', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'wishlist.html'));
});

app.get('/movie-details', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'movieDetails.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/randomMovie', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'randomMovie.html'));
});




app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
