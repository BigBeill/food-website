

exports.groups = async (req, res) => {
   const data = await postgresConnection.query('select * from foodgroup');
   return (res.status(200).json(data.rows));
};