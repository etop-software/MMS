const express = require('express');
const router = express.Router();

const {
  createDesignation,
  getDesignations,
  getDesignationById,
  updateDesignation,
  deleteDesignation,
} = require('../controllers/designationController');

router.post('/', createDesignation);

router.get('/', getDesignations);

router.get('/:id', getDesignationById);

router.put('/:id', updateDesignation);

router.delete('/:id', deleteDesignation);

module.exports = router;
