import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().required(),
  PORT: Joi.number().required(),

//   DATABASE_URL: Joi.string().required(),

//   JWT_SECRET: Joi.string().required(),
//   JWT_EXPIRES_IN: Joi.string().required(),
});