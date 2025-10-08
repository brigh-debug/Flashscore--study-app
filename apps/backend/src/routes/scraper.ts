import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  scrapeStakeOdds,
  scrapeBetTodayPredictions,
  saveScrapedMatches,
  getUpcomingMatches
} from "@bservices/scraperServices";

export async function scraperRoutes(server: FastifyInstance) {
  // --- Scrape Odds ---
  server.get("/scrape/odds", async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const odds = await scrapeStakeOdds();
      return reply.send({
        success: true,
        message: `Scraped ${odds.length} matches with odds`,
        data: odds
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: (error as Error).message || "Odds scraping failed"
      });
    }
  });

  // --- Scrape Predictions ---
  server.get("/scrape/predictions", async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const predictions = await scrapeBetTodayPredictions();
      return reply.send({
        success: true,
        message: `Scraped ${predictions.length} predictions`,
        data: predictions
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: (error as Error).message || "Predictions scraping failed"
      });
    }
  });

  // --- Full Scrape and Save ---
  server.post("/scrape/save", async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await saveScrapedMatches();
      return reply.send({
        success: true,
        message: "Scraping completed and saved to database",
        ...result
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: (error as Error).message || "Save operation failed"
      });
    }
  });

  // --- Scraper Status ---
  server.get("/scrape/status", async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const upcomingMatches = await getUpcomingMatches(5);
      const lastScrapedMatch = upcomingMatches[0];

      return reply.send({
        success: true,
        status: "operational",
        lastScrapeTime: lastScrapedMatch?.scrapedAt || null,
        upcomingMatches: upcomingMatches.length,
        message: "Scraper is ready"
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: (error as Error).message || "Status check failed"
      });
    }
  });
}