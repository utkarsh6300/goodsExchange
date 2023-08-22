const jwt=require('jsonwebtoken');
const config=require('config');
module.exports= function (req,res,next) {
 //get token from header
 const token=req.header('token');


 //check if not token
 if(!token){
     return res.status(401).json({erorrs:[{msg:"No token,authorization denied"}]});
 }
// verify token
try{
    const decoded=jwt.verify(token,process.env.jwtSecret||config.get('jwtSecret'));
    // console.log(decoded);
    req.user=decoded.user;

    next();
}catch(err){
  res.status(401).json({erorrs:[{msg:"Token is not valid"}]});
}

}

