import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { attachKidsModeFlag } from '../middleware/kidsModeFilter';

interface PaymentQuery {
  kidsMode?: string;
}

interface PaymentProcessBody {
  amount: number;
  type: string;
  description?: string;
}

const paymentsRoutes: FastifyPluginAsync = async (fastify) => {
  // Attach kids mode middleware
  fastify.addHook('preHandler', attachKidsModeFlag);

  /**
   * GET /transactions
   */
  fastify.get<{ Querystring: PaymentQuery }>(
    '/transactions',
    async (request: FastifyRequest<{ Querystring: PaymentQuery }>, reply: FastifyReply) => {
      try {
        // Placeholder: Replace with DB query
        const transactions: any[] = [];

        const kidsMode =
          (request as any).kidsMode || request.query.kidsMode === 'true';

        if (kidsMode) {
          const filteredTransactions = transactions.filter((tx) => {
            const isGambling =
              tx.type?.toLowerCase().includes('bet') ||
              tx.type?.toLowerCase().includes('wager') ||
              tx.type?.toLowerCase().includes('deposit') ||
              tx.description?.toLowerCase().includes('gambling');
            return !isGambling;
          });

          return reply.send({ success: true, data: filteredTransactions });
        }

        return reply.send({ success: true, data: transactions });
      } catch (error) {
        request.log.error(error);
        return reply
          .status(500)
          .send({ success: false, error: 'Failed to fetch transactions' });
      }
    }
  );

  /**
   * POST /process
   */
  fastify.post<{ Body: PaymentProcessBody; Querystring: PaymentQuery }>(
    '/process',
    async (
      request: FastifyRequest<{ Body: PaymentProcessBody; Querystring: PaymentQuery }>,
      reply: FastifyReply
    ) => {
      try {
        const { amount, type, description } = request.body;

        const kidsMode =
          (request as any).kidsMode || request.query.kidsMode === 'true';

        if (kidsMode) {
          const isGambling =
            type?.toLowerCase().includes('bet') ||
            type?.toLowerCase().includes('wager') ||
            type?.toLowerCase().includes('deposit') ||
            description?.toLowerCase().includes('gambling');

          if (isGambling) {
            return reply.status(403).send({
              success: false,
              error: 'This payment type is not available in Kids Mode',
            });
          }
        }

        // TODO: Replace with actual payment logic
        return reply.send({
          success: true,
          message: `Payment of ₦${amount} for ${type} processed successfully`,
        });
      } catch (error) {
        request.log.error(error);
        return reply
          .status(500)
          .send({ success: false, error: 'Payment processing failed' });
      }
    }
  );
};

export default paymentsRoutes;