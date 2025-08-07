# --- Builder Stage ---
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod .
COPY go.sum .    
RUN go mod download
COPY . .
    
ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64
RUN go build -o /app/myapp ./cmd 
    
# --- Production Stage ---
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/myapp .
EXPOSE 8080
CMD ["./myapp"]