class ResMessageError extends Error {
    constructor(message, status = 400) {
      super(message); // (1)
      this.name = "ResMessageError"; // (2)
      this.status = status
    }
}

module.exports = { ResMessageError }