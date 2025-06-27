const User = require('../models/User'); // Import model User
const bcrypt = require('bcryptjs'); // Tidak perlu lagi di sini karena sudah di hook model, tapi good practice untuk login
const { Sequelize } = require('sequelize'); // Untuk menangani error duplikasi

// Fungsi untuk register user baru
const registerUser = async (req, res) => {
     console.log('Isi req.body:', req.body);
    const { username, email, password, role, firstName, lastName, bio, profilePictureUrl } = req.body;

    // 1. Validasi Input Dasar
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Mohon lengkapi semua field yang wajib: username, email, dan password.' });
    }

    // Validasi format email (opsional, sudah ada di Sequelize model validate: isEmail)
    // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    //     return res.status(400).json({ message: 'Format email tidak valid.' });
    // }

    // Validasi panjang password (opsional)
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password minimal harus 6 karakter.' });
    }

    try {
        // 2. Cek apakah username atau email sudah terdaftar
        // Sequelize hook User.beforeCreate sudah menghandle hashing password
        const newUser = await User.create({
            username,
            email,
            password, // Password akan di-hash oleh hook beforeCreate di model
            role: role || 'subscriber', // Default role jika tidak diberikan
            firstName,
            lastName,
            bio,
            profilePictureUrl,
        });

        // Hapus password dari objek yang akan dikirim ke client (penting untuk keamanan)
        const userResponse = newUser.toJSON(); // Konversi instance Sequelize ke plain object
        delete userResponse.password;

        res.status(201).json({
            message: 'Registrasi pengguna berhasil!',
            user: userResponse,
        });

    } catch (error) {
        // Tangani error duplikasi (misalnya username atau email sudah terdaftar)
        if (error instanceof Sequelize.UniqueConstraintError) {
            const field = error.errors[0].path;
            const value = error.errors[0].value;
            return res.status(409).json({
                message: `Pengguna dengan ${field} '${value}' sudah terdaftar.`,
                field: field,
            });
        }

        console.error('Error saat mendaftar user:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.', error: error.message });
    }
};

module.exports = {
    registerUser,
};