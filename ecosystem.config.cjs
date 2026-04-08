module.exports = {
  apps: [
    {
      name: 'ag-backend-challenge', // Change this to your app's name
      script: './.output/server/index.mjs',
      //       // Path to your Nuxt server file
      cwd: './',
      // Working directory (optional)
      env: {
        NODE_ENV: 'production',
        PORT: 4178 // Change the port here
      }
    }
  ]
};
