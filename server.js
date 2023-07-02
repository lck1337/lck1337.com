const http = require('http');
const { resolve } = require('path');
const fsp = require('fs/promises');
const { createReadStream } = require('fs');
const url = require('url');
const db = require('./database/index');
const jwt = require('jsonwebtoken');


const contentTypes = {
    html: 'text/html',
    json: 'application/json',
    txt: 'text/plain',
    css: 'text/css',
    js: 'text/javascript',

    png: 'image/png',
    jpg: 'image/jpg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',

    ogg: 'audio/ogg',
    mp3: 'audio/mpeg',
    aac: 'audio/aac',

    mp4: 'video/mp4',
    webm: 'video/webm',

    exe: 'application/octet-stream',
    zip: 'application/zip'
};

class server {

    constructor(data) {
        this.data = data,
        this.HTTPServer
    }

    async start() {
        this.HTTPServer = http.createServer(this.http);
        this.HTTPServer.listen(this.data.port);
   }

  static async mainLand(req, res, hz) {
    if (req.method?.toLowerCase() === 'head') {
        return res.end();
       }

     let path = resolve('./' + hz + '/' + (hz == "admin" ? req.url.slice(hz.length+1) : req.url));
     console.log(path);
     let stat = await fsp.stat(path).catch(() => null);
     if (!stat) {
        res.writeHead(302 , {
            'Location' : '/'
         });
       return res.end();
     }
     
     if (stat.isDirectory(path)) {
         path = resolve(path, './index.html');
         stat = await fsp.stat(path).catch(() => false);
     }
     
     if (stat) {
         const stream = createReadStream(path);
         return stream.pipe(res);
     } else {
        res.writeHead(302 , {
            'Location' : '/'
         });
       return res.end();
     }
   }

    async http (req, res) {
            try {
                const cookies = await db.parseCookie(req);
                if (url.parse(req.url).pathname.startsWith("/api/")) {
                    const key = url.parse(req.url).pathname.split('/')[url.parse(req.url).pathname.split('/').length - 1];
                    const endpoint = endpoints.get(key);
                    if(typeof endpoint == "undefined") {
                        res.writeHead(404);
                        return res.end('Endpoint not found');
                    }

                    return endpoint(req, res);
                }

                if (url.parse(req.url).pathname.startsWith("/admin/")) {
                    if(url.parse(req.url).pathname.endsWith("/auth.html")) {
                        if(await db.cookieCheck(cookies?.token)){
                            res.writeHead(302 , {
                                'Location' : '/admin/dashboard.html'
                             });
                           return res.end();
                        }
                    }
                    if(url.parse(req.url).pathname.endsWith("/dashboard.html")) {
                        if(!await db.cookieCheck(cookies?.token)){
                            res.writeHead(302 , {
                                'Location' : '/admin/auth.html'
                             });
                           return res.end();
                        }
                    }

                    return server.mainLand(req, res, "admin");
                }


                try {
                  const decodedToken = jwt.verify(cookies?.jwt, global.secretKey);
                  console.log(decodedToken);
                  server.mainLand(req, res, "static");
                } catch (err) {
                  server.mainLand(req, res, "login");
                  console.error(err); 
                }

             
            } catch(e) {
                console.log(e);
                res.writeHead(404);
                return res.end('Not found');
            }
    }
}
module.exports = server;