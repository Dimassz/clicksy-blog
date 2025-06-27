const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');
require('./Post');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'subscriber',
    },
    firstName: {
        type: DataTypes.STRING(50),
        field: 'first_name', // Menyesuaikan dengan nama kolom di database (snake_case)
    },
    lastName: {
        type: DataTypes.STRING(50),
        field: 'last_name', // Menyesuaikan dengan nama kolom di database
    },
    bio: {
        type: DataTypes.TEXT,
    },
    profilePictureUrl: {
        type: DataTypes.STRING(255),
        field: 'profile_picture_url', // Menyesuaikan dengan nama kolom di database
    },
}, {
    tableName: 'users', // Pastikan nama tabel di database adalah 'users'
    timestamps: true, // true untuk createdAt dan updatedAt
    createdAt: 'created_at', // Menyesuaikan dengan nama kolom di database
    updatedAt: 'updated_at', // Menyesuaikan dengan nama kolom di database
});


// Hook Sequelize: Hash password sebelum user disimpan ke database
User.beforeCreate(async (user) => {
    if (user.password) {
        const salt = await bcrypt.genSalt(10); // Generate salt
        user.password = await bcrypt.hash(user.password, salt); // Hash password
    }
});

// Metode instance untuk membandingkan password
User.prototype.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;