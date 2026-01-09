# Experience API – Architecture & Abstractions

## Goal
Provide a thin Experience API that powers a telecom cart UI on top of a
non-persistent Salesforce cart context.

The Experience API:
- Owns NO database
- Handles Salesforce cart context expiry
- Orchestrates cart operations
- Normalizes responses for frontend consumption

## Key Constraints
- Salesforce cart is non-persistent and expires
- No direct Salesforce API calls (use test double)
- Stateless HTTP layer
- In-memory context only

## High-Level Flow

Client → Experience API → SalesforceCartClient (test double)

The Experience API:
1. Accepts cart operations (create, add item, view)
2. Ensures a valid Salesforce cart context exists
3. Recreates context transparently if expired
4. Returns normalized cart state

## Core Abstractions

### ExperienceCartService
Orchestrates cart lifecycle.
- getOrCreateCart()
- addItem()
- getCart()

### SalesforceCartClient (Test Double)
Simulates Salesforce behavior.
- createCart()
- addItem()
- getCart()
- Enforces TTL-based expiry

### InMemoryContextStore
Maps `sessionId → salesforceCartId`
- TTL based
- No persistence

### Domain Models
Pure objects:
- Cart
- CartItem
- Pricing

## Error Handling Strategy
- Expired Salesforce context → recreate cart automatically
- Invalid product → validation error
- Unknown cart → 404

## Non-Goals
- Authentication
- Promotions
- Checkout
- Persistence
