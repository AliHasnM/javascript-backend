// A higher-order function is defined to wrap around request handlers in Express.
// This allows us to handle asynchronous operations more cleanly without repetitive try-catch blocks.

// Promise approach (2)
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    // Wrap the request handler in a Promise and catch any errors to pass them to the next middleware
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// try and catch approach (1)
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next); // Await the request handler function
//     } catch (error) {
//         // If an error occurs, respond with a status code and error message
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         });
//     }
// };

// Explanation:
// The `asyncHandler` function is a higher-order function that takes a request handler function as an argument.
// It returns a new function that wraps the request handler in a Promise, catching any errors and passing them to the next middleware.
// This helps to avoid repetitive try-catch blocks in route handlers and ensures that any errors are properly handled.
