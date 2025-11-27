// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  res.status(err.status || 500).json({ 
    message: err.message || 'Server error' 
  });
};

// In server.js, add after routes:
app.use(require('./middleware/errorHandler'));