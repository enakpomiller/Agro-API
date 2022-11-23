const { string } = require('joi');
const Joi = require('joi');


const validator = (schema) =>(payload) =>
 schema.validate(payload, {abortEarly: false}) // payload for create user schema

 // validation of create user  shema using Joi
const CreateUserSchema = Joi.object({
    firstname:Joi.string().required(),
    lastname:Joi.string().required(), 
    email:Joi.string().required().email(), 
    username:Joi.string().required(),
    phone:Joi.string().required().min(11).max(15),
    role:Joi.string().required(),
    password:Joi.string().required().min(8).max(10),
    confirmPassword:Joi.ref("password"), 
  });
  exports.validatecreateuser = validator(CreateUserSchema);


   // payoad for login schema
  const validatorLogin = (schema) =>(payload) =>
    schema.validate(payload, {abortEarly: false})

 // validation of login shema using Joi
  const CreateUserLoginSchema = Joi.object({
    email:Joi.string().required().email(),
    password:Joi.string().required().min(8).max(10),
  });
  exports.validatelogin = validatorLogin(CreateUserLoginSchema);


// payload of admin login schema
const validateadminlogin = (schema) =>(payload) =>
schema.validate(payload, {abortEarly: false})

 const adminloginschema = Joi.object({
  username:Joi.string().required(),
  password:Joi.string().required().min(4).max(8)
});

exports.validateadminlogin = validateadminlogin(adminloginschema);
