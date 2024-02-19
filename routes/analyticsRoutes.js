const router = require("express").Router();

const {
  logRequest,
  getPageViews,
} = require("../controllers/analyticsController");

router.post("/", logRequest);

router.get("/page-views", getPageViews);

module.exports = router;
