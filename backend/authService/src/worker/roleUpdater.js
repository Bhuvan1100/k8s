import prisma from "../config/prismaClient.js"
import { redisConnection } from "../infra/redisConnection.js"
import { Worker } from "bullmq"
import errorLogger from "../logger/errorLogger.js"
import appLogger from "../logger/appLogger.js"


const QUEUE_NAME = "role-updater-queue"

console.log(
  `[ROLE WORKER] Started successfully and listening to queue → ${QUEUE_NAME}`
)


const roleUpdaterWorker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { userId, newRole } = job.data

    if (!userId || !newRole) {
      const err = new Error(
        "Invalid job data: userId and newRole are required"
      )

      errorLogger.error(
        { jobId: job.id, data: job.data },
        err.message
      )

      throw err
    }

    appLogger.info(
      { jobId: job.id, userId, newRole },
      "Starting role update job"
    )

    await prisma.user.update({
    where: { id: userId },
    data: {
        roles: {
        push: newRole
        }
    }
    })


    appLogger.info(
      { jobId: job.id, userId, newRole },
      "Role updated successfully"
    )

    return {
      success: true,
      userId,
      updatedRole: newRole
    }
  },
  {
    connection: redisConnection,
    concurrency: 5
  }
)



roleUpdaterWorker.on("completed", (job, result) => {
  console.log(
    `[ROLE WORKER] Job ${job.id} completed →`,
    result
  )

  appLogger.info(
    { jobId: job.id, result },
    "Role updater job completed"
  )
})

roleUpdaterWorker.on("failed", (job, err) => {
  console.error(
    `[ROLE WORKER] Job ${job?.id} failed →`,
    err.message
  )

  errorLogger.error(
    {
      jobId: job?.id,
      err: err.message,
      stack: err.stack
    },
    "Role updater job failed"
  )
})

export default roleUpdaterWorker
