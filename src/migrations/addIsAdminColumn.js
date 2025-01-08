const sequelize = require("../config/database");
const { QueryTypes } = require("sequelize");

const addIsAdminColumn = async () => {
  try {
    // Check if column exists
    const checkColumn = await sequelize.query(
      `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='Users' AND column_name='isAdmin';
    `,
      { type: QueryTypes.SELECT }
    );

    if (checkColumn.length === 0) {
      // Add isAdmin column if it doesn't exist
      await sequelize.query(`
        ALTER TABLE "Users" 
        ADD COLUMN "isAdmin" BOOLEAN DEFAULT false;
      `);
      console.log("isAdmin column added successfully");
    } else {
      console.log("isAdmin column already exists");
    }
  } catch (error) {
    console.error("Error adding isAdmin column:", error);
    throw error;
  }
};

module.exports = addIsAdminColumn;
