const Joi = require('joi');
const validator = (schema) =>(payload) =>
 schema.validate(payload, {abortEarly: false})

 // validation shema using Joi
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