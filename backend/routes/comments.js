const express = require("express")
const router = express.Router()
const db = require("../config/database")
const { isAuthenticated } = require("../middleware/auth")

// Create a new comment
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const { resourceId, content } = req.body
    const userId = req.session.user.id

    if (!resourceId || !content) {
      return res.status(400).json({
        success: false,
        message: "Resource ID and comment content are required",
      })
    }

    // Check if resource exists
    const [resources] = await db.query("SELECT * FROM resources WHERE id = ?", [resourceId])

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    // Insert the comment
    const [result] = await db.query(
      "INSERT INTO comments (resourceId, userId, content, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())",
      [resourceId, userId, content]
    )

    // Get the created comment with user details
    const [comments] = await db.query(
      `SELECT c.*, u.fullName, u.role 
       FROM comments c 
       JOIN users u ON c.userId = u.id 
       WHERE c.id = ?`,
      [result.insertId]
    )

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment: comments[0],
    })
  } catch (error) {
    console.error("Error creating comment:", error)
    res.status(500).json({
      success: false,
      message: "Error creating comment",
      error: error.message,
    })
  }
})

// Get comments by resource ID
router.get("/resource/:resourceId", async (req, res) => {
  try {
    const resourceId = req.params.resourceId

    // Verify resource exists
    const [resources] = await db.query("SELECT * FROM resources WHERE id = ?", [resourceId])

    if (resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      })
    }

    // Get comments for the resource with user details
    const [comments] = await db.query(
      `SELECT c.*, u.fullName, u.role 
       FROM comments c 
       JOIN users u ON c.userId = u.id 
       WHERE c.resourceId = ? 
       ORDER BY c.createdAt DESC`,
      [resourceId]
    )

    res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      comments: comments,
    })
  } catch (error) {
    console.error("Error fetching comments:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
      error: error.message,
    })
  }
})

// Get a single comment by ID
router.get("/:id", async (req, res) => {
  try {
    const commentId = req.params.id

    // Get comment with user details
    const [comments] = await db.query(
      `SELECT c.*, u.fullName, u.role 
       FROM comments c 
       JOIN users u ON c.userId = u.id 
       WHERE c.id = ?`,
      [commentId]
    )

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Comment retrieved successfully",
      comment: comments[0],
    })
  } catch (error) {
    console.error("Error fetching comment:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching comment",
      error: error.message,
    })
  }
})

// Update a comment
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const commentId = req.params.id
    const { content } = req.body
    const userId = req.session.user.id

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      })
    }

    // Check if comment exists and belongs to the user
    const [comments] = await db.query("SELECT * FROM comments WHERE id = ?", [commentId])

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    const comment = comments[0]

    // Only the comment author or admin can update the comment
    if (comment.userId !== userId && req.session.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this comment",
      })
    }

    // Update the comment
    await db.query("UPDATE comments SET content = ?, updatedAt = NOW() WHERE id = ?", [content, commentId])

    // Get the updated comment with user details
    const [updatedComments] = await db.query(
      `SELECT c.*, u.fullName, u.role 
       FROM comments c 
       JOIN users u ON c.userId = u.id 
       WHERE c.id = ?`,
      [commentId],
    )

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComments[0],
    })
  } catch (error) {
    console.error("Error updating comment:", error)
    res.status(500).json({
      success: false,
      message: "Error updating comment",
      error: error.message,
    })
  }
})

// Delete a comment
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const commentId = req.params.id
    const userId = req.session.user.id

    // Check if comment exists and belongs to the user
    const [comments] = await db.query("SELECT * FROM comments WHERE id = ?", [commentId])

    if (comments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      })
    }

    const comment = comments[0]

    // Only the comment author, resource owner, or admin can delete the comment
    if (comment.userId !== userId && req.session.user.role !== "admin") {
      // Check if user is the resource owner
      const [resources] = await db.query("SELECT uploadedBy FROM resources WHERE id = ?", [comment.resourceId])

      if (resources.length === 0 || resources[0].uploadedBy !== userId) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to delete this comment",
        })
      }
    }

    // Delete the comment
    await db.query("DELETE FROM comments WHERE id = ?", [commentId])

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting comment:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
      error: error.message,
    })
  }
})

module.exports = router