const express = require('express');
// const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');
const GethGenesisPowController = new (require('./controllers/geth/GenesisPowController'));
const GethNetworkPowController = new (require('./controllers/geth/NetworkPowController'));
const exec = require('child_process').exec;
const utils = require('./utils');

const app = express();
/*
 *  EXPRESS CONFIG
 */

app.use(express.static(path.join(__dirname, '../build_webpack')));

// app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// const cors = require('cors');
// app.use(cors());

// TODO: Create routes to run bash scripts
app.post('/geth/pow/genesis/new', GethGenesisPowController.create)
// app.post('/geth/genesis/:name/edit', GethGenesisPowController.edit)
// app.get('/geth/genesis/:name/show', GethGenesisPowController.show)
// app.delete('/geth/genesis/:name/destroy', GethGenesisPowController.destroy)
app.post('/geth/pow/network/new', GethNetworkPowController.create)
app.post('/geth/pow/network/:id/start', GethNetworkPowController.start)
app.post('/geth/pow/network/stop', GethNetworkPowController.stop)
app.delete('/geth/pow/network/:id', GethNetworkPowController.destroy)
// app.get('/geth/network/:id/status', GethNetworkPowController.show)

app.get('/script', (req, res) => {
  exec('~/Documents/12launch.sh',
    function (error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
});

app.post('/create_genesis', (req, res) => utils.createGenesisPromise(req.body)
  .then(res => res.status(200).send(res))
  .catch(err => res.status(500).send(err)));

app.post('/create_geth_pow', (req, res) => utils.createGenesisPromise(req.body)
  .then(() => utils.createGethNetworkPromise(req.body))
  .then(res => res.status(200).send(res))
  .catch(err => res.status(500).send(err)));

app.post('/check_network_status', (req, res) => {
  const { networkId } = req.body;
  exec(`./server/scripts/geth/check-network.sh ${networkId}`,
    (error, stdout, stderr) => {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error) {
        console.log('exec error: ' + error);
        res.status(500).send({ networkId, status: stderr });
      } else {
        res.status(200).send({ networkId, status: stdout });
      }
    });
});

app.get('/getExample', (req, res) => {
  res.status(200).send('/getExample response');
});

app.get('/get_state', (req, res) => {
  res.status(200).send(utils.get_state());
});

app.post('/save_state', (req, res) => {
  res.status(200).send(utils.save_state(req.body.networks));
});

app.post('/postExample', (req, res) => {
  console.log(req.body);
  res.status(200).send(`/postExample response: ${JSON.stringify(req.body)}`);
});

app.get('/:bad*', (req, res) => {
  res.status(404).send(`Resource not found '${req.params.bad}'`);
});


app.listen(process.env.PORT || 5000, () => {
  console.warn('Backend server listening on port 5000!');
});