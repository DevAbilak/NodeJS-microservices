const Search = require("../models/Search");
const logger = require("../utils/logger");

async function handlePostCreated({ postId, userId, content, createdAt }) {
  try {
    const newSearchPost = new Search({
      postId,
      userId,
      content,
      createdAt,
    });

    await newSearchPost.save();

    logger.info(
      `Search post created: ${postId}, ${newSearchPost._id.toString()}`,
    );
  } catch (error) {
    logger.error("Error handling post creation event", error);
  }
}

async function handlePostDeleted({ postId }) {
  try {
    await Search.findOneAndDelete({ postId });
    logger.info(`Search post deleted: ${postId}`);
  } catch (error) {
    logger.error("Error handling post deletion event", error);
  }
}

module.exports = { handlePostCreated, handlePostDeleted };
