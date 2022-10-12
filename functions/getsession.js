const fetch = require('node-fetch');

function ResultOfWeb(status, responsecode, message, response, responseheaders, phpcookie) {
    this.status = status;
    this.responsecode = responsecode;
    this.message = message;
    this.response = response;
    this.responseheaders = responseheaders;
    this.phpcookie = phpcookie;
}

class getSession {
    constructor(username, password) {
        this.user = username;
        this.pass = password;
    }

    async login() {
        const request = await fetch("https://student.amikompurwokerto.ac.id/auth/toenter", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            "referrer": "https://student.amikompurwokerto.ac.id/Auth",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": 'pengguna=' + this.user + '&passw=' + this.pass,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        const bodyoftext = await request.text();
        const headers = await request.headers.get('set-cookie');
        const sessioncode = headers.match(/[^=](.*?)\w+/gi)[1]
        const statusofcode = /111/
        var result = statusofcode.test(bodyoftext) ? new ResultOfWeb(true, 0, 'Berhasil', bodyoftext, headers, sessioncode) : new ResultOfWeb(false, 1, 'Error', bodyoftext, headers, sessioncode)
        return result;
    }
}

module.exports = getSession;