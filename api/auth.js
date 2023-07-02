   const db = require('../database/index');

   const validJSON = (data) => {

    try {
        return JSON.parse(data);
    } catch(e) {
        return null;
    }

   };

   const execute = async (req, res, data) => {
        console.log(req);

   const body =  validJSON(await new Promise((res, rej) => {
        let reqBody = [];
        req.on("data", (d) => {
            reqBody.push(d);
        });
        req.on("end", ()=> {
            res(reqBody.join());
        });
    }));

    console.log(body);
    if(!body) {
        res.writeHead(404);
        return res.end('404 Error');
    }

    if(!/^[a-zA-Z0-9]([a-zA-Z0-9.-]{2,16}[a-zA-Z0-9])?$/.test(body?.username) || !/^[a-zA-Z0-9]([a-zA-Z0-9.-]{2,16}[a-zA-Z0-9])?$/.test(body?.password)) {
        res.writeHead(404);
        return res.end('404 Error');
    }

   const cookie = await db.login(body?.username, body?.password);
   if(!cookie) {
    res.writeHead(403);
    return res.end('Poshel Naxui');
   };
        res.writeHead(200, {
            'Location': "/admin/dashboard.html",
            'Set-Cookie': 'token=' + cookie + "; Max-Age=999999999999999; Path=/"
        });
        return res.end('Zaebis');
    };


    module.exports = {
        name: "auth",
        execute,
    };