const express=require('express');
const router=express.Router();
const jwt=require('jsonwebtoken');
const config=require('config');

router.get('/',[],async(req,res)=>{
    const token=req.header('token'); 
    if(!token||token==='null'){
  
        return res.status(401).json({errors:[{msg:"No token,authorization denied"}]});
    }
    try{
        const decoded=  await jwt.verify(token,process.env.jwtSecret||config.get('jwtSecret'));
        console.log(decoded);
    res.status(200).json({msg:"Token is  valid"});

} catch (error) {
    console.log(error); 
    res.status(500).send('authentication error');
       
}


});

module.exports=router;


