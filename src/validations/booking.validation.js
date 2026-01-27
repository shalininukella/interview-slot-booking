// These are the fields the client is allowed to send.

import Joi from "joi";

export const createBookingSchema = Joi.object({
  slotId: Joi.string().required(),
});
