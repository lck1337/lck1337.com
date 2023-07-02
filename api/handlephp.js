const jwt = require('jsonwebtoken');
global.secretKey = 'mFDF325rfedsfGay';

var qs = require('querystring');

function gedBody (request, response) {
    if (request.method == 'POST') {
        return new Promise((resolve) => {
        let body = '';
        request.on('data', function (data) {
            body += data;
            if (body.length > 1e6) { 
                request.connection.destroy();
            }
        });
        request.on('end', function () {
            console.log(body);
            resolve(qs.parse(body));

        });
    });
    } else {

        return null;
    }
}

const execute = async (req, res, data) => {
const gData = await gedBody(req, res);
console.log(gData);
try {

    const token = jwt.sign({}, secretKey, { expiresIn: '2h' });
    res.writeHead(200);
    res.end(token);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end(`Error: ${err.message}`);
  }
 };


 module.exports = {
     name: "handler",
     execute,
 };