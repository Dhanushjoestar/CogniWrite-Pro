    FROM openjdk:22-jdk-slim


    WORKDIR /app
    COPY mvnw .
    COPY .mvn .mvn
    COPY pom.xml .
    COPY src src
    RUN ./mvnw clean install -DskipTests
    EXPOSE 8080
    ENTRYPOINT ["java", "-jar", "target/cogniwrite-0.0.1-SNAPSHOT.jar"]
