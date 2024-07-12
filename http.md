### HTTP Notes

**HTTP:** Hyper Text Transfer Protocol  
**URL:** Uniform Resource Locator  
**URI:** Uniform Resource Identifier  
**URN:** Uniform Resource Name

---

### 1. What are HTTP Headers?

HTTP headers are metadata: key-value pairs sent along with requests and responses.

**Uses of HTTP Headers:**

1. **Caching:** To check if the request has been made before and use the cached data.
2. **Authentication:** For passing auth headers, cookies, session values, tokens, refresh tokens, etc.
3. **Managing State:** To keep track of the user's state, such as whether the user is a guest, logged in, or has items in the cart.

**Categories of HTTP Headers:**

1. **Request Headers:** Sent from the client.
2. **Response Headers:** Sent from the server.
3. **Representation Headers:** Deal with encoding/compression.
4. **Payload Headers:** Deal with the actual data being sent.

**Most Common Headers:**

1. **Accept:** Specifies the type of data the client accepts (e.g., `application/json`).
2. **User-Agent:** Information about the client application (e.g., browser, Postman).
3. **Authorization:** Bearer token for JWT authentication (e.g., `Bearer Your-JWT-Token`).
4. **Content-Type:** Specifies the media type of the resource (e.g., `application/json`, `text/html`).
5. **Cookie:** Used to send cookies from the client to the server.
6. **Cache-Control:** Directives for caching mechanisms (e.g., when data should expire).

**Some Production Level Headers:**

**CORS Headers:**

- `Access-Control-Allow-Origin`
- `Access-Control-Allow-Credentials`
- `Access-Control-Allow-Method`

**Security Headers:**

- `Cross-Origin-Embedder-Policy`
- `Cross-Origin-Opener-Policy`
- `Content-Security-Policy`
- `X-XSS-Protection`

---

### 2. HTTP Methods

Basic set of operations used to interact with the server:

- **GET:** Retrieve a resource (data retrieval).
- **POST:** Create a new resource (data submission).
- **DELETE:** Remove a resource (data deletion).
- **PUT:** Replace a resource (complete data update).
- **PATCH:** Modify a part of a resource (partial data update).
- **HEAD:** Similar to GET but without the response body (response headers only).
- **OPTIONS:** Describe the communication options for the target resource.
- **TRACE:** Performs a message loop-back test along the path to the target resource (used for debugging).

---

### 3. HTTP Status Codes

HTTP status codes indicate the result of the HTTP request:

- **1xx Informational:** Request received, continuing process.
- **2xx Success:** The action was successfully received, understood, and accepted.
- **3xx Redirection:** Further action must be taken in order to complete the request.
- **4xx Client Error:** The request contains bad syntax or cannot be fulfilled.
- **5xx Server Error:** The server failed to fulfill an apparently valid request.

---

These notes provide a detailed overview of HTTP headers, methods, and status codes, which are fundamental for web development and understanding how clients and servers communicate over the web.
