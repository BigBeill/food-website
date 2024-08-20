function errorHandler (error, req, res, next) {
  if (error.message == "Not allowed by CORS"){
    console.error('CORS error for request: ' + "\x1b[36m%s\x1b[0m", req.url);
    return res.status(400).json({ error: 'CORS error' });
  }
  else {
    res.status(500).json({ error: 'internal server error' })
  }

}

module.exports = errorHandler;