const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        areaAccess: {
          include: { area: true },
        },
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
};

exports.getUserById = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        areaAccess: { include: { area: true } },
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
};

// POST /users - Create a new user
// Expected body: { username, password, name, userType, areaIds: [1, 2, 3] }
exports.createUser = async (req, res) => {
  const { user_id, password, username, userType, areaAccess = [] } = req.body;

  console.log('Received request to create user:', req.body);

  try {
    const user = await prisma.user.create({
      data: {
        username: user_id,
        password,
        name: username,
        userType,
        areaAccess: {
          create: areaAccess.map((areaId) => ({
            area: { connect: { id: Number(areaId) } }, // Ensure it's a number
          })),
        },
      },
      include: {
        areaAccess: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
};


// PUT /users/:id - Update a user and their area access
exports.updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const { username, password, name, userType, areaIds = [] } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        username,
        password,
        name,
        userType,
        areaAccess: {
          deleteMany: {}, // remove existing
        },
      },
    });

    await prisma.userAreaAccess.createMany({
      data: areaIds.map((areaId) => ({
        userId: id,
        areaId,
      })),
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id },
      include: { areaAccess: true },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
};

// DELETE /users/:id - Delete user and related access
exports.deleteUser = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.userAreaAccess.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
};
