# Backend – Microservices Architecture

This folder contains the backend implementation of the project.
The backend is designed using a **microservices-based architecture**, where each service is responsible for a single domain.

---

## 📦 Services

##

---

start apiGateWay
-start new redis = docker run -d --name redis -p 6379:6379 redis
-start old redis  = docker start redis
node src/index.js

--- 

start authService
-start new postgres = docker run -d --name postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=auth -p 5432:5432 postgres
-start old postgres = docker start postgres
-optional = sometime migration can be need in case of using prisma with new dbs(npx prisma migrate / npx prisma reset)
node src/index.js

---
