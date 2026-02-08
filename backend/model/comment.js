const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema(
    {
        postId: { type: Schema.Types.ObjectId, ref: 'Blog', required: [true, 'Post is required'], index: true },
        name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
        email: { type: String, trim: true, maxlength: 120 },
        message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 2000 },
        approved: { type: Boolean, default: false, index: true },
    },
    { timestamps: true, collection: 'comments' }
);

module.exports = mongoose.model('Comment', commentSchema);
