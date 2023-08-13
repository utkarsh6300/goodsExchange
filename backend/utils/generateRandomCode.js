
function generateOTP() {
          
  // Declare a string variable 
  // which stores all string
  var string = '1234567892567989876543098780999879808768709670214567890887654356789876543245678907654324567897654325679808765432567898765467897654356';
  let OTP = '';
    
  // Find the length of string
  var len = string.length;
  for (let i = 0; i < 6; i++ ) {
      OTP += string[Math.floor(Math.random() * len)];
  }
  return OTP;
}
  module.exports = { generateOTP };