const db = require('../database/index');
const multiparty = require('multiparty');
const fs = require('fs/promises');
const crypto = require('crypto');

const multypart = async (data) => {

 try {
    return new Promise(async (res,rej) => {
    const form = new multiparty.Form({uploadDir: './files'});
    form.parse(data, (err, fields, files) => {
        if(err) res(null);
        res({fields,files});
    });
      });
 
 } catch(e) {
     return null;
 }

};

const execute = async (req, res, data) => {
    const cookies = await db.parseCookie(req);
    if(!await db.cookieCheck(cookies?.token)) {
        res.writeHead(403);
        return res.end('Unauthorized');
    }


  const body = await multypart(req);

if(!/^[a-zA-Z0-9_ -|!#%&.?]{1,80}$/.test(body?.fields?.name?.[0])) {
    await fs.rm(body?.files?.file?.[0]?.path).catch((x)=>null);
    res.writeHead(400);
    return res.end('Формат текста должен быть [a-zA-Z0-9_ -!#%&.?]');
}
if(!/^[a-zA-Z0-9_ -|!#%&.?]{1,80}$/.test(body?.fields?.Description?.[0])) {
    await fs.rm(body?.files?.file?.[0]?.path).catch((x)=>null);
    res.writeHead(400);
    return res.end('Формат текста должен быть [a-zA-Z0-9_ -!#%&.?]');
}
if(!/^((?:http[s]*?\:\/\/)*(.*?)(?:[a-zA-Z]{1}(?:[\w\-]+\.)+(?:[\w]{2,5}))(?:\:[\d]{1,5})?\/(?:[^\s\/]+\/)*(?:[^\s]+\.(?:jpe?g|gif|png))(?:\?\w+=\w+(?:&\w+=\w+)*)?)$/.test(body?.fields?.URLImage?.[0])) {
    await fs.rm(body?.files?.file?.[0]?.path).catch((x)=>null);
    res.writeHead(400);
    return res.end('Нужна прямая ссылка по типу "http://example.com/img.jpg". Разрешенные форматы: jpe?g|gif|png');
}



 if(!body) {
     res.writeHead(404);
     return res.end('404 Error');
 }

 console.log(body?.files);

let fileData = {
    hash: crypto.randomBytes(40).toString('hex'),
    name: body?.fields?.Name?.[0],
    description: body?.fields?.Description?.[0],
    imgur: body?.fields?.URLImage?.[0],
    path: body?.files?.file[0]?.path,
    filename: body?.files?.file[0]?.originalFilename
};

console.log(fileData);

await db.loadFile(fileData.hash, fileData.name, fileData.description, fileData.imgur, fileData.path, fileData.filename);

 res.writeHead(200);
 return res.end(JSON.stringify(fileData));
 };


 module.exports = {
     name: "loadFile",
     execute,
 };