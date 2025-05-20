const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key';
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


exports.createUser = async (req, res) => {
  const { name, password, username, userType, areaAccess = [] } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // 10 = salt rounds

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        userType,
        needToChangePassword: true,
        areaAccess: {
          create: areaAccess.map((areaId) => ({
            area: { connect: { id: Number(areaId) } },
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

exports.updateUser = async (req, res) => {
  const id = parseInt(req.params.id);
  const { username, password, name, userType, areaAccess: areaIds = [] } = req.body;

  try {
    const dataToUpdate = {
      username,
      name,
      userType,
      areaAccess: {
        deleteMany: {}, 
      },
    };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
      dataToUpdate.needToChangePassword = true; 
    }

    await prisma.user.update({
      where: { id },
      data: dataToUpdate,
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
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
};



exports.loginUser = async (req, res) => {

  const { user_id: username, password } = req.body;

  try {
    const user = await prisma.User.findUnique({
      where: { username },
      include: {
        areaAccess: {
          include: { area: true },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, userType: user.userType },
      SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      userAccess: user.areaAccess.map((access) => access.area),
      needToChangePassword: user.needToChangePassword,
      user_id:user.id,
      name:user.name,
      userType:user.userType
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { userId, new_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(new_password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        needToChangePassword: false, 
      },
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }

    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



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
