const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AreaService {
  // Create a new area
  async createArea({ name, description }) {
    try {
      const area = await prisma.area.create({
        data: {
          name,
          description,
        },
      });
      return area;
    } catch (error) {
      throw new Error("Failed to create area");
    }
  }

  // Get all areas
  async getAllAreas() {
    try {
      const areas = await prisma.area.findMany();
      return areas;
    } catch (error) {
      throw new Error("Failed to retrieve areas");
    }
  }

  // Get a single area by ID
  async getAreaById(id) {
    try {
      const area = await prisma.area.findUnique({
        where: { id: parseInt(id) },
      });
      if (!area) {
        throw new Error("Area not found");
      }
      return area;
    } catch (error) {
      throw new Error("Failed to retrieve area");
    }
  }

  // Update an existing area by ID
  async updateArea(id, { name, description }) {
    try {
      const area = await prisma.area.update({
        where: { id: parseInt(id) },
        data: { name, description },
      });
      return area;
    } catch (error) {
      throw new Error("Failed to update area");
    }
  }

  // Delete an area by ID
  async deleteArea(id) {
    try {
      const area = await prisma.area.delete({
        where: { id: parseInt(id) },
      });
      return area;
    } catch (error) {
      throw new Error("Failed to delete area");
    }
  }
}

module.exports = new AreaService();
