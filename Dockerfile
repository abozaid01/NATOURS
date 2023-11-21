# FROM node:18

# WORKDIR /app

# COPY package.json .

# # Set the default NODE_ENV to development if not provided during build
# ARG NODE_ENV=devlopment

# # Install dependencies based on NODE_ENV
# RUN if [ "$NODE_ENV" = "production" ]; then \
#         npm install --omit=dev; \
#     else \
#         npm install; \
#     fi

# COPY . .

# # Set the CMD based on NODE_ENV
# CMD [ "sh", "-c", "if [ \"$NODE_ENV\" = \"production\" ]; then npm start; else npm run dev; fi" ]

###########################################################33

# Stage 1: Base Image Stage
FROM node:alpine AS base

# Stage 2 : Development Stage
FROM base as builder
WORKDIR /app
COPY package* ./
RUN npm i
COPY . .
RUN npm run build
CMD ["npm", "run", "dev"]

# Stage 3: Production stage
FROM base as production

WORKDIR /app
COPY package* ./
RUN npm install --production
COPY --from=builder ./app/dist ./dist
CMD [ "npm", "start" ]