import prisma from "../config/prismaClient.js";

const addMobileNumber = async (req) => {
  try {
    const { userId, email, mobileNumber } = req.body;

    console.log("ADD_MOBILE_REQUEST", userId);

    const user = await prisma.user.upsert({
      where: {
        userId
      },
      update: {
        mobileNumber
      },
      create: {
        userId,
        email,
        mobileNumber
      }
    });

    console.log("ADD_MOBILE_SUCCESS", userId);
    return user;
  } catch (error) {
    console.log("ADD_MOBILE_ERROR", error);
    throw error;
  }
};

const updateMobileNumber = async (req) => {
  try {
    const { userId, mobileNumber } = req.body;

    console.log("UPDATE_MOBILE_REQUEST", userId);

    const user = await prisma.user.update({
      where: {
        userId
      },
      data: {
        mobileNumber
      }
    });

    console.log("UPDATE_MOBILE_SUCCESS", userId);
    return user;
  } catch (error) {
    console.log("UPDATE_MOBILE_ERROR", error);
    throw error;
  }
};

const deleteMobileNumber = async (req) => {
  try {
    const { userId } = req.body;

    console.log("DELETE_MOBILE_REQUEST", userId);

    const user = await prisma.user.update({
      where: {
        userId
      },
      data: {
        mobileNumber: null
      }
    });

    console.log("DELETE_MOBILE_SUCCESS", userId);
    return user;
  } catch (error) {
    console.log("DELETE_MOBILE_ERROR", error);
    throw error;
  }
};

export {
  addMobileNumber,
  updateMobileNumber,
  deleteMobileNumber
};
