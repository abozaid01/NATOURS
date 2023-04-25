const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please, Enter your name!'],
    },
    email: {
        type: String,
        required: [true, 'Please, Enter your email!'],
        unique: true,
        lowercase: true,
        validate: [
            validator.isEmail,
            'Please, Enter a valid Email!',
        ],
    },
    photo: String,
    password: {
        type: String,
        required: [true, 'Please, Enter your password!'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please, Confirm your password!'],
        validate: {
            //This only for save, if you want to update use save or create
            validator: function (el) {
                return this.password === el;
            },
            message: 'Passwords are not the same!',
        },
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified()) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;

    next();
});

userSchema.methods.checkPassword = async function (
    password,
    hasedPassword
) {
    return await bcrypt.compare(password, hasedPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
