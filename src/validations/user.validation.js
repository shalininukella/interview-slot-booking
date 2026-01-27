// These are the fields the client is allowed to send.

import Joi from "joi";

export const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid("ADMIN", "CANDIDATE").required(),
});
