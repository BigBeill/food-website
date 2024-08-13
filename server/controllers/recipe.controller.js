
exports.data = async (req, res) => {
   const _id = req.query._id
   if (!_id) { return res.status(400).json({ error: "_id not provided" }) }

   try {
      const data = await recipes.findOne({ _id:_id })
      if (!data) { return res.status(404).json({ error: "recipe with _id does not exist in database"})}
      else { return res.status(200).json(data) }
   } 
   catch { return res.status(500).json({ error: "database error finding recipe" }) }
}