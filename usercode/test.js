const Docker = require('dockerode');
const docker = new Docker({
    host: process.DOCKER_HOST,
    port: process.DOCKER_PORT,
    ca: process.env.CA,
    cert: process.env.CERT,
    key: process.env.KEY
})

docker.run('ubuntu', ['bash', '-c', 'uname -a'], process.stdout, function (err, data, container) {
  console.log(data.StatusCode);
});
