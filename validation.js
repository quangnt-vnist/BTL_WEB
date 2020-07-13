// Validate
const Joi = require('joi');

// register validation
exports.registerValidate = (data) => {
    const schema = {
        name: Joi.string().min(6).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
        role: Joi.string().required(),
        // sex: Joi.string().required()
    };
    return Joi.validate(data, schema);
}

// login validation
exports.loginValidate = (data) => {
    const schema = {
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(6).required(),
    };
    return Joi.validate(data, schema);
}


// module.exports.registerValidate = registerValidate;
// module.exports.loginValidate = loginValidate;