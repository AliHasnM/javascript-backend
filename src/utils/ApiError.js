// API's Errors Handler

class ApiError extends Error {
  constructor(
    statusCode, // The HTTP status code for the error
    message = "Something went wrong", // The error message (default is "Something went wrong")
    errors = [], // Additional errors or details about the error
    stack = "", // Custom stack trace (if provided)
  ) {
    super(message); // Call the parent class (Error) constructor with the message
    this.statusCode = statusCode; // Assign the status code to the instance
    this.data = null; // Placeholder for any additional data related to the error
    this.message = message; // Assign the message to the instance
    this.success = false; // Indicate that the operation was not successful
    this.errors = errors; // Assign any additional errors or details

    // If a custom stack trace is provided, assign it to the instance
    // Otherwise, capture the stack trace using the current constructor
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
