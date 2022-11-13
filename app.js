const express = require("express");
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const {validatecreateuser} = require ("./validator");
const {response} = require('express');
const { string } = require("joi");


// configuring the url
 const app = express();
 app.use(express.json())
 app.use(express.urlencoded({extended: false}))

// test routing
// app.get('/',(req,res)=>{
//  return res.status(200).json({message:" testing routing"});
// })

// linking to database via sequelize
const sequelize = new Sequelize('AgroApp','root','',{
 dialect:"mysql",
});
// test the connection
sequelize.authenticate().then(()=>{
 console.log(' connection to database is successful');
}).catch((error)=>console.log(error,' sorry an eror'));

// desing the table
const tbl_users = sequelize.define('tbl_users',{
  firstname:Sequelize.STRING,
  lastname:Sequelize.STRING,
  email:Sequelize.STRING,
  username:Sequelize.STRING,
  phone:Sequelize.STRING,
  role:Sequelize.STRING,
  password:Sequelize.STRING,
},{tableName:"tbl_users"} 
);
// executing the command to create table
tbl_users.sync();

// create user account
app.post("/createuser",async(req,res)=>{
   const {error, valu } = validatecreateuser (req.body);
   if(error){
    console.log(error);
    return res.send({message:error.details});
   }

  try{ 
    const {firstname,lastname,email,username,phone,role}=req.body
    const password = await bcrypt.hash(req.body.password,10);
      // if(req.body.password.length < 8){
      //  return res.status(201).json({message:" the password is too short,please  your password length should be 8 characters and above"})
      // }
     
      const RecordExist = await tbl_users.findOne({where:{email:email}});
        if(RecordExist){
          return res.status(201).json({message:" This user already Exist, please Login"})
          }else{ 
            const SaveUser = tbl_users.build({
              firstname,
              lastname,
              email,
              username,
              phone,
              role,
              password
          }) 

          await SaveUser.save();
          return res.status(200).json({message:" Account Created Successfully"});
          
          }
   }catch(err){
   console.log({message:err});
  
  }


});

      // login module 
        app.post("/login",async(req,res)=>{
          try{
          // const {email,password} = req.body;
          const {email}= req.body;
          if(email==""){
            return res.status(201).json({message:" Please enter your email"});
          }
          const UserExist = await tbl_users.findOne({where:{email:email}})
          if(UserExist){
            return res.status(200).json({message:" Email Recorgnized"});
          }else{
            return res.status(401).json({message:" Email Not Recorgnized, Please Create Account"});
            }

          // if(UserExist && (await bcrypt.compare(password,UserExist.password))){
          //  return res.status(200).json({message:" user is found "+UserExist.email});
          // }else{
          //  return res.status(401).json({message:" User not found "});
          // }

          }catch(error){
          console.log(error);
          }

         });


// jwt testing
  app.post("/api/post", verifyToken,  (req,res)=>{
      jwt.verify(req.token, 'SecretKey',(err,authData) =>{
        if(err){
          res.json({message:err});
        }else{
          res.json({message:" post created....",authData});
        }
      
      });


  }); 


app.post("/api/login",(req,res)=>{
  const {id,username,email}=req.body;

      const user = {
       id:id,
       username:username,
       email:email
      }
   jwt.sign({user}, 'SecretKey', {expiresIn:'60s'},(err,token) =>{
    res.json({token})
  
   });// sending as payload


});
  // format of token
  //Aythorization: Bearer <access_token>

  // verify Token
  function verifyToken(req, res, next){
    // get the auth header value
    const bearerHeader = req.headers['authorization'];
    // check if bearer is undefined
    if(typeof bearerHeader !=='undefined'){
      // split at the space
      const bearer = bearerHeader.split(' '); // paased array
      //Get token from array 
      const bearerToken = bearer[1];
      // set the token
      req.token = bearerToken;
      // calling the next middle ware
       next();

    }else{
     // forbiden
     res.sendStatus(403);
    }

  }




const port = 1000;
app.listen(port,()=>{
 console.log(' server running at port '+port);
})