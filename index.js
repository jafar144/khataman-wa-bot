const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');
const dayjs = require('dayjs'); 
require('dayjs/locale/id');
dayjs.locale('id');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => qrcode.generate(qr, { small: true }));
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
