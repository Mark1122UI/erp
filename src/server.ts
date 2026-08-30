import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { autoSeedDemoData } from './config/autoSeed.js';

async function bootstrap() {
  try {
    // 1. Connect to Primary Database (MongoDB)
    await connectDatabase(env.MONGODB_URI);

    // 2. Auto-seed demo data in development mode
    if (env.NODE_ENV !== 'production') {
      await autoSeedDemoData();
    }

    // 3. Start HTTP Server
    app.listen(env.PORT, () => {
      console.log(`🚀 ${env.APP_NAME} running on port ${env.PORT} [${env.NODE_ENV}]`);
      console.log(`📡 Health Check: http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
