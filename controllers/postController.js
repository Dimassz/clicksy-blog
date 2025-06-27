const Post = require('../models/Post');
const User = require('../models/User'); // Untuk memastikan user_id ada
const { Sequelize } = require('sequelize'); // Untuk menangani error duplikasi

// Fungsi helper untuk membuat slug dari judul
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Hapus karakter non-alphanumeric kecuali spasi dan hyphen
        .replace(/\s+/g, '-')       // Ganti spasi dengan hyphen
        .replace(/-+/g, '-');       // Hapus hyphen berulang
};

// Fungsi untuk membuat artikel baru
const createPost = async (req, res) => {
    const {
        userId,       // ID penulis (dari user yang sedang login, atau hardcode untuk testing)
        title,
        content,
        excerpt,
        thumbnailUrl,
        status,       // 'draft' atau 'published'
        publishedAt
    } = req.body;

    // 1. Validasi Input Dasar
    if (!userId || !title || !content) {
        return res.status(400).json({ message: 'Mohon lengkapi semua field yang wajib: userId, title, dan content.' });
    }

    try {
        // 2. Verifikasi userId (opsional, tapi sangat direkomendasikan)
        // Pastikan user dengan userId tersebut ada dan memiliki izin untuk menulis
        const author = await User.findByPk(userId);
        if (!author) {
            return res.status(404).json({ message: 'Penulis (userId) tidak ditemukan.' });
        }
        // Jika Anda memiliki sistem peran, Anda bisa menambahkan validasi di sini:
        // if (author.role !== 'admin' && author.role !== 'author') {
        //     return res.status(403).json({ message: 'Anda tidak memiliki izin untuk membuat postingan.' });
        // }

        // 3. Generate Slug
        let slug = generateSlug(title);
        // Pastikan slug unik (jika ada post dengan judul serupa)
        let slugExists = await Post.findOne({ where: { slug: slug } });
        let counter = 1;
        while (slugExists) {
            slug = `${generateSlug(title)}-${counter}`;
            slugExists = await Post.findOne({ where: { slug: slug } });
            counter++;
        }

        // 4. Buat dan simpan post baru
        const newPost = await Post.create({
            userId,
            title,
            slug,
            content,
            excerpt: excerpt || content.substring(0, 150) + '...', // Buat excerpt otomatis jika tidak ada
            thumbnailUrl,
            status: status || 'draft',
            publishedAt: status === 'published' ? (publishedAt || new Date()) : null, // Set publishedAt jika status published
            viewCount: 0,
        });

        res.status(201).json({
            message: 'Artikel berhasil dibuat!',
            post: newPost,
        });

    } catch (error) {
        // Tangani error duplikasi slug (walaupun sudah ada pengecekan uniqueness di atas, ini sebagai fallback)
        if (error instanceof Sequelize.UniqueConstraintError) {
            return res.status(409).json({ message: 'Judul artikel ini sudah ada. Mohon gunakan judul lain.' });
        }
        console.error('Error saat membuat artikel:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.', error: error.message });
    }
};

// Fungsi lain (misalnya getPosts, getPostById, updatePost, deletePost) akan ditambahkan di sini

// Fungsi untuk mendapatkan satu artikel berdasarkan slug
const getPostBySlug = async (req, res) => {
    const { slug } = req.params; // Mengambil slug dari parameter URL

    try {
        const post = await Post.findOne({
            where: { slug: slug, status: 'published' }, // Hanya ambil yang statusnya published
            include: [{ // Mengambil data penulis juga
                model: User,
                as: 'author', // Alias yang Anda definisikan di models/associations.js
                attributes: ['id', 'username', 'firstName', 'lastName', 'profilePictureUrl', 'bio'] // Pilih field yang ingin ditampilkan
            }]
        });

        if (!post) {
            // Jika artikel tidak ditemukan atau statusnya bukan published
            return res.status(404).json({ message: 'Artikel tidak ditemukan.' });
        }

        // Opsional: Tingkatkan view_count setiap kali artikel diakses
        post.viewCount = (post.viewCount || 0) + 1;
        await post.save(); // Simpan perubahan viewCount ke database

        res.status(200).json({
            message: 'Artikel berhasil ditemukan.',
            post: post,
        });

    } catch (error) {
        console.error('Error saat mengambil artikel berdasarkan slug:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server.', error: error.message });
    }
};


module.exports = {
    createPost,
    getPostBySlug,
    // ... fungsi lain
};