import { FastifyInstance } from 'fastify'
import ShortUniqueId from 'short-unique-id'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authenticate } from '../plugins/authenticate'

export async function poolRoutes(fastify: FastifyInstance) {
    //rota http://localhost:3333/pools/count
    fastify.get('/pools/count', async () => {
        const count = await prisma.pool.count()
        return { count }

    })

    //rota http://localhost:3333/pools/count
    fastify.get('/pools', {
        onRequest: [authenticate]
    }, async (request) => {
        const pools = await prisma.pool.findMany({
            where: {
                Participant: {
                    some: {
                        userId: request.user.sub,
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        Participant: true,
                    }
                },
                Participant: {
                    select: {
                        id: true,

                        user: {
                            select: {
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4,
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
            },

        })
        return { pools }

    })

    //rota http://localhost:3333/pools   criar boloes 
    fastify.post('/pools', async (request, reply) => {

        const createPoolBody = z.object({
            title: z.string(),
        })
        const { title } = createPoolBody.parse(request.body)

        const generate = new ShortUniqueId({ length: 6 })
        const code = String(generate()).toUpperCase()
        let ownerId = null
        try {
            await request.jwtVerify()

            await prisma.pool.create({
                data: {
                    title,
                    code,
                    ownerId: request.user.sub,
                    Participant: {
                        create: {
                            userId: request.user.sub,
                        },

                    }
                }

            })
        } catch {
            await prisma.pool.create({
                data: {
                    title,
                    code
                }
            })
        }

        return reply.status(201).send({ code })

    })

    fastify.post('/pools/join', {
        onRequest: [authenticate]
    }, async (request, reply) => {

        const getPoolParams = z.object({
            code: z.string(),
        })
        const { code } = getPoolParams.parse(request.body)

        const pool = await prisma.pool.findUnique({
            where: {
                code,
            },
            include: {
                Participant: {
                    where: {
                        userId: request.user.sub,
                    }
                }
            }
        })

        if (!pool) {
            return reply.status(400).send({
                message: 'Poll not found.'
            })
        }

        if (pool.Participant.length > 0) {
            return reply.status(400).send({
                message: 'You already joined this poll.'
            })
        }

        if (!pool.ownerId) {
            await prisma.pool.update({
                where: {
                    id: pool.id,
                },
                data: {
                    ownerId: request.user.sub,
                }
            })
        }

        await prisma.participant.create({
            data: {
                poolId: pool.id,
                userId: request.user.sub,
            }
        })

        return reply.status(201).send()

    })

    //rota http://localhost:3333/pools   criar boloes 
    fastify.get('/pools/:id', async (request) => {

        const getPoolParams = z.object({
            id: z.string(),
        })
        const { id } = getPoolParams.parse(request.params)

        const pools = await prisma.pool.findUnique({
            where: {
                id,
            },
            include: {
                _count: {
                    select: {
                        Participant: true,
                    }
                },
                Participant: {
                    select: {
                        id: true,

                        user: {
                            select: {
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4,
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
            },
        })

        return { pools }

    })
}


