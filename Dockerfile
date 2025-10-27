# =============================================================
# ETAPA 1: Build da Aplicação com Maven
# Usando uma imagem com Maven e JDK 17 para compilar o projeto.
# O "AS build" cria um apelido para esta etapa.
# =============================================================
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Otimização de cache: Copia o pom.xml e baixa as dependências.
# Se apenas o código-fonte mudar, esta camada não é executada novamente.
COPY pom.xml .
RUN mvn dependency:go-offline

# Copia o resto do código-fonte
COPY src ./src

# Compila a aplicação e gera o arquivo .jar
RUN mvn clean package -DskipTests

# =============================================================
# ETAPA 2: Imagem Final de Execução
# Usando uma imagem "slim" do OpenJDK 17, que é otimizada e leve.
# =============================================================
FROM openjdk:17-slim

# Metadados da imagem
LABEL authors="Bruno Matos"

# Define o diretório de trabalho na imagem final
WORKDIR /app

# Copia apenas o artefato compilado (.jar) da etapa de build para a imagem final
# e o renomeia para 'app.jar' para um comando de execução padrão.
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta 8080, que é a padrão do Spring Boot
EXPOSE 8080

# Comando para executar a aplicação quando o contêiner iniciar
ENTRYPOINT ["java", "-jar", "app.jar"]