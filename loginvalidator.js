const { string } = require('joi');
const Joi = require('joi');

const validator = (schema) =>(payload) =>
    schema.validate(payload, {abortEarly: false})


 // validation shema using Joi
const CreateUserSchema = Joi.object({
    email:Joi.string().required().email(),
    password:Joi.string().required(),
  });



  exports.validatelogin = validator(CreateUserSchema);

