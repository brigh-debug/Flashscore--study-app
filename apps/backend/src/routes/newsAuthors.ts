import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { NewsAuthorController } from '../controllers/newsAuthorController';
import { authMiddleware } from '../middleware/authMiddleware';
import { NewsAuthorService } from '../services/newsAuthorService';

// ==== Request Body Interfaces (DTOs) ====
interface CreateAuthorBody {
  id: string;
  name: string;
  icon: string;
  bio?: string;
  expertise?: string[];
}

interface CreateCollaborationBody {
  title: string;
  preview: string;
  fullContent: string;
  collaborationType: 'prediction' | 'analysis' | 'community' | 'update';
  tags?: string[];
}

// ==== Routes ====
export default async function newsAuthorsRoutes(fastify: FastifyInstance) {
  // ----- Public Routes -----

  // Get all authors with leaderboard
  fastify.get('/api/news-authors', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    try {
      const { limit = 10 } = request.query as { limit?: number };
      const authors = await NewsAuthorService.getActiveAuthors();

      return reply.send({
        success: true,
        authors,
        total: authors.length
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Error fetching news authors');
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch news authors'
      });
    }
  });

  // Get single author by ID
  fastify.get('/api/news-authors/:id', async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const { id } = request.params;
      const author = await NewsAuthorService.getAuthorById(id);

      if (!author) {
        return reply.status(404).send({
          success: false,
          error: 'Author not found'
        });
      }

      return reply.send({
        success: true,
        author
      });
    } catch (error) {
      fastify.log.error({ err: error }, 'Error fetching author');
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch author'
      });
    }
  });

  // Get all authors (alternate endpoint)
  fastify.get('/news-authors', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    return NewsAuthorController.getAllAuthors(request, reply);
  });

  // Get single author (alternate endpoint)
  fastify.get('/news-authors/:id', async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ) => {
    return NewsAuthorController.getAuthorById(request, reply);
  });

  // Initialize default authors
  fastify.post('/news-authors/initialize', async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    return NewsAuthorController.initializeDefaultAuthors(request, reply);
  });

  // ----- Member Routes (Require Auth) -----

  // Create or update author
  fastify.post('/news-authors', {
    preHandler: authMiddleware.requireMemberAccess
  }, async (request: any, reply: FastifyReply) => {
    return NewsAuthorController.createOrUpdateAuthor(request, reply);
  });

  // Create collaboration
  fastify.post<{ Params: { id: string }; Body: CreateCollaborationBody }>(
    '/:id/collaborations',
    async (request, reply) => {
      // TODO: Implement collaboration tracking service
      // await collaborationService.trackCollaborationEvent(request as any, {
      //   ...collaboration event data
      // });
      return NewsAuthorController.createCollaborationNews(request, reply);
    });

  // Auto-generate news
  fastify.post('/news-authors/auto-news', {
    preHandler: authMiddleware.requireMemberAccess
  }, async (request: any, reply: FastifyReply) => {
    return NewsAuthorController.generateAutoNews(request, reply);
  });
}