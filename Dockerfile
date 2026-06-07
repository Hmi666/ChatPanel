FROM nginx:1.27-alpine

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY dist /usr/share/nginx/html

EXPOSE 6001

CMD ["nginx", "-g", "daemon off;"]
