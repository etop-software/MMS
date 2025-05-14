const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Controller for devices
const deviceController = {
  // Get devices by area ID
  getDevicesByArea: async (req, res) => {
    const { areaId } = req.query;

    if (!areaId) {
      return res.status(400).json({ error: 'Area ID is required' });
    }

    try {
      // Fetch devices for the given area
      const devices = await prisma.device.findMany({
        where: {
          areaId: parseInt(areaId),
        },
      });

      return res.json(devices);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error fetching devices' });
    }
  },

  // Get all devices (optional, if needed)
  getAllDevices: async (req, res) => {
    try {
      const devices = await prisma.device.findMany();
      return res.json(devices);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error fetching all devices' });
    }
  },

  // Create a new device
  createDevice: async (req, res) => {
    const { name, areaId } = req.body;

    if (!name || !areaId) {
      return res.status(400).json({ error: 'Name and Area ID are required' });
    }

    try {
      const newDevice = await prisma.device.create({
        data: {
          name,
          areaId: parseInt(areaId),
        },
      });
      return res.status(201).json(newDevice);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error creating device' });
    }
  },

  // Update an existing device
  updateDevice: async (req, res) => {
    const { deviceId, name, areaId } = req.body;

    if (!deviceId || !name || !areaId) {
      return res.status(400).json({ error: 'Device ID, Name, and Area ID are required' });
    }

    try {
      const updatedDevice = await prisma.device.update({
        where: { id: parseInt(deviceId) },
        data: {
          name,
          areaId: parseInt(areaId),
        },
      });

      return res.json(updatedDevice);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error updating device' });
    }
  },

  // Delete a device
  deleteDevice: async (req, res) => {
    const { deviceId } = req.params;

    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    try {
      const deletedDevice = await prisma.device.delete({
        where: { id: parseInt(deviceId) },
      });

      return res.json({ message: 'Device deleted successfully', deletedDevice });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error deleting device' });
    }
  },
};

module.exports = deviceController;
