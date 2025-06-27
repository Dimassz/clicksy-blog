const express = require('express');
const path = require('path');
require('dotenv').config(); 
const { connectDB, sequelize } = require('./config/database');

const userRoutes = require('./routes/userRoutes'); 
const postRoutes = require('./routes/postRoutes');

const User = require('./models/User');
const Post = require('./models/Post');

const defineAssociations = require('./models/associations'); 

const app = express();
const port = process.env.PORT || 3000; // penting: gunakan process.env.PORT

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//API
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes); 

app.get('/', (req, res) => {
  res.render('index')
});

defineAssociations();

// --- DEFINISIKAN RUTE UNTUK HALAMAN ARTIKEL ---
app.get('/article/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        // Panggil API Anda sendiri (internal server request)
        // Atau, lebih baik, panggil langsung fungsi controller-nya
        const post = await Post.findOne({ // Menggunakan model langsung di sini
            where: { slug: slug, status: 'published' },
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'firstName', 'lastName', 'profilePictureUrl', 'bio']
            }]
        });

        if (!post) {
            return res.status(404).render('404', { title: 'Artikel Tidak Ditemukan' }); // Asumsi Anda punya template 404.ejs
        }

        // Opsional: Tingkatkan view_count saat halaman diakses
        post.viewCount = (post.viewCount || 0) + 1;
        await post.save();

        res.render('article', {
            title: post.title, // Mengirim judul untuk tag <title>
            article: post.toJSON(), // Kirim objek post ke template EJS. Gunakan toJSON() untuk objek plain
        });

         if (!post) {
            // Jika artikel tidak ditemukan atau statusnya bukan published
            return res.status(404).render('404', { title: 'Artikel Tidak Ditemukan' }); // <--- Pastikan ini
        }

    } catch (error) {
        console.error('Error saat merender halaman artikel:', error);
        res.status(500).render('error', { title: 'Terjadi Kesalahan', message: 'Tidak dapat memuat artikel.' }); // Asumsi Anda punya template error.ejs
    }
});

sequelize.sync({ force: false }) // Ganti jadi false di produksi
    .then(() => {
        console.log('Tabel telah disinkronkan dengan database.');
        // Setelah tabel siap, baru mulai server
        app.listen(port, () => {
            console.log(`Server berjalan di port ${port}`);
        });
    })
    .catch(err => {
        console.error('Gagal mensinkronkan tabel:', err);
    });

connectDB();