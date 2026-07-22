const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const upload = require("../config/multer");
const {
  authenticate,
  adminOnly,
  requireVerified,
} = require("../middleware/auth");

router.post(
  "/create-post",
  authenticate,
  requireVerified,
  upload.single("image"),
  postController.createPost,
);
router.get("/", postController.getAllPosts);
router.get("/my-posts", authenticate, postController.getMyPosts);
router.delete("/:id", authenticate, postController.deletePost);
router.put("/:id", authenticate, postController.updatePost);
router.get("/:id", postController.getPostById);

module.exports = router;
