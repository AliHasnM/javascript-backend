**Aggregation Pipeline in MongoDB:**

The aggregation pipeline is a framework for data aggregation modeled on the concept of data processing pipelines. Documents enter a multi-stage pipeline that transforms them into aggregated results.

1. **Stages:** Each stage in the pipeline performs an operation on the input documents. Examples of stages include `$match` for filtering documents, `$group` for grouping documents, and `$project` for reshaping documents.
2. **Document Flow:** The output from one stage is passed as input to the next stage, creating a sequence of transformations.
3. **Aggregation Functions:** The pipeline can compute summary results such as total, average, maximum, and minimum values across groups of documents.

The aggregation framework is powerful for transforming and summarizing data, making it ideal for complex queries and analytics.

# Summary

In the aggregation pipeline, each stage processes and transforms the input documents, so if you filter 50 out of 100 documents in one stage, only those 50 filtered documents will be passed to the next stage.

# (1) Complex data aggregation and transformation tasks stages

---

**1. $match:**

- **Definition:** Filters documents to pass only those that match specified conditions.
- **Example:** Select users aged over 25.
  ```json
  { "$match": { "age": { "$gt": 25 } } }
  ```

**2. $project:**

- **Definition:** Reshapes documents by including, excluding, or adding fields.
- **Example:** Include only the `name` and `age` fields.
  ```json
  { "$project": { "name": 1, "age": 1, "_id": 0 } }
  ```

**3. $group:**

- **Definition:** Groups documents by a specified key and can apply aggregation functions.
- **Example:** Group users by age and count them.
  ```json
  { "$group": { "_id": "$age", "count": { "$sum": 1 } } }
  ```

**4. $sort:**

- **Definition:** Sorts documents based on a specified field.
- **Example:** Sort users by age in ascending order.
  ```json
  { "$sort": { "age": 1 } }
  ```

**5. $limit:**

- **Definition:** Limits the number of documents passed to the next stage.
- **Example:** Limit the result to 10 users.
  ```json
  { "$limit": 10 }
  ```

**6. $skip:**

- **Definition:** Skips a specified number of documents.
- **Example:** Skip the first 5 users.
  ```json
  { "$skip": 5 }
  ```

**7. $unwind:**

- **Definition:** Deconstructs an array field from the input documents to output a document for each element.
- **Example:** Unwind the `hobbies` array.
  ```json
  { "$unwind": "$hobbies" }
  ```

**8. $lookup:**

- **Definition:** Performs a left outer join to another collection.
- **Example:** Join users with their orders.
  ```json
  {
    "$lookup": {
      "from": "orders",
      "localField": "_id",
      "foreignField": "userId",
      "as": "userOrders"
    }
  }
  ```

**9. $addFields:**

- **Definition:** Adds new fields to documents.
- **Example:** Add a `fullName` field.
  ```json
  {
    "$addFields": {
      "fullName": { "$concat": ["$firstName", " ", "$lastName"] }
    }
  }
  ```

**10. $out:**

- **Definition:** Writes the resulting documents to a specified collection.
- **Example:** Output results to a new collection called `filteredUsers`.
  ```json
  { "$out": "filteredUsers" }
  ```

**11. $replaceRoot:**

- **Definition:** Replaces the input document with the specified document.
- **Example:** Replace the root with the `userDetails` field.
  ```json
  { "$replaceRoot": { "newRoot": "$userDetails" } }
  ```

---

These stages can be combined in various ways to perform complex data aggregation and transformation tasks.

# (2) All Stages of Aggregation Pipeline

Sure, here's a brief description and example for each stage you mentioned:

---

**1. $addFields:**

- **Definition:** Adds new fields to documents.
- **Example:** Add a `fullName` field.
  ```json
  {
    "$addFields": {
      "fullName": { "$concat": ["$firstName", " ", "$lastName"] }
    }
  }
  ```

**2. $bucket:**

- **Definition:** Categorizes documents into groups called buckets.
- **Example:** Group ages into buckets of 10 years.
  ```json
  {
    "$bucket": {
      "groupBy": "$age",
      "boundaries": [0, 10, 20, 30, 40, 50],
      "default": "Other"
    }
  }
  ```

**3. $bucketAuto:**

- **Definition:** Automatically categorizes documents into a specified number of groups.
- **Example:** Automatically group users into 5 age ranges.
  ```json
  { "$bucketAuto": { "groupBy": "$age", "buckets": 5 } }
  ```

**4. $collStats:**

- **Definition:** Returns statistics about a collection.
- **Example:** Get statistics of the collection.
  ```json
  { "$collStats": { "latencyStats": { "histograms": true } } }
  ```

**5. $count:**

- **Definition:** Counts the number of documents.
- **Example:** Count the number of users.
  ```json
  { "$count": "userCount" }
  ```

**6. $densify:**

- **Definition:** Fills gaps in a sequence of documents.
- **Example:** Densify dates in a time series.
  ```json
  { "$densify": { "field": "date", "range": { "step": 1, "unit": "day" } } }
  ```

**7. $facet:**

- **Definition:** Processes multiple aggregation pipelines within a single stage.
- **Example:** Create facets for price and rating.
  ```json
  {
    "$facet": {
      "prices": [
        { "$bucket": { "groupBy": "$price", "boundaries": [0, 50, 100, 150] } }
      ],
      "ratings": [
        { "$bucket": { "groupBy": "$rating", "boundaries": [0, 2, 4, 6] } }
      ]
    }
  }
  ```

**8. $fill:**

- **Definition:** Fills missing values in documents.
- **Example:** Fill missing prices with the average price.
  ```json
  { "$fill": { "output": { "price": { "method": "linear" } } } }
  ```

**9. $geoNear:**

- **Definition:** Performs geospatial queries.
- **Example:** Find the closest users within 10 kilometers.
  ```json
  {
    "$geoNear": {
      "near": { "type": "Point", "coordinates": [-73.9667, 40.78] },
      "distanceField": "dist.calculated",
      "maxDistance": 10000,
      "spherical": true
    }
  }
  ```

**10. $graphLookup:** - **Definition:** Performs a recursive search on a collection. - **Example:** Find all users connected to a specific user.
`json
      { $graphLookup: { from: "users", startWith: "$_id", connectFromField: "_id", connectToField: "referrerId", as: "referralTree" } }
      `

**11. $group:** - **Definition:** Groups documents by a specified key and applies aggregation functions. - **Example:** Group users by age and count them.
`json
      { $group: { _id: "$age", count: { $sum: 1 } } }
      `

**12. $indexStats:** - **Definition:** Returns statistics about the indexes. - **Example:** Get index statistics.
`json
      { $indexStats: {} }
      `

**13. $limit:** - **Definition:** Limits the number of documents passed to the next stage. - **Example:** Limit the result to 10 users.
`json
      { $limit: 10 }
      `

**14. $lookup:** - **Definition:** Performs a left outer join to another collection. - **Example:** Join users with their orders.
`json
      { $lookup: { from: "orders", localField: "_id", foreignField: "userId", as: "userOrders" } }
      `

**15. $match:** - **Definition:** Filters documents to pass only those that match specified conditions. - **Example:** Select users aged over 25.
`json
      { $match: { age: { $gt: 25 } } }
      `

**16. $merge:** - **Definition:** Writes the resulting documents to a specified collection. - **Example:** Merge results into the `newUsers` collection.
`json
      { $merge: { into: "newUsers" } }
      `

**17. $vectorSearch:** - **Definition:** Performs vector-based search queries. - **Example:** Find documents based on vector similarity.
`json
      { $vectorSearch: { searchVector: [0.1, 0.2, 0.3], topK: 5, vectorField: "featureVector" } }
      `

**18. $unwind:** - **Definition:** Deconstructs an array field from the input documents to output a document for each element. - **Example:** Unwind the `hobbies` array.
`json
      { $unwind: "$hobbies" }
      `

**19. $unset:** - **Definition:** Removes specified fields from documents. - **Example:** Remove the `password` field.
`json
      { $unset: "password" }
      `

**20. $unionWith:** - **Definition:** Merges the results of multiple aggregation pipelines. - **Example:** Union with another collection.
`json
      { $unionWith: { coll: "archiveUsers" } }
      `

**21. $sortByCount:** - **Definition:** Groups documents by a specified expression and sorts by the count. - **Example:** Sort users by the count of ages.
`json
      { $sortByCount: "$age" }
      `

**22. $sort:** - **Definition:** Sorts documents based on a specified field. - **Example:** Sort users by age in ascending order.
`json
      { $sort: { age: 1 } }
      `

**23. $skip:** - **Definition:** Skips a specified number of documents. - **Example:** Skip the first 5 users.
`json
      { $skip: 5 }
      `

**24. $setWindowFields:** - **Definition:** Computes values over documents in a window. - **Example:** Compute the average salary over a window of 3 documents.
`json
      { $setWindowFields: { partitionBy: "$department", sortBy: { salary: 1 }, output: { averageSalary: { $avg: "$salary", window: { documents: [ -1, 1 ] } } } } }
      `

**25. $set:** - **Definition:** Adds new fields or updates existing fields. - **Example:** Set the `status` field to "active".
`json
      { $set: { status: "active" } }
      `

**26. $searchMeta:** - **Definition:** Retrieves metadata related to search queries. - **Example:** Get metadata for a text search query.
`json
      { $searchMeta: { query: { text: { query: "mongodb", path: "content" } } } }
      `

**27. $search:** - **Definition:** Performs text search queries. - **Example:** Search for documents containing "mongodb".
`json
      { $search: { text: { query: "mongodb", path: "content" } } }
      `

**28. $sample:** - **Definition:** Randomly selects a specified number of documents. - **Example:** Sample 5 random users.
`json
      { $sample: { size: 5 } }
      `

**29. $replaceWith:** - **Definition:** Replaces the input document with the specified document. - **Example:** Replace the document with the `userDetails` field.
`json
      { $replaceWith: "$userDetails" }
      `

**30. $replaceRoot:** - **Definition:** Replaces the input document with the specified document. - **Example:** Replace the root with the `userDetails` field.
`json
      { $replaceRoot: { newRoot: "$userDetails" } }
      `

**31. $redact:** - **Definition:** Filters the content of documents based on information in the documents themselves. - **Example:** Redact sensitive information based on access levels.
`json
      { $redact: { $cond: { if: { $eq: [ "$accessLevel", "restricted" ] }, then: "$$PRUNE", else: "$$KEEP" } } }
      `

**32. $project:** - **Definition:** Reshapes documents by including, excluding, or adding

fields. - **Example:** Include only the `name` and `age` fields.
`json
      { $project: { name: 1, age: 1, _id: 0 } }
      `

**33. $out:** - **Definition:** Writes the resulting documents to a specified collection. - **Example:** Output results to a new collection called `filteredUsers`.
`json
      { $out: "filteredUsers" }
      `

---

These stages allow for powerful data aggregation and transformation in MongoDB.
