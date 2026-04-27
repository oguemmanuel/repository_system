const express = require("express")
const router = express.Router()
const db = require("../config/database")
const { isAuthenticated } = require("../middleware/auth")

// Get user notifications
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id

    const [notifications] = await db.query(
      `SELECT n.*, r.title as resourceTitle 
       FROM notifications n
       LEFT JOIN resources r ON n.resourceId = r.id
       WHERE n.userId = ?
       ORDER BY n.createdAt DESC
       LIMIT 50`,
      [userId],
    )

    res.status(200).json({
      success: true,
      notifications,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
    })
  }
})

// Mark notification as read
router.patch("/:id/read", isAuthenticated, async (req, res) => {
  try {
    const notificationId = req.params.id
    const userId = req.session.user.id

    const [result] = await db.query("UPDATE notifications SET isRead = true WHERE id = ? AND userId = ?", [
      notificationId,
      userId,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or you don't have permission to update it",
      })
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
    })
  } catch (error) {
    console.error("Error updating notification:", error)
    res.status(500).json({
      success: false,
      message: "Error updating notification",
      error: error.message,
    })
  }
})

// Mark all notifications as read
router.patch("/mark-all-read", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id

    await db.query("UPDATE notifications SET isRead = true WHERE userId = ? AND isRead = false", [userId])

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    })
  } catch (error) {
    console.error("Error updating notifications:", error)
    res.status(500).json({
      success: false,
      message: "Error updating notifications",
      error: error.message,
    })
  }
})

// Delete a notification
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const notificationId = req.params.id
    const userId = req.session.user.id

    const [result] = await db.query("DELETE FROM notifications WHERE id = ? AND userId = ?", [notificationId, userId])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or you don't have permission to delete it",
      })
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
    })
  }
})

// Get unread notification count
router.get("/unread-count", isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id

    const [result] = await db.query("SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = false", [
      userId,
    ])

    res.status(200).json({
      success: true,
      count: result[0].count,
    })
  } catch (error) {
    console.error("Error counting notifications:", error)
    res.status(500).json({
      success: false,
      message: "Error counting notifications",
      error: error.message,
    })
  }
})

module.exports = router
