const httpServer = require('./server');
const db = require('./database/index');
const fs = require('fs/promises');
global.endpoints = new Map();

(async() => {

    await db.checkIfDataBaseCreated();

    for(m of await fs.readdir('./api')) {
        const md = require('./api/' + m);
        endpoints.set(md.name, md.execute);
    }


    const connection = new httpServer({
        port: 1234
    });
    connection.start();
    console.log(`U2FsdGVkX1+iWsagwLwXua5lkQcIiuhT3HAXmsU4MAZ/D+VHe+hyIHJKoE3QcJHv lV2lDdpHmgbEMeJfyZbPoA==
    U2FsdGVkX18rHdBXpYMOh39hvxRMTPEfmg9yJFKcajRVT70NxhDi07M4T0gu9JJe ib2SOYFUev+DxsD+9vXNdw==`);
})();