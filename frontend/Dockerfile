FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
RUN addgroup -S caredesk && adduser -S caredesk -G caredesk \
    && mkdir -p /var/cache/nginx /tmp \
    && chown -R caredesk:caredesk /var/cache/nginx /tmp /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN chown -R caredesk:caredesk /usr/share/nginx/html
USER caredesk
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
