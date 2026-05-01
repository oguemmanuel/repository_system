const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { isAuthenticated, isAuthorized } = require("../middleware/auth");

// Get dashboard analytics data (admin only)
router.get(
  "/dashboard",
  isAuthenticated,
  isAuthorized(["admin"]),
  async (req, res) => {
    try {
      const [viewsResult] = await db.query(
        "SELECT SUM(views) as totalViews FROM resources",
      );
      const totalViews = viewsResult[0].totalViews || 0;

      const [downloadsResult] = await db.query(
        "SELECT SUM(downloads) as totalDownloads FROM resources",
      );
      const totalDownloads = downloadsResult[0].totalDownloads || 0;

      const [activeUsersResult] = await db.query(
        "SELECT COUNT(DISTINCT userId) as activeUsers FROM resource_access_logs WHERE timestamp > DATE_SUB(NOW(), INTERVAL 30 DAY)",
      );
      const activeUsers = activeUsersResult[0].activeUsers || 0;

      const [newUploadsResult] = await db.query(
        "SELECT COUNT(*) as newUploads FROM resources WHERE createdAt > DATE_SUB(NOW(), INTERVAL 30 DAY)",
      );
      const newUploads = newUploadsResult[0].newUploads || 0;

      const [resourceViewsData] = await db.query(`
      SELECT
        DATE_FORMAT(timestamp, '%b') as name,
        r.type,
        COUNT(*) as count
      FROM resource_access_logs ral
      JOIN resources r ON ral.resourceId = r.id
      WHERE
        ral.action = 'view' AND
        timestamp > DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(timestamp, '%Y-%m'), r.type
      ORDER BY MIN(timestamp)
    `);

      const [resourceDownloadsData] = await db.query(`
      SELECT
        DATE_FORMAT(timestamp, '%b') as name,
        r.type,
        COUNT(*) as count
      FROM resource_access_logs ral
      JOIN resources r ON ral.resourceId = r.id
      WHERE
        ral.action = 'download' AND
        timestamp > DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(timestamp, '%Y-%m'), r.type
      ORDER BY MIN(timestamp)
    `);

      const [resourceTypeData] = await db.query(`
      SELECT type as name, COUNT(*) as value
      FROM resources
      GROUP BY type
    `);

      const [departmentDistributionData] = await db.query(`
      SELECT department as name, COUNT(*) as value
      FROM resources
      GROUP BY department
      ORDER BY COUNT(*) DESC
      LIMIT 10
    `);

      const [userActivityData] = await db.query(`
      SELECT
        DATE_FORMAT(timestamp, '%a') as name,
        COUNT(DISTINCT userId) as 'Active Users'
      FROM resource_access_logs
      WHERE timestamp > DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE_FORMAT(timestamp, '%w')
      ORDER BY DATE_FORMAT(timestamp, '%w')
    `);

      const formattedResourceViewsData = [];
      const months = {};
      resourceViewsData.forEach((item) => {
        if (!months[item.name]) {
          months[item.name] = {
            name: item.name,
            "Past Exams": 0,
            Projects: 0,
            Theses: 0,
          };
          formattedResourceViewsData.push(months[item.name]);
        }
        if (item.type === "past-exam")
          months[item.name]["Past Exams"] = item.count;
        else if (item.type === "mini-project" || item.type === "final-project")
          months[item.name]["Projects"] += item.count;
        else if (item.type === "thesis")
          months[item.name]["Theses"] = item.count;
      });

      const formattedResourceDownloadsData = [];
      const downloadMonths = {};
      resourceDownloadsData.forEach((item) => {
        if (!downloadMonths[item.name]) {
          downloadMonths[item.name] = {
            name: item.name,
            "Past Exams": 0,
            Projects: 0,
            Theses: 0,
          };
          formattedResourceDownloadsData.push(downloadMonths[item.name]);
        }
        if (item.type === "past-exam")
          downloadMonths[item.name]["Past Exams"] = item.count;
        else if (item.type === "mini-project" || item.type === "final-project")
          downloadMonths[item.name]["Projects"] += item.count;
        else if (item.type === "thesis")
          downloadMonths[item.name]["Theses"] = item.count;
      });

      const formattedResourceTypeData = resourceTypeData.map((item) => {
        let name = item.name;
        if (name === "past-exam") name = "Past Exams";
        else if (name === "mini-project" || name === "final-project")
          name = "Projects";
        else if (name === "thesis") name = "Theses";
        return { name, value: item.value };
      });

      res.status(200).json({
        success: true,
        analytics: {
          totalViews,
          totalDownloads,
          activeUsers,
          newUploads,
          resourceViewsData: formattedResourceViewsData,
          resourceDownloadsData: formattedResourceDownloadsData,
          resourceTypeData: formattedResourceTypeData,
          departmentDistributionData,
          userActivityData,
        },
      });
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error fetching analytics data",
          error: error.message,
        });
    }
  },
);

// Get supervisor analytics data
router.get(
  "/supervisor",
  isAuthenticated,
  isAuthorized(["supervisor"]),
  async (req, res) => {
    try {
      const supervisorId = req.user.id;

      const [supervisedResult] = await db.query(
        "SELECT COUNT(*) as totalSupervised FROM resources WHERE supervisorId = ?",
        [supervisorId],
      );
      const totalSupervised = supervisedResult[0].totalSupervised || 0;

      const [pendingResult] = await db.query(
        "SELECT COUNT(*) as pendingResources FROM resources WHERE supervisorId = ? AND status = 'pending'",
        [supervisorId],
      );
      const pendingResources = pendingResult[0].pendingResources || 0;

      const [approvedResult] = await db.query(
        "SELECT COUNT(*) as approvedResources FROM resources WHERE supervisorId = ? AND status = 'approved'",
        [supervisorId],
      );
      const approvedResources = approvedResult[0].approvedResources || 0;

      const [rejectedResult] = await db.query(
        "SELECT COUNT(*) as rejectedResources FROM resources WHERE supervisorId = ? AND status = 'rejected'",
        [supervisorId],
      );
      const rejectedResources = rejectedResult[0].rejectedResources || 0;

      const [resourcesByType] = await db.query(
        `SELECT type, COUNT(*) as count FROM resources WHERE supervisorId = ? GROUP BY type`,
        [supervisorId],
      );

      const [resourcesByStudent] = await db.query(
        `SELECT
        u.fullName as studentName,
        COUNT(*) as count
      FROM resources r
      JOIN users u ON r.studentId = u.id
      WHERE r.supervisorId = ?
      GROUP BY r.studentId
      ORDER BY count DESC
      LIMIT 5`,
        [supervisorId],
      );

      res.status(200).json({
        success: true,
        analytics: {
          totalSupervised,
          pendingResources,
          approvedResources,
          rejectedResources,
          resourcesByType,
          resourcesByStudent,
        },
      });
    } catch (error) {
      console.error("Error fetching supervisor analytics:", error);
      res
        .status(500)
        .json({
          success: false,
          message: "Error fetching supervisor analytics",
          error: error.message,
        });
    }
  },
);

// Get user-specific analytics
router.get("/user", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    const [uploadsResult] = await db.query(
      "SELECT COUNT(*) as totalUploads FROM resources WHERE uploadedBy = ?",
      [userId],
    );
    const totalUploads = uploadsResult[0].totalUploads || 0;

    const [viewsResult] = await db.query(
      "SELECT SUM(views) as totalViews FROM resources WHERE uploadedBy = ?",
      [userId],
    );
    const totalViews = viewsResult[0].totalViews || 0;

    const [downloadsResult] = await db.query(
      "SELECT SUM(downloads) as totalDownloads FROM resources WHERE uploadedBy = ?",
      [userId],
    );
    const totalDownloads = downloadsResult[0].totalDownloads || 0;

    const [pendingResult] = await db.query(
      'SELECT COUNT(*) as pendingResources FROM resources WHERE uploadedBy = ? AND status = "pending"',
      [userId],
    );
    const pendingResources = pendingResult[0].pendingResources || 0;

    const [approvedResult] = await db.query(
      'SELECT COUNT(*) as approvedResources FROM resources WHERE uploadedBy = ? AND status = "approved"',
      [userId],
    );
    const approvedResources = approvedResult[0].approvedResources || 0;

    const [rejectedResult] = await db.query(
      'SELECT COUNT(*) as rejectedResources FROM resources WHERE uploadedBy = ? AND status = "rejected"',
      [userId],
    );
    const rejectedResources = rejectedResult[0].rejectedResources || 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalUploads,
        totalViews,
        totalDownloads,
        pendingResources,
        approvedResources,
        rejectedResources,
      },
    });
  } catch (error) {
    console.error("Error fetching user analytics data:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching user analytics data",
        error: error.message,
      });
  }
});

module.exports = router;
