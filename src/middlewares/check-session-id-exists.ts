import { FastifyRequest, FastifyReply } from 'fastify';

export const checkSessionIdExists = async (
  req: FastifyRequest, 
  res: FastifyReply
) => {
  const { sessionId } = req.cookies;

  if (!sessionId) {
    res.status(401).send({ error: 'You are unauthorized to execute this operation' });
    return;
  }
}
