const express = require("express")
const router = express.Router()
const db = require("../config/database")
const { isAuthenticated } = require("../middleware/auth")

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
