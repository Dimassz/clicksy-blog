const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql', // Atur ke 'mysql'
        logging: true, // Atur ke true jika ingin melihat query SQL di konsol
    }
);

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('Koneksi ke database berhasil.');
    } catch (error) {
        console.error('Tidak dapat terhubung ke database:', error);
        process.exit(1); // Keluar dari aplikasi jika koneksi gagal
    }
}

module.exports = { sequelize, connectDB };