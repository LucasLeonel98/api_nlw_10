import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { z } from 'zod'
import ShortUniqueId from 'short-unique-id'
import { poolRoutes } from './routes/pools'
import { prisma } from './lib/prisma'
import { guessRoutes } from './routes/guess'
import { gameRoutes } from './routes/game'
import { userRoutes } from './routes/user'
import { authRoutes } from './routes/auth'


async function bootstrap() {
    const fastify = Fastify({
        logger: true,
    })

    await fastify.register(cors, {
        origin: true,
    })

    // em produção passar para uma variavel ambiente
    await fastify.register(jwt, {
        secret: process.env.SECRET_KEY,
    })

    await fastify.register(poolRoutes)
    await fastify.register(guessRoutes)
    await fastify.register(gameRoutes)
    await fastify.register(userRoutes)
    await fastify.register(authRoutes)

    await fastify.listen({ port: process.env.PORT || 3333, host: '0.0.0.0' })

}


bootstrap()