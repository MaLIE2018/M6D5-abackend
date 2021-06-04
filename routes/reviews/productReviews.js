postsRouter.post("/:id/comments/", async (req, res, next) => {
  try {
    const updatedPost = await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: req.body,
        },
      },
      { runValidators: true, new: true }
    );
    if (updatedPost) {
      res.send(updatedPost);
    } else {
      next(createError(404, `Post ${req.params.id} not found`));
    }
  } catch (error) {
    console.log(error);
    next(createError(500, "An error occurred while adding the comment"));
  }
});
