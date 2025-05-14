const express = require("express");
const router = express.Router();
const exportController = require("../controllers/exportController");

router.get("/meal-history-reports/export/csv", exportController.exportCSV);
router.get("/meal-history-reports/export/pdf", exportController.exportPDF);
router.get("/meal-history-reports/export/xlsx", exportController.exportXLSX);

module.exports = router;