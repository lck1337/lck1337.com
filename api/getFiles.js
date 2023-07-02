const db = require('../database/index');
const qs = require('querystring');
const url = require('url');
const fs = require('fs/promises');

const execute = async (req, res, data) => {

    const query = qs.parse(url.parse(req.url).query);


    try {
    if(!query?.hash) {
        const list = await db.getListFiles();

        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        return res.end(JSON.stringify(list));
      }  else if(query?.rm == 'true') {
        const cookies = await db.parseCookie(req);
        if(!await db.cookieCheck(cookies?.token)) {
            res.writeHead(403);
            return res.end('Unauthorized');
        }
        const getFl = await db.getListFileHash(query?.hash);
        if(!getFl) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });
                return res.end("Этого файла нет в базе! чудик...");
        }
        console.log(getFl.path);
        await fs.rm(getFl.path);
        await db.removeFile(query?.hash); 

        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        return res.end("Файл удален ГЫГЫ");
    } else {
        const dadadadadadadadad = await db.getListFileHash(query?.hash);
        if(!dadadadadadadadad) {
            res.writeHead(400, {
                "Content-Type": "application/json"
            });
            return res.end("АхахХАХАХАХАахаха");
        }
        res.writeHead(200, {
            "Content-Type": "application/json"
        });
        return res.end(JSON.stringify(dadadadadadadadad));
    }

    } catch(e) {
        console.log(e);
     res.writeHead(203);
     return res.end('WTF???');
    }
 };


 module.exports = {
     name: "getFiles",
     execute,
 };