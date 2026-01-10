import prisma from "../config/prismaClient";

const add_number = async (req) => {
  const { authUserId, mobileNumber } = req.body;

  return await prisma.user.upsert({
    where: {
      authUserId
    },
    update: {
      mobileNumber
    },
    create: {
      authUserId,
      mobileNumber
    }
  });
};

const update_number = async (req) => {
  const { authUserId, mobileNumber } = req.body;

  return await prisma.user.update({
    where: {
      authUserId
    },
    data: {
      mobileNumber
    }
  });
};

export { add_number, update_number };
