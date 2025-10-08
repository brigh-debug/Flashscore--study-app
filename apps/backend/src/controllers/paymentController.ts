import { FastifyRequest, FastifyReply } from "fastify";

interface PaymentBody {
  amount: number;
  method?: string; // optional: e.g. "card", "transfer", "wallet"
  userId?: string;
}

export const processPayment = async (
  request: FastifyRequest<{ Body: PaymentBody }>,
  reply: FastifyReply
) => {
  try {
    const { amount, method = "wallet", userId = "anonymous" } = request.body;

    if (!amount) {
      return reply.status(400).send({ success: false, error: "Amount is required" });
    }

    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Generate fake transaction data
    const transaction = {
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      amount,
      method,
      status: "success",
      processedAt: new Date().toISOString(),
      message: `Payment of ₦${amount} via ${method} processed successfully.`,
    };

    return reply.send({
      success: true,
      transaction,
    });
  } catch (error) {
    return reply.status(500).send({
      success: false,
      error: (error as Error).message || "Payment processing failed",
    });
  }
};