const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');

const bodyParser = require('body-parser');
const timezoneRoutes = require('./routes/timezoneRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const assignTimeZoneRoutes = require('./routes/assignTimeZoneRoutes');
const mealRuleRoute = require('./routes/mealRuleRoute');
const mealTypeRoute = require('./routes/mealtypeRoutes');
const areaRoute = require('./routes/areaRoutes');
const logRoutes = require('./routes/logRoutes');
const mealHistoryRoutes = require('./routes/mealHistoryRoutes');
const exportRoutes = require("./routes/exportRoutes");
const deviceRoutes = require('./routes/deviceRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const designationRoutes = require('./routes/designationRoutes');

app.use((req, res, next) => {
  if (req.headers['user-agent']?.includes('iClock')) {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
});
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ message: err.message });
  console.warn(err);
});
app.use(bodyParser.json()); 
app.use(express.json({ limit: '100mb' }));
app.use(cors({
  origin: '*',
  methods: 'GET, POST, PUT, DELETE, OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true
}));

app.use('/api/timeZones', timezoneRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assignTimeZone', assignTimeZoneRoutes);
app.use('/api/mealRules', mealRuleRoute);
app.use('/api/mealTypes', mealTypeRoute);
app.use('/api/areas', areaRoute);
app.use('/api/logs', logRoutes);
app.use('/api', mealHistoryRoutes);
app.use("/api", exportRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/designations', designationRoutes);

require('./pushOps')(app);


const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
