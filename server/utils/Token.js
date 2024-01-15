const jwt = require('jsonwebtoken');

function generateAccessToken(payload) {

    const secret = process.env.secretKey;;
     const options = { 
      // expiresIn: '1d' 
    };
    return jwt.sign(payload, secret, options);
  }


function verifyAccessToken(token) {
    const secret = process.env.secretKey;
    try {
      const decoded = jwt.verify(token, secret);
      return { success: true, data: decoded };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

 module.exports={generateAccessToken,verifyAccessToken} 