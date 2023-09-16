
const middleware = (schema, property) => { 
  
  return (req, res, next) => { 
    const { error } = schema(req.body)
    
    const valid = error == null; 

    if (valid) { 
      next(); 
    } else { 
      const { details } = error; 
      details.map( (d) => {
        delete d.context; delete d.type;
      });
      const message = details.map(i => i.message).join(',');
      res.status(422).json({message: message, errors: details}) } 
  } 
} 
module.exports = middleware;