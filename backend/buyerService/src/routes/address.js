import prisma from "../config/prismaClient.js";

const addAddress = async (req) => {
  try {
    const { userId, email, line1, line2, city, state, pincode } = req.body;

    console.log("ADD_ADDRESS_REQUEST", userId);

    await prisma.user.upsert({
      where: {
        userId
      },
      update: {
        email
      },
      create: {
        userId,
        email
      }
    });

    const address = await prisma.address.create({
      data: {
        user: {
          connect: { userId }
        },
        line1,
        line2,
        city,
        state,
        pincode
      }
    });

    console.log("ADD_ADDRESS_SUCCESS", userId, address.id);
    return address;
  } catch (error) {
    console.log("ADD_ADDRESS_ERROR", error);
    throw error;
  }
};

const deleteAddress = async (req) => {
  try {
    const { userId, email, addressId } = req.body;

    console.log("DELETE_ADDRESS_REQUEST", userId, addressId);

    await prisma.user.upsert({
      where: {
        userId
      },
      update: {
        email
      },
      create: {
        userId,
        email
      }
    });

    const address = await prisma.address.delete({
      where: {
        id: addressId
      }
    });

    console.log("DELETE_ADDRESS_SUCCESS", addressId);
    return address;
  } catch (error) {
    console.log("DELETE_ADDRESS_ERROR", error);
    throw error;
  }
};

export {
  addAddress,
  deleteAddress
};
