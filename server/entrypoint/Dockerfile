FROM rust:1.87 AS builder
WORKDIR /server
COPY . .
RUN cargo build --release -p entrypoint

FROM debian:bookworm-slim
# RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /server/target/release/entrypoint /usr/local/bin/entrypoint
EXPOSE 3210
CMD ["entrypoint"]
