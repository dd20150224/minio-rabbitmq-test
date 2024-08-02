const Blog = require('../models/blog');

const BlogController = {
  index: async (req, res) => {
    // Blog.find({xx:true}, (error, data) => {
    //   if (error) {
    //     console.log('err: ', error);
    //     res.status(500).send('Error accessing data');
    //   } else {
    //     return res.json({
    //       result: rows
    //     });
    //   }
    // })

    try {
      const rows = await Blog.find({xx:true});
      if (rows.length === 0) {
        return res.status(500).json({
          message: 'Error: data error'
        });
      }
      return res.json({
        result: rows
      })
    } catch(err) {
      return res.status(500).json({
        message: err.toString()
      })
    }
  },

  store: async (req, res) => {
    console.log('store: req.body: ', req.body);
    console.log('store: req.params: ', req.params);
    console.log('store: req.query: ', req.query);
    const blog = new Blog(req.body);
    const dbRes = await blog.save();

    return res.json({
      result: dbRes
    });
  }
}


module.exports = BlogController;
