// listUserInfo.js
const mongoose = require('mongoose');
const User = require('../models/User');
const RecognitionResult = require('../models/RecognitionResult');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/photoflow', { useNewUrlParser: true, useUnifiedTopology: true });
    const users = await User.find().limit(5).lean();
    console.log('Sample users:', users.map(u => ({_id:u._id, email:u.email})));
    // fetch recent recognition results
    const recent = await RecognitionResult.find().sort({createdAt:-1}).limit(5).lean();
    console.log('Recent RecognitionResults count:', recent.length);
    if (recent.length) {
      console.log('Latest result:', {
        _id: recent[0]._id,
        userId: recent[0].userId,
        matchedCount: recent[0].matchedPhotos?.length,
        highestConfidence: recent[0].highestConfidence,
        matchedPhotoIds: recent[0].matchedPhotos.map(p=>p.photoId)
      });
    }
    await mongoose.disconnect();
  } catch (e) { console.error('Error', e); }
})();
