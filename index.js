const { Client, LocalAuth } = require('whatsapp-web.js');
const schedule = require('node-schedule');
const dayjs = require('dayjs'); 
require('dayjs/locale/id');
dayjs.locale('id');

const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');

const PUBLIC_DIR = path.join(__dirname, 'public');
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);

app.get('/', (req, res) => res.send('WhatsApp Bot is running ✅'));

app.get('/khataman-qr.png', (req, res) => {
  const file = path.join(PUBLIC_DIR, 'khataman-qr.png');
  if (fs.existsSync(file)) {
    res.sendFile(file);
  } else {
    res.status(404).send('QR belum tersedia. Tunggu beberapa detik setelah service start.');
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('🌐 Server Express aktif di port', process.env.PORT || 3000);
});

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ]
  }
});

client.on('qr', async qr => {
  console.log('📸 Membuat file QR: public/khataman-qr.png');
  try {
    await qrcode.toFile(path.join(PUBLIC_DIR, 'khataman-qr.png'), qr);
    console.log('✅ QR disimpan. Buka: https://<your-service>.onrender.com/khataman-qr.png');
  } catch (err) {
    console.error('❌ Gagal menyimpan QR:', err);
  }
});

client.on('authenticated', () => {
  const file = path.join(PUBLIC_DIR, 'khataman-qr.png');
  if (fs.existsSync(file)) fs.unlinkSync(file);
});
client.on('auth_failure', msg => console.log('❌ Gagal autentikasi:', msg));

client.on('ready', async () => {
    const chats = await client.getChats();
    const groups = chats.filter(chat => chat.isGroup);

    groups.forEach(g => console.log(`${g.name} — ${g.id._serialized}`));

    schedule.scheduleJob({ rule: '0 0 1 * *', tz: 'Asia/Jakarta' }, async () => {
        const listItems = await generateList();

        const groupId = '120363020764873774@g.us';
        const chat = await client.getChatById(groupId);

        await chat.sendMessage(listItems);
    });
});

client.initialize();

async function generateList() {
    const names = [
        'Aliyah', 'Epa', 'Abubakar', 'Lubna', 'Zaki', 'Wasilah', 'Sakinah', 'Reza',
        'Farhan', 'Patema', 'Hasyim', 'Ja\'far', 'Muhammad', 'Zainab', 'Shammy',
        'Taufik', 'Chila', 'Fadlia', 'Aluyah', 'Hani', 'Wanja', 'Aliyah Alkaf', 'Nisa',
        'Ibu Ayya', 'Hanif', 'Ica', 'Ima', 'Fauziah', 'Tika', 'Aminah'
    ];

    const now = dayjs();
    const offset = 9; // Oktober
    const shift = (now.month() - offset + names.length) % names.length;

    const rotated = [
        ...names.slice(shift),
        ...names.slice(0, shift)
    ];

    const start = now.startOf('month').format('D MMMM YYYY');
    const end = now.endOf('month').format('D MMMM YYYY');

    const list = rotated.map((name, i) => ({
        name,
        juz: i + 1
    }));

    let text = `*Khataman keluarga Habib Ja'far bin Abdullah Assegaf*\n`;
    text += `~ ${start} s/d ${end}\n\n`;

    list.forEach(item => {
        text += `Juz ${item.juz} ${item.name}\n`;
    });

    return text;
}

// 6281278309335-1533390344@g.us --> Habib Ja'far
