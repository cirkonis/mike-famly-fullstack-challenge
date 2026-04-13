FROM eclipse-temurin:17-jdk-jammy

# Install sbt
RUN apt-get update && apt-get install -y curl gnupg2 && \
    echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | tee /etc/apt/sources.list.d/sbt.list && \
    curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x99E82A75642AC823" | apt-key add && \
    apt-get update && apt-get install -y sbt

# Set the working directory inside the container
WORKDIR /app

# Copy the build definition files (this allows Docker to cache dependencies if no code changes occur)
COPY ./build.sbt ./project/ /app/

# Run `sbt update` to cache dependencies
RUN sbt update

# Copy the rest of the project files
COPY . .

# Expose the port on which the application runs (adjust the port according to your app)
EXPOSE 9000

# Start sbt with file watching
CMD ["sbt", "~test;reStart"]

