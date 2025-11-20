FROM eclipse-temurin:17-jdk-focal AS build
WORKDIR /app

COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn/
RUN chmod +x mvnw
COPY src /app/src


RUN ./mvnw clean package -DskipTests

FROM openjdk:17.0.1-jdk-slim
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "app.jar"]