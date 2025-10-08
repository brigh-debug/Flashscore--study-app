import { FastifyRequest, FastifyReply } from "fastify";

interface PaymentBody {
  amount: number;
}

export const processPayment = async (
  request: FastifyRequest<{ Body: PaymentBody }>,
  reply: FastifyReply
) => {
  const { amount } = request.body;

  if (!amount) {
    return reply.status(400).send({ error: "Amount is required" });
  }

  return reply.send({
    message: `Payment of ₦${amount} processed successfully`,
  });
};