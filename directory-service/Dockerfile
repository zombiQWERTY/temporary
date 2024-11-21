# pull official base image
FROM python:3.7-alpine

# set work directory
WORKDIR /usr/src/app

# set environment varibles
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

ARG DOCKER_GIT_CREDENTIALS

RUN apk add --no-cache git \
 && git config --global credential.helper store && echo "${DOCKER_GIT_CREDENTIALS}" > ~/.git-credentials

RUN git clone https://bitbucket.org/ittinc/migrations-package.git /migrations-package

# Copy the current directory contents into the container at /app
COPY ./source/ /usr/src/app
RUN apk add build-base
# Install any needed packages specified in requirements.txt
RUN pip install -U pip
RUN pip install --trusted-host pypi.python.org -r requirements.txt
# Delete after
RUN apk del build-base

COPY --from=migrate/migrate /migrate .
COPY --from=migrate/migrate /lib /lib
RUN chmod +x ./migrate

EXPOSE 8090

ENTRYPOINT ["python3", "main.py", "consul", "8500"]
