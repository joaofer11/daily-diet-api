import { FastifyReply } from 'fastify';

export const sendMissingFieldsMessage = (missingFields: string[], res: FastifyReply) =>
  res
    .status(400)
    .send({ error: `The fallowing fields is required: ${missingFields}`});
