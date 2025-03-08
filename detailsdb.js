const mongoose = require('mongoose');

main().catch((err) => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/couponSpace');
}
  
  // Define mongoose schema
const contactSchema = new mongoose.Schema({
    name: {
        type : String,
        required : true
    },
    phone: {
        type : Number,
        required : true
    },
    email: {
        type : String,
        required : true
    },
    couponName: {
        type : String,
        required : true
    },
    details: {
        type : String,
        required : true
    },
    expiry: {
        type : Date,
        required : true
    }
});
  
const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;