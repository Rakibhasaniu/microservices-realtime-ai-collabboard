import express from 'express';
import helmet from 'helmet';
import cors from 'cors'
import { corsMiddleware, requestLogger } from './middleware/auth';
import { env } from './config';
import morgan from 'morgan';
import router from './routes/authRoutes';

const app =express();

app.use(helmet());
app.use(cors());
app.use(corsMiddleware)
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies


if(env.NODE_ENV === 'development'){
  app.use(morgan('dev'))
}

app.use(requestLogger)

app.use('/api/auth',router)



app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CollabBoard Auth Service',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CollabBoard Auth API',
    endpoints: {
      'POST /api/auth/register': 'Register new user',
      'POST /api/auth/login': 'Login user',
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <jwt_token>'
    }
  });
});
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 Global error handler:', error);
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

export default app;