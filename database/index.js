const db = require('better-sqlite3')('./db.sqlite');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class database {

    async escape(value) {
        const escape = db.prepare('SELECT quote(?)').pluck();
        const safeValue = escape.get(value);
        return safeValue;
    }

  static async exec(params) {
    return new Promise(async (res, rej) => {
    try {
       const data = await db.exec(params);
        res(data);
    } catch(e) { 
        rej(e)
    }
    });
    }
    static async prepare(params) {
        return new Promise(async (res, rej) => {
        try {
           const data = await db.prepare(params).get();
            res(data);
        } catch(e) { 
            rej(null)
        }
        });
        }
        static async all(params) {
            return new Promise(async (res, rej) => {
            try {
               const data = await db.prepare(params).all();
                res(data);
            } catch(e) { 
                console.log(e);
                rej(null)
            }
            });
            }
    static async getHash(data) {
    return bcrypt.hash(data, 10).catch(()=>null);
    }

    static async checkIfDataBaseCreated() {
        if(!await this.exec('SELECT * FROM Setting').catch(()=>null)) {
            console.log("Не нашел таблицу Setting => Создаю её.");
            await this.exec('CREATE TABLE Setting (cookies VARCHAR(255) NOT NULL, username VARCHAR(255) NOT NULL, password VARCHAR(255) NOT NULL)').catch((e)=>console.log(e));
            await this.exec(`INSERT INTO Setting (cookies, username, password) VALUES ('${crypto.randomBytes(40).toString('hex')}', 'admin', '${await database.getHash("admin123")}')`).catch((e)=>console.log(e));
        } else {
            console.log("Таблица Setting найдена, ничего не делаю.");
        }
        if(!await this.exec('SELECT * FROM Files').catch(()=>null)) {
            console.log("Не нашел таблицу Files => Создаю её.");
            await this.exec('CREATE TABLE Files (ID INTEGER PRIMARY KEY, hash varchar(255), name varchar(255), description varchar(255), imgurl varchar(255), path varchar(255), originalName varchar(255))').catch((e)=>console.log(e));
        } else {
            console.log("Таблица Files найдена, ничего не делаю.");
        }
        return true;
    }

    static async login(username, password) {
      const setting = await this.prepare('SELECT * FROM Setting').catch(()=>null); 
      if(!setting) return null;
      if(!await bcrypt.compare(password, setting.password) || setting.username !== username) return null;
      return setting.cookies;
    }

    static async upadateToken(coock) {
        if(!/^[a-z0-9]+$/.test(coock)) return null;
        const upadte = await this.exec(`UPDATE Setting SET cookies = '${crypto.randomBytes(40).toString('hex')}' WHERE cookies = '${coock}'`).catch((e)=>null);
        if(!upadte) return null;
        return true;
      }

    static async passwordChange(newPassword, oldPassword) {
        const setting = await this.prepare('SELECT * FROM Setting').catch(()=>null);
        if(!setting) return null;
        if(!await bcrypt.compare(oldPassword, setting.password)) return null;
        const upadte = await this.exec(`UPDATE Setting SET password = '${await database.getHash(newPassword)}', cookies = '${crypto.randomBytes(40).toString('hex')}' WHERE password = '${setting.password}'`).catch((e)=>null);
        if(!upadte) return null;
        return true;
      }

    static async cookieCheck(coock) {
        if(!/^[a-z0-9]+$/.test(coock)) return null;
        const setting = await this.prepare('SELECT * FROM Setting').catch(()=>null);
        if(setting.cookies !== coock) return null;
        return true;
      }

    static async loadFile(hash, name, description, imgur, path, originalName) {
      const dat =  await this.exec(`INSERT INTO Files (hash, name, description, imgurl, path, originalname) VALUES ('${hash}', '${name}', '${description}', '${imgur}', '${path}', '${originalName}')`).catch((e)=>null);
      if(!dat) return null;
      return true;
    }

    static async getListFiles() {
        const files = await this.all('SELECT * FROM Files').catch(()=>null);
        return files;
    }

    static async removeFile(hash) {
        console.log(hash);
        if(!/^[a-z0-9]+$/.test(hash)) return null;
        const file = await this.exec(`DELETE FROM Files WHERE hash = '${hash}'`).catch((x)=>console.log(x));
        console.log(file);
        return file;
    }
    static async getListFileHash(hash) {
        if(!/^[a-z0-9]+$/.test(hash)) return null;
        const file = await this.prepare(`SELECT * FROM Files WHERE hash = '${hash}'`).catch(()=>null);
        return file;
    }
    static async parseCookie(req) {

            const list = {};
            const cookieHeader = req.headers?.cookie;
            if (!cookieHeader) return list;
        
            cookieHeader.split(`;`).forEach(function(cookie) {
                let [ name, ...rest] = cookie.split(`=`);
                name = name?.trim();
                if (!name) return;
                const value = rest.join(`=`).trim();
                if (!value) return;
                list[name] = decodeURIComponent(value);
            });
        
            return list;
    }
}

module.exports = database;