import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
async function main() {
    const user = await prisma.user.create({
        data: {
            name: 'John doe',
            email: 'johndoe@gmail.com',
            avatarUrl: 'https://github.com/LucasLeonel98.png'
        }
    })

    const pool = await prisma.pool.create({
        data: {
            title: 'test pool',
            code: '123bol',
            ownerId: user.id,

            Participant: {
                create: {
                    userId: user.id
                }
            }
        }
    })

    await prisma.game.create({
        data: {
            date: '2022-11-02T14:10:40.156Z',
            firstTeamCountryCode: 'DE',
            secondTeamCountryCode: 'BR'
        }
    })

    await prisma.game.create({
        data: {
            date: '2022-11-02T14:10:40.156Z',
            firstTeamCountryCode: 'BR',
            secondTeamCountryCode: 'AR',

            guesses: {
                create: {
                    firstTeamPoints: 2,
                    secondTeamPoints: 1,

                    participant: {
                        connect: {
                            userId_poolId: {
                                userId: user.id,
                                poolId: pool.id
                            }
                        }
                    }
                }
            }
        }
    })

}

main()