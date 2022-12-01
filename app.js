require('dotenv').config();
const express = require("express");
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const {Sequelize, QueryTypes} = require("sequelize");
const bcrypt = require("bcrypt");
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const { validatecreateuser, validatelogin, validateadminlogin } = require("./validator");


const { response } = require('express');
const { string } = require("joi");
const { reset } = require('nodemon');


// configuring the url
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// test routing
// app.get('/',(req,res)=>{
//  return res.status(200).json({message:" testing routing"});
// })

// linking to database via sequelize
const sequelize = new Sequelize('AgroApp', 'root', '', {
  dialect: "mysql",
});
// test the connection
sequelize.authenticate().then(() => {
  console.log(' connection to database is successful');
}).catch((error) => console.log(error, ' sorry an eror'));

// desing users  table
const tbl_users = sequelize.define('tbl_users', {
  firstname: Sequelize.STRING,
  lastname: Sequelize.STRING,
  email: Sequelize.STRING,
  username: Sequelize.STRING,
  phone: Sequelize.STRING,
  role: Sequelize.STRING,
  password: Sequelize.STRING,
}, { tableName: "tbl_users" }
);
// executing the command to create table
tbl_users.sync();

// design admin table 
const tbl_admin = sequelize.define('tbl_admin', {
  username: Sequelize.STRING,
  password: Sequelize.STRING
}, { tableName: "tbl_admin" });
// executing the command to create table
tbl_admin.sync();
 
// design farmer table
const tbl_farmer = sequelize.define('tbl_farmer',{
  farmername:Sequelize.STRING,
  poultryname:Sequelize.STRING,
  phone:Sequelize.STRING,
  filename:Sequelize.STRING,
}, {tableName: "tbl_farmer"}) 
 // execute the command to create table
 tbl_farmer.sync();

// design farmer product table
const tbl_farmer_product = sequelize.define('tbl_farmer_product',{
   farmer_id:Sequelize.STRING,
   productname:Sequelize.STRING,
   price:Sequelize.STRING,
   filename:Sequelize.STRING,
}, {tableName:"tbl_farmer_product"})
// execute the command to create table
tbl_farmer_product.sync();

// Start file upload using multer
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      const dir = "uploads/";
      !fs.existsSync(dir) && fs.mkdirSync(dir);
      callback(null, "uploads/");
    },
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      let ext = file.originalname.lastIndexOf(".");
      ext = file.originalname.substr(ext + 1);
      callback(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
    },
  });
  const upload = multer({ storage }); 

    //farmer can upload his/her profile details here
  app.post("/uploadfarmer_profile", upload.single("file"), (req, res) => {
      //res.json({file: req.file});
      const {farmername,poultryname,phone} = req.body;
       try {
            const CheckUserExist =  tbl_farmer.findOne({where:{phone:phone,farmername:farmername}});
            if(CheckUserExist){
            return res.status(200).json({message:" Farmer profile Already Exist"});
            }else{
            const Createfarmer = tbl_farmer.build({
                farmername,
                poultryname,
                phone,
                filename: req.file.filename
                });
                Createfarmer.save();
                return res.status(200).json({message:' Farmers product created you can proceed to your dashboard'});
            }

       }catch(err){
        res.send({message:err});
       }
        res.json({ file: req.file.filename });
    }); 

     // uploading farmer product 
    app.post("/uploadfarmer_prod", upload.single("file"),(req,res) =>{
      const {farmer_id,productname} = req.body;
      try {
           const CreatefarmerProduct = tbl_farmer_product.build({
               farmer_id,
               productname,
               filename: req.file.filename
               });
               CreatefarmerProduct.save();
               return res.status(200).json({message:' Farmers Product uploaded successfully'});

      }catch(err){
       res.send({message:err});
      }
       //res.json({ file: req.file.filename })
    
     });

      // farmer can upload many products
      // app.post("/uploadfarmer_prod/multiple", upload.array("file", 4), (req, res) => {
      //       const farmer_id = req.body.farmer_id;
      //       const productname = req.body.productname;
      //       console.log(productname);
      //       const CreateFarmerProd = tbl_farmer_product.build({
      //         farmer_id,
      //         productname,
      //         filename:req.files.filename
      //       });
      //       CreateFarmerProd .save();
      //       res.send(' product created');
      //       //res.json({ files: req.files });
            
      // });
// End of file upload 

   // click and view farmers product
   app.get('/viewfarmersproduct/:id', async (req,res) => {
        try {
          const farmer_id = (req.params.id);
          const [results, metadata] = await sequelize.query(`SELECT * FROM tbl_farmer_product JOIN tbl_farmer ON tbl_farmer_product.farmer_id = tbl_farmer.id WHERE tbl_farmer_product.farmer_id =${farmer_id}` );
            if(results){
               res.status(200).json({Details:results})
            }else{
              return res.sendStatus(403).json({message:" error"});
            }
          
        } catch(err){
          res.send({message:err});
        }


   });


  app.get('/buyproduct/:id',async(req,res) =>{
      const user_id = req.params.id;
      const farmerinfo =  await tbl_farmer.findOne({where:{id:user_id}});
      if(farmerinfo){
        const img = await tbl_farmer_product.findOne({where:{farmer_id:user_id}});
        res.send([{message:{farmerName:farmerinfo.farmername}},{Phonenumber:farmerinfo.phone},{Poultryname:farmerinfo.poultryname},{productimage:img.filename},{price:img.productprice},{productprice:img.price}]  )

        }else{
      return res.json({message:" Record Not Found "})
        }

  
  })



//product search function by customer 
app.get('/search_product/:key', async (req, res) => {
  try {
    const searchkeys = (req.params.key);
    if (searchkeys) {
      const search = await tbl_users.findAll({
        "$or": [
          { name: { $regex: req.params.searchkeys } }
        ]

      })
      res.send(search)
    } else {
      return res.send({ message: " Product Not Found " })
    }
  } catch (error) {
    return res.status(201).json({ message: error });
  }

})
// display farmer profile
app.get('/displayfarmer_profile',async(req,res) => {
   const getall = await tbl_farmer.findAll();
    try{
      return res.status(200).json({message:getall});
    }catch(err){
     return res.status(201).json({message:err});
    }

});

//  Admin login  account
app.post("/adminlogin", async (req, res) => {
  try {
    const { error, value } = validateadminlogin(req.body);
    if (error) {
      console.log(error);
      return res.send({ message: error.details });
    }
    const { username, password } = req.body;
    const CheckUser = await tbl_admin.findOne({ where: { username: username, password: password } })
    if (CheckUser) {
      return res.status(200).json({ message: " Admin login was sucessful " })
    } else {
      return res.status(201).json({ message: " Incorrect Admin login details " })
    }
  } catch (err) {
    console.log({ message: err });

  }



});

// create user account
app.post("/createuser", async (req, res) => {

  try {
    const { error, value } = validatecreateuser(req.body);
    if (error) {
      console.log(error);
      return res.send({ message: error.details });
    }

    const { firstname, lastname, email, username, phone, role } = req.body
    const password = await bcrypt.hash(req.body.password, 10);
    // if(req.body.password.length < 8){
    //  return res.status(201).json({message:" the password is too short,please  your password length should be 8 characters and above"})
    // }

    const RecordExist = await tbl_users.findOne({ where: { email: email } });
    if (RecordExist) {
      return res.status(201).json({ message: " This user already Exist, please Login" })
    } else {
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
      return res.status(200).json({ message: " Account Created Successfully" });

    }
  } catch (err) {
    console.log({ message: err });

  }


});

// user login module 
app.post("/login", async (req, res) => {
  try {
    const { error, value } = validatelogin(req.body);
    if (error) {
      console.log(error);
      return res.send({ message: error.details });
    }
    // const {email,password} = req.body;
    const { email, password } = req.body;
    const UserExist = await tbl_users.findOne({ where: { email: email } })
    if (UserExist && (await bcrypt.compare(password, UserExist.password) && (UserExist.role == 'customer'))) {
      console.log(test);
      //takes you to customers dashboard afer login
      return res.status(200).json({ message: " SUCCESS, you are loggedin as a  " + UserExist.role });
    } else if (UserExist && (await bcrypt.compare(password, UserExist.password) && (UserExist.role == 'farmer'))) {
      // takes you to farmer dashboard after login
      return res.status(200).json({ message: " SUCCESS, you are loggedin as  " + UserExist.role });
    } else if (UserExist && (await bcrypt.compare(password, UserExist.password) && (UserExist.role == 'admin'))) {
      // takes you to admin dashboard after login
      return res.status(200).json({ message: " SUCCESS, you are loggedin as an  " + UserExist.role });
    } else {
      return res.status(401).json({ message: " Incorrect! please check your login credentials " });
    }

  } catch (error) {
    console.log(error);
  }

});




// using jwt
// const posts = [
//      {
//       username:'miller',
//       title: 'Mr'
//     },
//     {
//      username:'Maryan',
//      title: 'Mrs'
//     }
// ] 


//  display customer profile
app.get('/post', authenticatetoken, (req, res) => {
  //  res.json(posts.filter(post => post.username === req.user.name));
  const result = { customerdetails: req.user}
 
  res.send(result)

})
    

app.post('/test/login', async (req, res) => {
  console.log(" test");
  const { email, password } = req.body;
  const UserExist = await tbl_users.findOne({ where: { email: email } })
  const userID = UserExist.id;
  const profile = UserExist.firstname + ' ' + UserExist.lastname;
  const profileid = Math.random();
  const user = { customername: profile, customerID: profileid, ID:userID}
  if (UserExist.email && UserExist.role == 'customer' && (await bcrypt.compare(password, UserExist.password))) {
    const accesstoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accesstoken: accesstoken });
  } else if (UserExist.email && UserExist.role == 'farmer' && (await bcrypt.compare(password, UserExist.password))) {
    const accesstoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accesstoken: accesstoken });
  } else if (UserExist.email && UserExist.role == 'admin' && (await bcrypt.compare(password, UserExist.password))) {
    const accesstoken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accesstoken: accesstoken });
  } else {
    return res.status(201).json({ message: " Acount does not exist! please create an account" })
  }

});

// creating authenticate middle ware
function authenticatetoken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // return header if it is defined
  if (token == null) return res.status(401); // check fortoken error
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403) // invalid token error
    req.user = user; // set user object
    next()
  })


}

// file upload
app.post('/upload', function (req, res) {
  console.log(" upload is working");

});




const port = 100;
app.listen(port, () => {
  console.log(' server running at port ' + port);
})