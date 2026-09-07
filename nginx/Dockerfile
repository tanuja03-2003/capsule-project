FROM nginx:alpine

# Copy custom NGINX configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Copy static frontend assets into standard NGINX web root
COPY EventHub /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
