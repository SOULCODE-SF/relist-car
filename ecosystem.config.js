module.exports = {
  apps: [
    {
      name: 'relist', // Replace with your application's name
      script: './index.js', // Replace with your application's entry point
      instances: 1, // Number of instances to be started (adjust as needed)
      autorestart: true, // Restart the app if it crashes
      watch: false, // Watch for file changes and restart
      max_memory_restart: '1G', // Restart if memory usage exceeds this amount
      env: {
        NODE_ENV: 'production', // Environment mode
      },
      error_file: './logs/pm2-error.log', // Path to error log file
      out_file: './logs/pm2-out.log', // Path to output log file
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z', // Log date format
      merge_logs: true, // Merge logs across instances
      time: true, // Timestamps in PM2 logs
    },
  ],
};
