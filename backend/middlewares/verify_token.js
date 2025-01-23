const express=require('express');
const router=express.Router();
const jwt=require('jsonwebtoken');


router.get('/',[],async(req,res)=>{
    const token=req.header('token'); 
    if(!token||token==='null'){
  
        return res.status(401).json({errors:[{msg:"No token,authorization denied"}]});
    }
    try{
        const decoded=  await jwt.verify(token,process.env.jwtSecret);
        console.log(decoded);
    res.status(200).json({msg:"Token is  valid"});

} catch (error) {
    console.log(error.message); 
    if(error.message==='invalid token'){
        return res.status(401).json({errors:[{msg:"Token is not valid"}]});
    }
    if(error.message==='jwt expired'){
        return res.status(401).json({errors:[{msg:"Token is expired"}]});
    }
    res.status(500).send('authentication error');
       
}


});

module.exports=router;


