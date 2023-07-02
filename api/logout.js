const db = require('../database/index');

const execute = async (req, res, data) => {
    const cookies = await db.parseCookie(req);
    if(!await db.cookieCheck(cookies?.token)) {
        res.writeHead(403);
        return res.end('Unauthorized');
    }

    await db.upadateToken(cookies?.token);
 res.writeHead(200);
 return res.end("Пошел нахуй");
 };


 module.exports = {
     name: "logout",
     execute,
 };