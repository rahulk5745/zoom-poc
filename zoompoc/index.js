// Bring in environment secrets through dotenv
require('dotenv/config')
// comments
// Use the request module to make HTTP requests from Node
const request = require('request');
// Run the express app
const express = require('express');
var cors = require('cors');
const app = express();
var ZOOM_ENDPOINT = 'https://zoom.us/';
var ZOOM_API_ENDPOINT = 'https://api.zoom.us/v2/';
var oauth_access_token;
var whitelist = ['*']
var corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {

            
            callback(new Error('Not allowed by CORS'))
        }
    }
}

// Then pass them to cors:
app.use(cors());

app.get('/', (req, res) => {
    res.send('hello');
})
app.get('/meeting-list', (req, res) => {

    request.get(ZOOM_API_ENDPOINT + 'users/me/meetings', (error, response) => {
        console.log(response);
        if (error) {
            res.status(200).json({
                status: 'error',
                msg: 'API Call Error',
                error: error
            })
        } else {
            // body = JSON.parse(response);
            res.status(200).json({
                status: 'success',
                meetings: response.body
            });
        }
    }).auth(null, null, true, req.headers.authorization);
});
app.get('/get-meeting/:id', (req, res) => {

    request.get(ZOOM_API_ENDPOINT + 'meetings/' + req.params.id, (error, response) => {
        console.log(response);
        if (error) {
            res.status(200).json({
                status: 'error',
                msg: 'API Call Error',
                error: error
            })
        } else {
            // body = JSON.parse(response);
            res.status(200).json({
                status: 'success',
                meetings: response.body
            });
        }
    }).auth(null, null, true, req.headers.authorization);
});
app.delete('/get-meeting/:id', (req, res) => {
    request.get(ZOOM_API_ENDPOINT + 'meetings/' + req.params.id, (error, response) => {
        console.log(response);
        if (error) {
            res.status(200).json({
                status: 'error',
                msg: 'API Call Error',
                error: error
            })
        } else {
            // body = JSON.parse(response);
            res.status(200).json({
                status: 'success',
                meetings: response.body
            });
        }
    }).auth(null, null, true, req.headers.authorization);
});
app.get('/userinfo', (req, res) => {
    request.get(ZOOM_API_ENDPOINT + 'users/me', (error, response, body) => {
        if (error) {
            res.status(200).json({
                status: 'error',
                msg: 'API Call Error',
                error: error
            })
        } else {
            body = JSON.parse(body);
            res.status(200).json({
                status: 'success',
                data: body
            });
        }
    }).auth(null, null, true, body.access_token);
});
app.get('/auth', (req, res) => {
    if (req.query.code) {
        let url = ZOOM_ENDPOINT + 'oauth/token?grant_type=authorization_code&code=' + req.query.code + '&redirect_uri=' + process.env.redirectURL;
        request.post(url, (error, response, body) => {
            body = JSON.parse(body);
            console.log(`access_token: ${body.access_token}`);
            console.log(`refresh_token: ${body.refresh_token}`);
            oauth_access_token = body.access_token;
            if (body.access_token) {
                res.status(200).json({
                    status: 'success',
                    token: body.access_token
                });
            } else {
                console.log(response);
                res.status(200).json({
                    status: 'error',
                    msg: 'OAuth Error',
                    error: body.reason
                })
            }
        }).auth(process.env.clientID, process.env.clientSecret);
    } else {
        return res.json({ eroor: 'invalid code' });
        //ZOOM_ENDPOINT + 'oauth/authorize?response_type=code&client_id=' + process.env.clientID + '&redirect_uri=' + process.env.redirectURL;
        // res.redirect(ZOOM_ENDPOINT + 'oauth/authorize?response_type=code&client_id=' + process.env.clientID + '&redirect_uri=' + process.env.redirectURL)
    }
})
app.get('/create-meeting', async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(403).json({ error: 'No credentials sent!' });
    } else {
        console.log(req.headers.authorization)
    }
    const formData = {
        "topic": "Let's zoom",
        "type": 2,
        "password": "123456",
        "start_time": "2020-05-28T20:30:00",
        "duration": 30, // 30 minsd" : "123456"
    }
    request({
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + oauth_access_token
        },
        uri: ZOOM_API_ENDPOINT + 'users/me/meetings',
        body: JSON.stringify(formData),
        method: 'POST'
    }, (err, httpResponse, body) => {
        console.log(httpResponse)
        console.log(err, body);
        if (err) {
            res.status(200).json({ code: 124, message: 'Ivalid token' });
        }
        res.status(200).json(body);
    });
})
app.listen(4000, () => console.log(`Zoom Hello World app listening at PORT: 4000`))


/**
             * vikram@viol8.com
             * Vicky@123
             */