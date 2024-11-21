# Audit Log Microservice

This microservice is designed to handle audit logs using NestJS, Prisma, and MongoDB. It offers a TCP interface for
interacting with the audit log database, specifically providing a `put` method to insert log data into MongoDB.

## Features

- **TCP Interface**: Communicate with the service using TCP for robust and low-latency interactions.
- **Prisma ORM**: Utilizes Prisma to interact with MongoDB, ensuring efficient and reliable database operations.
- **MongoDB**: Stores logs in a scalable and flexible NoSQL database.

### Usage

The microservice provides a TCP method put to insert audit logs. Ensure your TCP client is set up to interact with the
server on the designated port.
