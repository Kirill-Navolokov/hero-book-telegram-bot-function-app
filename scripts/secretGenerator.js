const {randomBytes}=require('crypto');
const sec = randomBytes(32).toString('hex');
console.log('secret='+sec);