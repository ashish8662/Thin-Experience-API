# Telecom Experience API

Thin Experience API for a telecom cart backed by a non-persistent Salesforce cart context.

## Tech Stack
- Node 20+
- TypeScript
- Express
- Jest
- Supertest

## Setup
```bash
npm install
```

## Run
```bash
npm run dev
```

Server starts on `http://localhost:3000`

## Test
```bash
npm test
```

## API Endpoints

### Create or Get Cart
```
GET /api/cart?sessionId=abc123
```
Returns or creates a cart for the given session.

**Response:**
```json
{
  "cartId": "sf-123",
  "items": [],
  "total": 0
}
```

### Add Item to Cart
```
POST /api/cart/items
Content-Type: application/json

{
  "sessionId": "abc123",
  "sku": "DATA_PACK_10GB",
  "quantity": 2
}
```

**Response:**
```json
{
  "cartId": "sf-123",
  "items": [
    {
      "sku": "DATA_PACK_10GB",
      "quantity": 2,
      "price": 299
    }
  ],
  "total": 598
}
```

### Get Cart by Session
```
GET /api/cart/{sessionId}
```

## Available SKUs and Pricing

| SKU | Price |
|-----|-------|
| DATA_PACK_10GB | $299 |
| DATA_PACK_20GB | $499 |
| DATA_PACK_50GB | $999 |
| VOICE_PLAN_100MIN | $199 |
| VOICE_PLAN_UNLIMITED | $399 |
| SMS_PACK_1000 | $99 |
| SMS_PACK_5000 | $399 |

## Architecture

### Key Abstractions

**ExperienceCartService**
- Orchestrates cart lifecycle
- Handles context expiry transparently
- Recreates Salesforce cart automatically if expired

**SalesforceCartClient (Test Double)**
- Simulates Salesforce behavior
- Enforces TTL-based expiry (60 seconds)
- In-memory storage only

**InMemoryContextStore**
- Maps `sessionId → salesforceCartId`
- TTL-based with automatic cleanup

### Error Handling
- Expired Salesforce context → cart recreated automatically
- Invalid SKU → 400 Bad Request
- Invalid input → 400 Bad Request
- Server errors → 500 Internal Server Error

## Key Decisions

1. **In-memory TTL store**: Simple, testable, meets non-persistent requirement
2. **Automatic cart recreation**: Handles Salesforce context expiry transparently
3. **Pure domain models**: No side effects, easy to test
4. **Validation at route layer**: Input validation before service calls
5. **Test double for Salesforce**: Realistic TTL behavior without external dependencies

## Tradeoffs & Known Gaps

- **No concurrency control**: Single-threaded, in-memory only
- **No distributed cache**: Not suitable for multi-server deployments
- **No authentication/authorization**: Scope out of assessment
- **No idempotency keys**: Cart operations are idempotent by default
- **Pricing hardcoded**: Could be fetched from Salesforce in production
- **No persistence**: Cart data lost on server restart

## Testing

Run all tests:
```bash
npm test
```

Test coverage includes:
- **ExperienceCartService**: Cart creation, item addition, TTL expiry, recreation
- **Route handlers**: Input validation, error responses, happy paths
- **Integration**: End-to-end API behavior with real service instances
