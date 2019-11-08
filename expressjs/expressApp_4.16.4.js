const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 9000;

const router = express.Router();

const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

app.use(compression()); // enable gzip compression
app.use(helmet()); // protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately
app.use(cors()); // Enable All CORS Requests

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded


// use winston as logger
const { createLogger, format } = require('winston');
// const { transports } = require('winston');
const { combine, errors, json } = format;

const DailyRotateFile = require('winston-daily-rotate-file');
const moment = require('moment');

const momentFormat = format((info, opts) => {
    info.timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    return info;
});

const logger = createLogger({
    level: 'info',
    format: combine(
        momentFormat(),
        errors({ stack: true }),
        json(),
    ),
    defaultMeta: { service: 'Your service' },
    transports: [
        // new transports.Console({ level: 'info'}),
        new DailyRotateFile({
            filename: 'error-%DATE%.log',
            dirname: '/log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false,
            level: 'error' 
        }),
        new DailyRotateFile({
            filename: 'combined-%DATE%.log',
            dirname: '/log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: false
        })
    ]
});

// start of your express router
router.get('/api/test', async (req, res) => {
    const profiler = logger.startTimer();
    // do some job
    profiler.done({ message: 'profiler job done'});

    const resData = { status: 'success' };
    const success = true;
    if(success) {
        return res.status(200).send(resData);
    } else {
        return res.status(400).send({
            status: 'fail',
            reason: 'fail reason'
        });
    }
});


router.post('/api/test', async (req, res) => {
    logger.info(`start your post request controller`);

    const postData = req.body; // get post body

    const profiler = logger.startTimer();
    // do some job
    profiler.done({ message: 'profiler job done'});

    const resData = { status: 'success' };
    const success = true;
    if(success) {
        return res.status(200).send(resData);
    } else {
        return res.status(400).send({
            status: 'fail',
            reason: 'fail reason'
        });
    }
});

// express health check by printing request headers
// return static output with HTTP 200 OK
router.get('/healthcheck', (req, res) => {
    res.status(200).send(healthcheck(req.headers));
});
function healthcheck(header) {
    let str = 'LIVE <br><table>'   
    for (const key in header) {
        if (header.hasOwnProperty(key)) {
            const value = header[key];
            str += `<tr><td width="150">${key}</td><td>${value}</td></tr>`
        }
    }
    str += '</table>'
    return str;
}

// add router middleware
app.use(router);

// add external call router
const externalRouter = require('./src/router/xxxx');
app.use('/api/xxx', externalRouter);

// endpoint not defined handler
app.use(function (req, res) {
    res.status(404).end();
});

// error handler
app.use(function (err, req, res, next) {
    logger.error(err.stack);

    if(err instanceof SyntaxError) {
        res.status(400).send('Bad request');
    }

    res.status(500).send('Something broke!');
});

app.listen(port, () => logger.info(`app listening on port ${port}!`));
// env PROD
