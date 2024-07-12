// API's response handler

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode; // The HTTP status code for the response
    this.data = data; // The data to be included in the response
    this.message = message; // The message for the response (default is "Success")
    this.success = statusCode < 400; // Boolean indicating success (true if status code is less than 400)
  }
}

export { ApiResponse };
