const db = require('../database/index');

const validJSON = (data) => {

 try {
     return JSON.parse(data);
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
const body = validJSON(await new Promise((res, rej) => {
     let reqBody = [];
     req.on("data", (d) => {
         reqBody.push(d);
     });
     req.on("end", ()=> {
         res(reqBody.join());
     });
 }));


    if(!body) {
        res.writeHead(404);
        return res.end('404 Error');
    }
    if(!/^[a-zA-Z0-9]([a-zA-Z0-9.-]{2,16}[a-zA-Z0-9])?$/.test(body?.newPassword) || !/^[a-zA-Z0-9]([a-zA-Z0-9.-]{2,16}[a-zA-Z0-9])?$/.test(body?.oldPassword) || !/^[a-zA-Z0-9]([a-zA-Z0-9.-]{2,16}[a-zA-Z0-9])?$/.test(body?.old2Password)) {
        res.writeHead(404);
        return res.end('Формат пароля не правильный.');
    }

    if(body.oldPassword !== body.old2Password ) {
        res.writeHead(404);
        return res.end('Пароли не совпадают.');
    }

    if(!await db.passwordChange(body?.newPassword, body?.oldPassword)) {
        res.writeHead(404);
        return res.end('Неверный пароль.');
    }

     res.writeHead(200);
     return res.end('Пароль успешно изменен.');
 };


 module.exports = {
     name: "changePass",
     execute,
 };