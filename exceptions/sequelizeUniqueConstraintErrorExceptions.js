class SequelizeUniqueConstraintError extends Error {
    constructor(err, status = 400) {
      super(err.errors[0].message); // (1)
      this.name = err.errors[0].path; // (2)
      this.status = status
    }
}

module.exports = { SequelizeUniqueConstraintError }