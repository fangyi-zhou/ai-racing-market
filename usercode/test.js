const Docker = require('dockerode');
const docker = new Docker({
    host: process.env.DOCKER_HOST,
    port: process.env.DOCKER_PORT,
    ca: process.env.CA,
    cert: process.env.CERT,
    key: process.env.KEY
})

docker.run('ubuntu', ['bash', '-c', 'uname -a'], process.stdout, function (err, data, container) {
  console.log(data.StatusCode);
});
