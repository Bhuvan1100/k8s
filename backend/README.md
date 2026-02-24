# CartCraft 🛒  
E-commerce Platform (Microservices Architecture)

CartCraft is a scalable, event-driven e-commerce platform inspired by real-world systems.  
It is built using a **microservices architecture** with a strong emphasis on **domain isolation**,  
**asynchronous communication**, and **production-ready system design**.

---

## Architecture Overview

- Single public entry point via API Gateway
- Domain-driven microservices
- Event-based communication using Kafka
- Asynchronous background processing using queues
- Inventory locking and eventual consistency
- Observability-first design

All external traffic enters through the **API Gateway**, while internal services communicate through
events and background workers.

---

## Backend Services

### API Gateway
Acts as the single public entry point for all client requests.

**Responsibilities**
- JWT authentication and verification
- Firebase token validation
- Role-Based Access Control (RBAC)
- Rate limiting
- Request validation
- Request tracing (correlation IDs)
- Metrics exposure for Prometheus and Grafana

All downstream services remain private and are accessed only through the gateway or events.

---

### Auth Service
Handles authentication and identity management.

**Responsibilities**
- User registration and login
- Token generation and validation
- Secure credential handling
- Session and identity lifecycle management

---

### Buyer Domain Service
Manages buyer-side business logic.

**Responsibilities**
- Buyer profile management
- Buyer order history
- Buyer-specific workflows
- Consuming order events from Kafka
- Triggering buyer notifications through background jobs

---

### Order Service
Acts as the **source of truth** for order lifecycle management.

**Responsibilities**
- Order creation and validation
- Inventory locking during order processing
- Order state transitions
- Payment success handling
- Emitting order lifecycle events to Kafka

The order service ensures consistency by acquiring inventory locks before finalizing orders.

---

### Seller Service
Handles seller-side operations and analytics.

**Responsibilities**
- Seller-specific order items
- Seller revenue and order statistics
- Seller verification and role updates via workers
- Consuming order events from Kafka
- Triggering seller notifications through background jobs

Each seller only receives data related to their own products.

---

### Product Service
Manages product and inventory data.

**Responsibilities**
- Product creation and updates
- Variant management
- Pricing snapshots
- Inventory decrement after order confirmation
- Releasing inventory locks

Inventory updates are driven by Kafka events to ensure decoupling and scalability.

### Inventory Locking & Recovery

To prevent race conditions during order placement, inventory is **locked** when an order is initiated.
This ensures that concurrent requests cannot oversell the same product variant.

In case an order is not completed (e.g., payment failure or service crash), a **cron-based recovery mechanism**
automatically unlocks stale inventory after a defined timeout.

This guarantees:
- No permanent inventory lock
- Safe recovery from partial failures
- Eventual consistency across services

---

### Searching Service
Provides fast and scalable product search.

**Responsibilities**
- Product indexing using Meilisearch
- Full-text search
- Filtering and pagination
- Quantity updates based on order events

Search data is kept eventually consistent with product inventory.

---

### Communication Service
Responsible for outbound communication.

**Responsibilities**
- Email notifications to buyers
- Email notifications to sellers
- Event-driven email processing
- Background workers using BullMQ
- Retry and failure isolation

All communication is handled asynchronously to avoid blocking core services.

---

## Infrastructure & Cross-Cutting Concerns

### Communication & Queues
- **Kafka** for inter-service event streaming and fan-out
- **BullMQ + Redis** for background jobs and async workflows
- Redis used for queue management and transient state handling

### Observability
- Centralized logging
- Request tracing across services
- Metrics collection
- Prometheus and Grafana integration

### Performance & Reliability
- Inventory locking to prevent race conditions
- Idempotent event consumers
- Pagination strategies
- Async-first workflows
- Failure isolation across services

---

## Design Principles

- Domain-driven design
- Loose coupling with strong service boundaries
- Event-driven communication
- Eventual consistency
- Failure isolation
- Horizontal scalability
- Production-ready patterns

---

### AI pricing Strategy
- System which keeps a check on bought products and item added to cart
- decide with the help of AI models about demand and supply 
- Separate price calculating strategy based on AI output 
- Admin protak just approves and reject decision
- Full price Update automation

## Repository Structure



---

## 🚀 Tech Stack

- Node.js  
- Python  
- PostgreSQL  
- Redis  
- Kafka  
- BullMQ  
- Meilisearch  
- Prometheus & Grafana  
- LangGraph  

---

## 📌 Portfolio Summary

Built a scalable microservices-based e-commerce platform featuring event-driven architecture (Kafka), inventory locking with recovery, AI-assisted dynamic pricing using LangGraph, async workflows with Redis/BullMQ, and full observability with Prometheus & Grafana.

