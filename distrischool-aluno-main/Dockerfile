FROM eclipse-temurin:17-jdk-focal AS build
WORKDIR /app

COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn/
RUN chmod +x mvnw
COPY src /app/src


RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-focal
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "app.jar"]