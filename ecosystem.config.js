module.exports = {
  apps: [{
    name: 'kahoot-clone-backend',
    script: 'src/server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/backend-combined.log',
    out_file: './logs/backend-out.log',
    error_file: './logs/backend-error.log',
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    restart_delay: 5000,
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    node_args: '--max-old-space-size=1024'  }, {
    name: 'kahoot-clone-frontend',
    script: 'npm',
    args: 'start',
    cwd: './FrontEnd/kahoot-clone-frontend',
    instances: 1,
    exec_mode: 'fork',    env: {
      NODE_ENV: 'development',
      PORT: 3001,
      BROWSER: 'none',
      CI: 'true',
      GENERATE_SOURCEMAP: 'false',
      SKIP_PREFLIGHT_CHECK: 'true',
      DANGEROUSLY_DISABLE_HOST_CHECK: 'true',
      WDS_SOCKET_HOST: 'localhost',
      WDS_SOCKET_PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001,
      BROWSER: 'none'
    },
    log_file: './logs/frontend-combined.log',
    out_file: './logs/frontend-out.log',
    error_file: './logs/frontend-error.log',    log_date_format: 'YYYY-MM-DD HH:mm Z',
    merge_logs: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '512M',
    restart_delay: 5000,
    watch: false,
    ignore_watch: ['node_modules', 'build', 'logs'],
    interpreter: 'none'
  }]
};
