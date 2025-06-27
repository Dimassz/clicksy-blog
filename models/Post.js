const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User'); // Import model User karena ada Foreign Key

const Post = sequelize.define('Post', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: { // Kunci asing ke User
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { // Menghubungkan ke tabel 'users'
            model: User,
            key: 'id',
        },
        field: 'user_id', // Nama kolom di database (snake_case)
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    excerpt: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    thumbnailUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'thumbnail_url',
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'draft', // 'draft', 'published', 'archived'
    },
    publishedAt: {
        type: DataTypes.DATE, // Menggunakan DataTypes.DATE untuk TIMESTAMP
        allowNull: true,
        field: 'published_at',
    },
    viewCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'view_count',
    },
}, {
    tableName: 'posts', // Pastikan nama tabel di database adalah 'posts'
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});



module.exports = Post;