# MongoDB Geospatial Index Upgrade Guide

## Overview
This document explains the change made to the `Product` model geospatial index. The index was moved from a nested field to the top-level GeoJSON object to support efficient proximity queries.

## The Change

### Before (Nested Index)
```javascript
// backend/models/Product.js
ProductSchema.index({ "location.coordinates": "2dsphere" });
```
*Effect:* Indexed only the array of numbers. Did not fully support top-level GeoJSON queries.

### After (Standard GeoJSON Index)
```javascript
// backend/models/Product.js
ProductSchema.index({ location: "2dsphere" });
```
*Effect:* Indexes the entire `location` object (type and coordinates). This is the MongoDB recommended standard for "Point" data.

## Why this is Important

### 1. Query Matching (Performance)
The new API uses the `$geoWithin` operator on the `location` field. MongoDB indexes only work if they match the field being queried. 
- **Old index:** The database would perform a "Collection Scan" (reading every single document) because the query field (`location`) didn't match the index field (`location.coordinates`).
- **New index:** The database performs an "Index Seek," finding nearby products in milliseconds regardless of database size.

### 2. Standard Compliance
By indexing the entire object, we ensure that MongoDB correctly interprets the `coordinates` as `[longitude, latitude]` on a spherical surface, providing more accurate distance calculations.

## Database Cleanup Instructions

When you apply this change to an existing database, Mongoose will create the new index, but it may leave the old one behind. To keep your database lean, run the following command in your MongoDB shell (Compass or Atlas):

```javascript
// 1. List all indexes to find the exact name of the old one
db.products.getIndexes()

// 2. Drop the redundant nested index
// It is likely named "location.coordinates_2dsphere"
db.products.dropIndex("location.coordinates_2dsphere")
```

## Verification
You can verify the upgrade is working by checking the "Explain Plan" of a product search. You should see **"IXSCAN"** (Index Scan) instead of **"COLLSCAN"** (Collection Scan).
