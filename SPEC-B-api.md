# Experience API – Endpoint Contracts

Base URL: /api

## Create or Fetch Cart
GET /cart?sessionId=abc123

Response 200:
{
  "cartId": "sf-123",
  "items": [],
  "total": 0
}

---

## Add Item to Cart
POST /cart/items

Request:
{
  "sessionId": "abc123",
  "sku": "DATA_PACK_10GB",
  "quantity": 1
}

Response 200:
{
  "cartId": "sf-123",
  "items": [
    {
      "sku": "DATA_PACK_10GB",
      "quantity": 1,
      "price": 299
    }
  ],
  "total": 299
}

---

## Get Cart
GET /cart/{sessionId}

Response 200:
(same as above)

## Error Responses
400 – Validation error  
404 – Cart not found  
500 – Unexpected error
