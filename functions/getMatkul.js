const fetch = require('node-fetch');
const cheerio = require('cheerio');

function maps(variable) {
    let var_a = variable.split('</option>')
    return var_a[0]
}

function mapgetAbs(varbel) {
    let var_a = varbel.split('">');
    let idpresensidosen = var_a[0].split('(')[1].split(',')[0]
    let mata_kuliah = var_a[0].split("'")[1].split("'")[0]
    let kuliah_tp_id = var_a[0].split("'")[3].split("'")[0]
    let kuliah_tipe = var_a[0].split("')")[0].split("'")[1]
    let var_b = {
        arraydata: var_a[0],
        idp_dosen: idpresensidosen,
        matkul: mata_kuliah,
        kuliahtpid: kuliah_tp_id,
        kuliahtipe: kuliah_tipe
    }
    return var_b
}

class getMatkul {
    constructor(session) {
        this.session = session;
    }

    async getInfo() {
        const request = await fetch('https://student.amikompurwokerto.ac.id/main', {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9",
                "x-requested-with": "XMLHttpRequest",
                "cookie": 'ci_session=' + this.session,
                "Referer": "https://student.amikompurwokerto.ac.id/presensi",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        });
        const bodyoftext = await request.text();
        const $ = cheerio.load(bodyoftext)
        const nim = $('#data-example-1 > div.col-md-8 > form > div:nth-child(1) > label.col-sm-8').text()
        const nama = $('#data-example-1 > div.col-md-8 > form > div:nth-child(2) > label.col-sm-8').text()
        const no_hp = $('#data-example-1 > div.col-md-8 > form > div:nth-child(3) > label.col-sm-8').text()
        const email = $('#data-example-1 > div.col-md-8 > form > div:nth-child(4) > label.col-sm-8').text()
        const fakultas = $('#data-example-1 > div.col-md-8 > form > div:nth-child(5) > label.col-sm-8').text()
        const prodi = $('#data-example-1 > div.col-md-8 > form > div:nth-child(6) > label.col-sm-8').text()
        const angkatan = $('#data-example-1 > div.col-md-8 > form > div:nth-child(7) > label.col-sm-8').text()
        const pembimbing_akademik = $('#data-example-1 > div.col-md-8 > form > div:nth-child(8) > label.col-sm-8').text()
        const sks = $('#page-content > div > div.row > div.col-md-8 > div.row > div:nth-child(1) > a > div.tile-content-wrapper > div').text()
        const ipk = $('#page-content > div > div.row > div.col-md-8 > div.row > div:nth-child(2) > a > div.tile-content-wrapper > div').text()
        const sks_now = $('#page-content > div > div.row > div.col-md-8 > div.row > div:nth-child(3) > a > div.tile-content-wrapper > div').text()
        const result = {
            nim,
            nama,
            no_hp,
            email,
            fakultas,
            prodi,
            angkatan,
            pembimbing_akademik,
            sks,
            ipk,
            sks_now
        }
        return result;
    }

    async getAll() {
        const request = await fetch("https://student.amikompurwokerto.ac.id/pembelajaran/getmakul", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "cookie": 'ci_session=' + this.session,
            },
            "referrer": "https://student.amikompurwokerto.ac.id/presensi",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": "thn_akademik=2023%2F2024&semester=1",
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        const bodyoftext = await request.text();
        if (bodyoftext.includes('option')) {
            const parseOption = bodyoftext.split('<option value=')
            const spl = parseOption.slice(1);
            const mappingvariable = spl.map(a => maps(a))
            var res = {
                status: 200,
                result: mappingvariable
            }
        } else {
            var res = {
                status: 403,
                result: "error, cookie not found"
            }
        }
        return res;
    }

    async getAbsensi(kodematkul) {
        const request = await fetch("https://student.amikompurwokerto.ac.id/pembelajaran/getabsenmhs", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "cookie": 'ci_session=' + this.session,
            },
            "referrer": "https://student.amikompurwokerto.ac.id/presensi",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": 'thn_akademik=2023%2F2024&semester=1&makul=' + kodematkul,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        const bodyoftext = await request.text();
        const getTotalPresentase = bodyoftext?.split("Total Prosentase Hadir (H)</td><td style='text-align:center;'>")[1]?.split('</td>')[0]
        var totalProsentase = !getTotalPresentase ? '100' : getTotalPresentase
        if (bodyoftext.includes('edit_presensikehadiran')) {
            const getJumlahAbsen = bodyoftext.split('edit_presensikehadiran')
            const spl = getJumlahAbsen.slice(1);
            const getmapping = spl.map(a => mapgetAbs(a))
            var res = {
                status: 200,
                result: getmapping,
                total_presentase: totalProsentase
            }
        } else {
            var res = {
                status: 403,
                result: "error, tidak ada presensi yang harus di validasi.",
                total_presentase: totalProsentase
            }
        }
        return res;
    }

    async addAbsen(idpresensidosen) {
        const getPresensiDosen = await fetch('https://student.amikompurwokerto.ac.id/pembelajaran/ajax_editpresensi/' + idpresensidosen, {
            "headers": {
                "accept": "application/json, text/javascript, */*; q=0.01",
                "accept-language": "en-US,en;q=0.9",
                "x-requested-with": "XMLHttpRequest",
                "cookie": 'ci_session=' + this.session,
                "Referer": "https://student.amikompurwokerto.ac.id/presensi",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": null,
            "method": "GET"
        });
        const presensiIDdosen = await getPresensiDosen.json()
        const idPresensiMhs = presensiIDdosen.id_presensi_mhs
        const idPresensiDsn = presensiIDdosen.id_presensi_dosen
        const kuliah_id = presensiIDdosen.kuliah_tp_id
        const request = await fetch("https://student.amikompurwokerto.ac.id/pembelajaran/update_presensimhs", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "cookie": 'ci_session=' + this.session,
            },
            "referrer": "https://student.amikompurwokerto.ac.id/presensi",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": `jenispilih=teori&idpresensimhstexs=${idPresensiMhs}&idpresensidosen=${idPresensiDsn}&kuliahteori=${kuliah_id}&kuliahpraktek=&kesesuaian_perkuliahan=1&kesesuaian_materi=1&penilaianmhs=4&kritiksaran=`,
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
        });
        const bodyoftext = await request.text();
        return bodyoftext;
    }
}

module.exports = getMatkul;
