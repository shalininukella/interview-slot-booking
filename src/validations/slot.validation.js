// These are the fields the client is allowed to send.

import Joi from "joi";

export const createSlotSchema = Joi.object({
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().required(),
  capacity: Joi.number().integer().min(1).required(),
  tags: Joi.array().items(Joi.string()), // Every item must be a string
  // Optional (because no .required())
});

export const updateSlotSchema = Joi.object({
  startTime: Joi.date().iso(),
  endTime: Joi.date().iso(),
  capacity: Joi.number().integer().min(1),
  tags: Joi.array().items(Joi.string()),
});
