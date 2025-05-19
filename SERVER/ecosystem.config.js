module.exports = {
  apps: [{
    name: "ADNH-SER",
    script: "src/index.js",  // change if your main file is different
    env: {
      DATABASE_URL: "postgresql://etop:eTOP%40123@147.93.104.86:5432/abnhdb"
    }
  }]
}
