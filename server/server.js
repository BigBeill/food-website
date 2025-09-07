const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const validateToken = require ('./middleware/auth/validateToken');
const setCookieFlags = require ('./middleware/auth/cookieFlags');
const { verifyVolumeLayout } = require ('./library/volumeUtils');
require ('./config/connectMongo');
require("dotenv").config();

verifyVolumeLayout() // ensure volume is correctly setup

//setup server
const app = express();

// Helper function to serve static files with CORS and error handling
const serveStaticWithCors = (route, relativePath, routeName) => {
   const directory = process.env.SERVER_DIRECTORY ? path.join(process.env.SERVER_DIRECTORY, relativePath) : `/${relativePath}`;

   app.use(route,
      cors({
         origin: true,
         credentials: false,
         maxAge: 86400,
      }),
      express.static(directory, {fallthrough: false}),
      (error, _req, res, _next) => {
         console.error(`[${routeName} error]`, error);
         if (error && error.code === 'ENOENT') return res.status(404).send('Not found');
         if (error && error.code === 'EACCES') return res.status(403).send('Forbidden');
         return res.status(500).send('Static error');
      }
   );
};

// Serve static files without authentication
serveStaticWithCors('/uploads', 'mnt/volume/uploads', 'uploads');
serveStaticWithCors('/publicAssets', 'mnt/volume/publicAssets', 'publicAssets');

// define cors settings
const allowedOrigins = process.env.FRONTEND_URLS.split(',').map(url => url.trim());
const corsOptions = {
   origin: function (origin, callback) {
      if (origin && allowedOrigins.includes(origin)) {
         callback(null, true);
      } else {
         console.warn('CORS request from origin not allowed:', origin);
         callback(new Error('Not allowed by CORS'));
      }
   },
   credentials: true
};

app.use((req, res, next) => {console.log("\n\n\n"); next();}); // split up request logs

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use(setCookieFlags);

app.use(validateToken);

const logGeneralData = require('./middleware/debugging/logGeneralData')
app.use(logGeneralData)

const aiRouter = require('./routes/ai.route');
app.use('/ai', aiRouter);

const authenticationRouter = require('./routes/authentication.route')
app.use('/authentication', authenticationRouter)

const ingredientRouter = require('./routes/ingredient.route')
app.use('/ingredient', ingredientRouter)

const recipeRouter = require('./routes/recipe.route')
app.use('/recipe', recipeRouter)

const userRouter = require('./routes/user.route')
app.use('/user', userRouter)

const errorHandler = require('./middleware/debugging/errorHandler');
app.use(errorHandler);

//listen to port
const PORT = process.env.PORT || 4000
app.listen(PORT, () => {console.log("Server started on port " + PORT)})