const express = require("express");

const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const {response} = require('express');


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
  password:Sequelize.STRING,
},{tableName:"tbl_users"} 
);
// executing the command to create table
tbl_users.sync();

// create user account
app.post("/createuser",async(req,res)=>{
      const {firstname,lastname,email,username,phone}=req.body
      const password = await bcrypt.hash(req.body.password,10);
      if(firstname ==""){
      return res.status(201).json({message:" please fill your firstname"})
      }else if(lastname ==""){
      return res.status(201).json({message:" please enter your lastname"})
      }else if(email ==""){
      return res.status(201).json({message:" please enter your email"})
      }else if(username ==""){
      return res.status(201).json({message:" please enter your username"})
      }else if(phone ==""){
      return res.status(201).json({message:" please enter your phone number"})
      }else if(req.body.password ==""){
      return res.status(201).json({message:" please enter your password"})
      }
        if(req.body.password.length < 8){
         return res.status(201).json({message:" the password is too short,please  your password length should be 8 characters and above"})
        }else if(phone.length < 11){
         return res.status(201).json({message:" your phone number digits is incomplete"})
        }
        const RecordExist = await tbl_users.findOne({where:{email:email}});
          if(RecordExist){
            return res.status(201).json({message:" Sorry! this user already Exist"})
            }else{ 
              const SaveUser = tbl_users.build({
                firstname,
                lastname,
                email,
                username,
                phone,
                password
            })
            await SaveUser.save();
            return res.status(200).json({message:" Account Created Successfully"});
            
            }

})





const port = 1000;
app.listen(port,()=>{
 console.log(' server running at port '+port);
})