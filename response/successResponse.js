class CommonResponse  {
    constructor(code = 200, message = "", data = {}, error = {}) {
      this.code = code;
      this.message = message;
      this.data = data;
      this.error = error;
    }
  };

  module.exports = { CommonResponse }