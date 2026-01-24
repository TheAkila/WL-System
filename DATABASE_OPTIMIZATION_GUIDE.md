# Database Performance Optimization Guide

## Issues Identified

### 1. **Missing JOINs (N+1 Problem)**
The `getAthletes` query fetches only basic athlete data without related team/session info:
```javascript
let query = supabase.from('athletes').select('*');
```

This causes frontend to make separate API calls for related data.

### 2. **Missing Relationship Joins**
Critical relationships not being joined:
- Athletes missing `team:teams(*)` and `session:sessions(*)`
- Sessions missing `competition:competitions(*)`
- Attempts missing detailed athlete/session info

### 3. **No Pagination**
All records fetched without limits, causing:
- Large response payloads
- Slow API transfer times
- High memory usage on frontend

### 4. **Subquery Performance in Views**
The `leaderboard` view has expensive subqueries:
```sql
(SELECT COUNT(*) FROM attempts WHERE athlete_id = a.id AND lift_type = 'snatch')
```
These execute for every row returned.

### 5. **Missing Composite Indexes**
No multi-column indexes for common query patterns like:
- `(session_id, status)`
- `(athlete_id, lift_type)`
- `(session_id, lift_type, timestamp)`

## Solutions Implemented

### Solution 1: Add JOINs to API Queries
Update controllers to fetch related data in single query.

### Solution 2: Add Pagination
Implement limit/offset parameters for all list endpoints.

### Solution 3: Add Composite Indexes
Create indexes for common query combinations.

### Solution 4: Optimize View Query
Move subqueries to indexes or materialized data.

### Solution 5: Add Query Limits
Limit athlete/attempt queries to recent data by default.

## Implementation Steps

1. **Update Athlete Controller** - Add team/session joins
2. **Update Session Controller** - Add competition joins  
3. **Update Attempt Controller** - Add pagination
4. **Create Migration** - Add composite indexes
5. **Update Frontend** - Implement pagination queries
6. **Add Caching** - Redis caching for leaderboard

## Performance Improvements Expected

- ✅ **50-70% faster initial page load** (fewer API calls)
- ✅ **30-40% smaller payload sizes** (pagination)
- ✅ **80% faster leaderboard queries** (composite indexes)
- ✅ **Better real-time responsiveness** (chunked data)

## Rollout Strategy

1. Deploy indexes (non-blocking)
2. Update backend APIs with JOINs
3. Update frontend to use paginated endpoints
4. Test with real data volumes
5. Monitor query performance

## Monitoring Queries

Check slow query log:
```sql
-- View active queries
SELECT query, query_start, state
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC;
```

Enable slow query logging:
```sql
ALTER SYSTEM SET log_min_duration_statement = 100;
SELECT pg_reload_conf();
```
