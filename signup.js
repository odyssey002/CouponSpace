const mongoose = require('mongoose');

main().catch((err) => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/couponSpace', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

const userSchema = new mongoose.Schema({
    username: {
        type : String,
        required : true
    },
    email: {
        type : String,
        required : true
    },
    password: {
        type : String,
        required : true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;