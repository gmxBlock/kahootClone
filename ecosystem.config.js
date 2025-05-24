module.exports = {
  apps: [{
    name: 'kahoot-clone-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    restart_delay: 5000,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    node_args: '--max-old-space-size=1024'
  }]
};
