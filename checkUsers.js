require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true,useUnifiedTopology:true});
    const users = await User.find({});
    console.log('--- Users in DB ---');
    users.forEach(u=> console.log({email:u.email,role:u.role,password:u.password}));
    process.exit(0);
  } catch(err){
    console.error('Error', err);
    process.exit(1);
  }
})();
