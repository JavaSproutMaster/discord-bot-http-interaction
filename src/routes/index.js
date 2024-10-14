
async function routes(fastify, options) {
  fastify.get('/users', async (req, res) => {
    try {
      const users = await User.find();
      res.send(users);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });
}

export default routes;
