import { FastifyInstance } from "fastify";
import { processPayment } from "@bcontrollers/paymentController";

export async function paymentRoutes(server: FastifyInstance) {
  server.post("/payment", processPayment);
}