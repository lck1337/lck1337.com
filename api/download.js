const db = require('../database/index');
const qs = require('querystring');
const url = require('url');
const fs = require('fs/promises');
const { createReadStream } = require('fs');

const execute = async (req, res, data) => {

    try {
        const query = qs.parse(url.parse(req.url).query);
        const dadadadadadadadad = await db.getListFileHash(query?.hash);
        if(!dadadadadadadadad) {
            res.writeHead(400, {
                "Content-Type": "application/json"
            });
            return res.end("АхахХАХАХАХАахаха");
        }

        console.log(dadadadadadadadad);
        let filepath = dadadadadadadadad.path;
        const stat = await fs.stat(filepath).catch(async()=> {
             return null;
        });

        res.writeHead(200, {
            "Content-Disposition": "attachment;filename=" + dadadadadadadadad.originalName,
            'Content-Length': stat.size
            
        });
        const readStream = createReadStream(filepath);
        readStream.pipe(res);

    } catch(e) {
        console.log(e);
     res.writeHead(203);
     return res.end('WTF???');
    }
 };


 module.exports = {
     name: "download",
     execute,
 };