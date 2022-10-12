let getSession = require('./functions/getsession');
let getMatkul = require('./functions/getMatkul');
const fetch = require('node-fetch');
var cron = require('node-cron');
const TelegramBot = require('node-telegram-bot-api');
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const token = '5370265143:AAHZgO-WbefEInSssSQUqoSO0K3_pvCZX5o';

//let session = new getSession('21SA1139', '59962');

/*cron.schedule('00 10 * * Monday', () => {
    console.log('running on Sundays of January and September');
    let session2 = new getMatkul('bf289eb7905595c6bb9e152147bb3b55a903a8a4');

    session2.getAll().then(a => {
        console.log(a)
    })
});

cron.schedule('46 17 * * Thursday', () => {
    console.log('Its Work');
}, {
    scheduled: true,
    timezone: "Asia/Jakarta"
});*/

/*let session2 = new getMatkul('');

console.log('Memulai absensi..')

session2.getInfo().then(async a => {
    console.log(a)
});*/

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = `👋 <b>Selamat Datang di Bot Validasi Amikom</b>

Untuk memulai validasi semua mata kuliah silahkan ketik: 
/absenall nim|password_web_student

<b>Contoh:</b> /absenall 21SA1123|554123
`

  bot.sendMessage(chatId, resp, { parse_mode:'HTML' });
});
// Matches "/echo [whatever]"
bot.onText(/\/absenall (.+)/, async(msg, match) => {
   
    const chatId = msg.chat.id;
    const resp = match[1];
    if (!resp.includes('|')) {
        bot.sendMessage(chatId, "Format pesan harus benar.\n\nContoh: /absenall nim|password");
    } else {
        const nim = resp.split('|')[0]
        const pass = resp.split('|')[1]
        let session = new getSession(nim, pass);
        let loginacc = await session.login()
        if (loginacc.status == true) {
            bot.sendMessage(chatId, `<b>✅ [ Login Berhasil ]</b>`,{ parse_mode:'HTML' });
            const getsesi = loginacc.responseheaders.replace('ci_session=', '')
            const session2 = new getMatkul(getsesi);
            const infouser = await session2.getInfo()
            const infomatkul = await session2.getAll()
            const matkulall = infomatkul.result.join('\n\n')
            const infolog = `[INFO LOGIN] ~> ${nim} | ${infouser.nama}`
            console.log(infolog)
            const infopesanmain = `👋Hai <b>${infouser.nama}</b>
\n<b>📝Informasi Mahasiswa</b>

<b>Nim</b> ${infouser.nim}
<b>No HP</b>${infouser.no_hp}
<b>Email</b>${infouser.email}
<b>Fakultas</b>${infouser.fakultas}
<b>Prodi</b>${infouser.prodi}
<b>Angkatan</b>${infouser.angkatan}
<b>Pembimbing Akademik</b><i>${infouser.pembimbing_akademik}</i>
<b>Total SKS:</b> ${infouser.sks}
<b>IPK:</b> ${infouser.ipk}
<b>SKS yang diambil:</b> ${infouser.sks_now}

=============================

<b>Mata Kuliah Yang Diambil</b>

${matkulall.replace(/>/g, '\n')}

`
            bot.sendMessage(chatId, `${infopesanmain}`,{parse_mode:'HTML'});
            await delay(3000)
            for (let i = 0; i < infomatkul.result.length; i++) {
                const kode_matkul = infomatkul.result[i].split('  >')[0]
                const matkul = infomatkul.result[i].split('  >')[1]
                const addlogin = await session2.getAbsensi(kode_matkul)
                if (addlogin.status == 200) {
                    if (addlogin.result.length > 1) {
                        for (let i = 0; i < addlogin.result.length; i++) {
                            const getabs = addlogin.result[i].idp_dosen
                            const validates = await session2.addAbsen(getabs)
                            const validate = validates.includes('true') ? 'Absen berhasil.' : 'Absen gagal.'
                            bot.sendMessage(chatId, `<b>[ABSENSI]</b> \n<i>Mata Kuliah:</i>\n<b>${matkul}</b> \n\nResponse: <b>${validate}</b>`,{parse_mode:'HTML'});
                        }
                    } else {
                        const getabs = addlogin.result[0].idp_dosen
                        const validates = await session2.addAbsen(getabs)
                        const validate = validates.includes('true') ? 'Absen berhasil.' : 'Absen gagal.'
                        bot.sendMessage(chatId, `<b>[ABSENSI]</b> \n<i>Mata Kuliah:</i>\n<b>${matkul}</b> \n\nResponse: <b>${validate}</b>`,{parse_mode:'HTML'});
                    }
                } else {
                    bot.sendMessage(chatId, `<i>Mata Kuliah:</i>\n<b>${matkul}</b>\nStatus Absensi: <b><i>${addlogin.total_presentase}%</i></b>`,{parse_mode:'HTML'});
                }
            }

        } else {
            bot.sendMessage(chatId, `<b>❌ [ Login Gagal ]</b> \n\n<i>nim/password anda salah!</i>`,{parse_mode:'HTML'});
        }
    }
});