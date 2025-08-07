FROM node:20-alpine as builder
WORKDIR /app/leetcode-analysis
COPY ./leetcode-analysis/dist  ./dist

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/leetcode-analysis/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]