const User = require('./User');
const Post = require('./Post');
// Anda akan mengimpor semua model lain di sini juga jika ada:
// const Category = require('./Category');
// const Tag = require('./Tag');
// const Comment = require('./Comment');

const defineAssociations = () => {
    // Definisi asosiasi untuk Post
    Post.belongsTo(User, {
        foreignKey: 'userId',
        as: 'author', // Alias untuk join (contoh: Post.findAll({ include: 'author' }))
        onDelete: 'CASCADE' // Jika user dihapus, post-nya juga dihapus
    });

    // Definisi asosiasi untuk User
    User.hasMany(Post, {
        foreignKey: 'userId',
        as: 'posts', // Alias untuk join (contoh: User.findAll({ include: 'posts' }))
        onDelete: 'SET NULL' // Jika user dihapus, user_id di post menjadi NULL (atau CASCADE jika Anda ingin post ikut terhapus)
    });

    // Jika ada asosiasi lain (contoh many-to-many dengan Category dan Tag)
    // Post.belongsToMany(Category, { through: 'PostCategories', foreignKey: 'postId', otherKey: 'categoryId' });
    // Category.belongsToMany(Post, { through: 'PostCategories', foreignKey: 'categoryId', otherKey: 'postId' });

    // Post.belongsToMany(Tag, { through: 'PostTags', foreignKey: 'postId', otherKey: 'tagId' });
    // Tag.belongsToMany(Post, { through: 'PostTags', foreignKey: 'tagId', otherKey: 'postId' });

    // Comment asosiasi
    // Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post', onDelete: 'CASCADE' });
    // Comment.belongsTo(User, { foreignKey: 'userId', as: 'commenter', onDelete: 'SET NULL' });
    // Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies', onDelete: 'CASCADE' });
};

module.exports = defineAssociations;