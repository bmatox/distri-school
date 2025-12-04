# Guia Completo dos Scripts PowerShell - DistriSchool

## 📋 Visão Geral

Este guia fornece instruções completas e detalhadas sobre como usar os scripts PowerShell do DistriSchool para testar a aplicação ponta a ponta. O objetivo é que qualquer usuário, mesmo sem experiência prévia com Kubernetes, consiga executar e testar toda a aplicação.

**Última Atualização:** 27 de outubro de 2025  
**Versão do full-deploy.ps1:** 2.0 (Melhorado)

---

## 🎯 O Que Você Vai Aprender

Neste guia você aprenderá:
1. Como preparar seu ambiente de desenvolvimento
2. Como executar o deploy completo do DistriSchool
3. Como testar a aplicação ponta a ponta
4. Como resolver problemas comuns
5. Como limpar e resetar o ambiente

---

## 📦 Pré-requisitos

Antes de começar, você precisa ter os seguintes softwares instalados:

### 1. Docker Desktop
- **Download:** https://www.docker.com/products/docker-desktop
- **Versão mínima:** 20.10+
- **Configuração recomendada:**
  - RAM: 8 GB
  - CPUs: 4
  - Disk: 60 GB

**Verificação:**
```powershell
docker --version
docker ps
```

### 2. Minikube
- **Download:** https://minikube.sigs.k8s.io/docs/start/
- **Versão mínima:** 1.30+

**Instalação via Chocolatey:**
```powershell
choco install minikube
```

**Instalação via Download Direto:**
```powershell
# Baixar o instalador
New-Item -Path 'c:\' -Name 'minikube' -ItemType Directory -Force
Invoke-WebRequest -OutFile 'c:\minikube\minikube.exe' -Uri 'https://github.com/kubernetes/minikube/releases/latest/download/minikube-windows-amd64.exe' -UseBasicParsing

# Adicionar ao PATH
$oldPath = [Environment]::GetEnvironmentVariable('Path', [EnvironmentVariableTarget]::Machine)
if ($oldPath.Split(';') -inotcontains 'C:\minikube'){
  [Environment]::SetEnvironmentVariable('Path', $('{0};C:\minikube' -f $oldPath), [EnvironmentVariableTarget]::Machine)
}
```

**Verificação:**
```powershell
minikube version
```

### 3. kubectl
- **Download:** https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/
- **Versão mínima:** 1.27+

**Nota:** kubectl geralmente vem com o Minikube, mas você pode instalar separadamente se necessário.

**Verificação:**
```powershell
kubectl version --client
```

### 4. PowerShell
- **Versão mínima:** 5.1 (Windows PowerShell) ou 7.0+ (PowerShell Core)
- Já vem instalado no Windows 10/11

**Verificação:**
```powershell
$PSVersionTable.PSVersion
```

### 5. Permissões de Administrador
- Você precisará executar alguns comandos como Administrador
- Especialmente para:
  - Modificar o arquivo `hosts`
  - Executar `minikube tunnel`

---

## 🚀 Guia Passo a Passo: Deploy Completo

Siga estas etapas cuidadosamente para fazer o deploy completo da aplicação.

### Passo 1: Clonar o Repositório

```powershell
# Navegue até o diretório onde deseja clonar
cd C:\Dev  # Ou qualquer outro diretório de sua preferência

# Clone o repositório
git clone https://github.com/bmatox/distrischool-professor-tecadm-service.git

# Entre no diretório
cd distrischool-professor-tecadm-service
```

### Passo 2: Verificar Pré-requisitos

Antes de executar o deploy, verifique se tudo está instalado:

```powershell
# Verificar Docker
docker --version
docker ps

# Verificar Minikube
minikube version

# Verificar kubectl
kubectl version --client

# Se algum comando falhar, instale o software correspondente
```

### Passo 3: Iniciar o Docker Desktop

1. Abra o Docker Desktop
2. Aguarde até que o ícone do Docker na bandeja do sistema indique que está rodando
3. Verifique com: `docker ps` (não deve dar erro)

### Passo 4: Executar o Script de Deploy

**IMPORTANTE:** Execute como administrador se você quiser que o script configure automaticamente o arquivo hosts.

```powershell
# Opção 1: Executar como administrador (recomendado)
# Clique com botão direito no PowerShell → "Executar como Administrador"
cd C:\Dev\distrischool-professor-tecadm-service
.\full-deploy.ps1

# Opção 2: Executar sem ser administrador
# Você terá que configurar o arquivo hosts manualmente depois
.\full-deploy.ps1
```

### Passo 5: Aguardar o Deploy Completar

O script executará automaticamente as seguintes etapas:

1. **Verificação de Pré-requisitos** (5 segundos)
   - Verifica se minikube, kubectl e docker estão disponíveis

2. **Configuração do Minikube** (2-5 minutos)
   - Inicia o Minikube com 4 CPUs e 8 GB de RAM
   - Configura o driver docker
   - **Primeira vez pode demorar mais**

3. **Configuração do Ingress** (1-2 minutos)
   - Habilita o addon Ingress do Minikube
   - Configura o Ingress Controller como LoadBalancer
   - Aguarda os pods ficarem prontos

4. **Configuração do Docker** (10 segundos)
   - Configura o ambiente para usar o daemon Docker do Minikube
   - Isso permite buildar imagens diretamente no Minikube

5. **Build das Imagens Docker** (5-10 minutos)
   - Constrói as imagens de todos os serviços:
     - 📚 Professor Service
     - 👨‍🎓 Aluno Service
     - 👤 User Service
     - 🌐 API Gateway
     - 💻 Frontend
   - **Esta é a etapa mais demorada**

6. **Deploy da Infraestrutura** (1-2 minutos)
   - Deploy do PostgreSQL
   - Deploy do RabbitMQ
   - Aguarda pods ficarem prontos

7. **Deploy dos Backend Services** (2-3 minutos)
   - Deploy do Professor Service
   - Deploy do Aluno Service
   - Deploy do User Service
   - Deploy do API Gateway
   - Aguarda todos ficarem prontos (rollout status)

8. **Deploy do Frontend** (30 segundos - 1 minuto)
   - Deploy da aplicação React
   - Aguarda ficar pronto

9. **Deploy do Ingress** (10 segundos)
   - Aplica as regras de roteamento

10. **Configuração do Arquivo Hosts** (automático se for admin)
    - Adiciona `127.0.0.1 distrischool.local` ao arquivo hosts
    - Limpa o cache DNS

11. **Instruções Finais**
    - O script pausará e pedirá para você iniciar o `minikube tunnel`

**Tempo Total Estimado:** 10-20 minutos (dependendo do hardware)

### Passo 6: Iniciar o Minikube Tunnel

Esta é a etapa **MAIS IMPORTANTE** para que o Ingress funcione!

1. **Abra um NOVO PowerShell como Administrador**
   - Clique com botão direito no ícone do PowerShell
   - Escolha "Executar como Administrador"

2. **Execute o comando:**
   ```powershell
   minikube tunnel
   ```

3. **Deixe este terminal ABERTO**
   - Você verá algo como:
     ```
     Status:
         machine: minikube
         pid: 12345
         route: 10.96.0.0/12 -> 192.168.49.2
         minikube: Running
         services: [ingress-nginx-controller]
     ```
   - **NÃO FECHE** este terminal enquanto estiver usando o sistema

4. **Volte ao terminal anterior e pressione ENTER**

### Passo 7: Verificar o Deploy

Após pressionar ENTER, o script mostrará:

```powershell
====================================
Status dos Pods:
====================================
# Todos os pods devem estar "Running" ou "Completed"
```

```powershell
====================================
Status dos Serviços:
====================================
# Lista de todos os serviços
```

```powershell
====================================
Status do Ingress:
====================================
# Deve mostrar ADDRESS como 127.0.0.1
```

Se tudo estiver OK, você verá:

```
✅ Deploy Concluído!
🌐 URLs de Acesso:
   Frontend: http://distrischool.local
   API:      http://distrischool.local/api
```

---

## 🧪 Testando a Aplicação Ponta a Ponta

Agora que o deploy está completo, vamos testar cada parte da aplicação.

### Teste 1: Acessar o Frontend

1. **Abra seu navegador (Chrome, Edge, Firefox)**

2. **Acesse:** `http://distrischool.local`

3. **Você deve ver:**
   - A página inicial do DistriSchool
   - Menu de navegação
   - Sem erros no console (F12 → Console)

**Se não funcionar:**
- Verifique se o `minikube tunnel` está rodando
- Verifique se o arquivo hosts tem a entrada `127.0.0.1 distrischool.local`
- Aguarde 30 segundos e tente novamente
- Limpe o cache do navegador (Ctrl+Shift+Del)

### Teste 2: Verificar a API do Professor Service

#### Teste via Navegador

1. **Acesse:** `http://distrischool.local/api/v1/professores`

2. **Você deve ver um JSON com a lista de professores:**
   ```json
   {
     "content": [],
     "pageable": {...},
     "totalElements": 0,
     "totalPages": 0,
     "empty": true
   }
   ```

#### Teste via PowerShell (Curl)

```powershell
# Listar professores
curl.exe http://distrischool.local/api/v1/professores

# Se não funcionar, use Invoke-RestMethod:
Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores" -Method GET | ConvertTo-Json
```

### Teste 3: Criar um Professor (POST)

```powershell
# Preparar o corpo da requisição
$body = @{
    nome = "João Silva"
    email = "joao.silva@distrischool.com"
    cpf = "12345678901"
    departamento = "Ciência da Computação"
    titulacao = "DOUTOR"
    dataContratacao = "2025-01-01"
} | ConvertTo-Json

# Criar o professor
$professor = Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"

# Exibir o professor criado
$professor | ConvertTo-Json

# Salvar o ID para os próximos testes
$professorId = $professor.id
Write-Host "Professor criado com ID: $professorId"
```

**Você deve ver:**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao.silva@distrischool.com",
  "cpf": "12345678901",
  "departamento": "Ciência da Computação",
  "titulacao": "DOUTOR",
  "dataContratacao": "2025-01-01"
}
```

### Teste 4: Buscar um Professor Específico (GET)

```powershell
# Usar o ID salvo no teste anterior
$professor = Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores/$professorId" `
    -Method GET

# Exibir
$professor | ConvertTo-Json
```

### Teste 5: Atualizar um Professor (PUT)

```powershell
# Preparar os novos dados
$bodyUpdate = @{
    nome = "João Silva de Souza"
    email = "joao.silva@distrischool.com"
    cpf = "12345678901"
    departamento = "Engenharia de Software"
    titulacao = "DOUTOR"
    dataContratacao = "2025-01-01"
} | ConvertTo-Json

# Atualizar
$professorAtualizado = Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores/$professorId" `
    -Method PUT `
    -Body $bodyUpdate `
    -ContentType "application/json"

# Exibir
$professorAtualizado | ConvertTo-Json
```

**Você deve ver o nome e departamento atualizados.**

### Teste 6: Listar Todos os Professores com Paginação

```powershell
# Listar primeira página (10 itens por página)
$pagina1 = Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores?page=0&size=10" `
    -Method GET

# Exibir informações de paginação
Write-Host "Total de Elementos: $($pagina1.totalElements)"
Write-Host "Total de Páginas: $($pagina1.totalPages)"
Write-Host "Página Atual: $($pagina1.number)"
Write-Host "Número de Elementos nesta Página: $($pagina1.numberOfElements)"

# Exibir professores
$pagina1.content | Format-Table id, nome, departamento
```

### Teste 7: Deletar um Professor (DELETE)

```powershell
# Deletar o professor
Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores/$professorId" `
    -Method DELETE

Write-Host "Professor deletado com sucesso!"

# Verificar se foi deletado (deve dar erro 404)
try {
    Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores/$professorId" -Method GET
    Write-Host "ERRO: Professor ainda existe!"
} catch {
    Write-Host "✅ Confirmado: Professor foi deletado (404 esperado)"
}
```

### Teste 8: Testar a Integração Frontend + API

1. **Acesse o frontend:** `http://distrischool.local`

2. **Navegue até a seção de Professores** (se houver no menu)

3. **Crie um professor via interface:**
   - Clique em "Novo Professor" ou botão similar
   - Preencha os campos
   - Clique em "Salvar"
   - **Abra o DevTools (F12) → aba Network**
   - Você deve ver requisições para `/api/v1/professores` com status **201 Created**

4. **Liste os professores:**
   - Deve aparecer na lista
   - No DevTools → Network, você deve ver **200 OK**

5. **Edite o professor:**
   - Clique em "Editar"
   - Modifique algum campo
   - Salve
   - No DevTools → Network, você deve ver **200 OK** no PUT

6. **Delete o professor:**
   - Clique em "Deletar"
   - Confirme
   - No DevTools → Network, você deve ver **204 No Content**

### Teste 9: Verificar os Logs dos Serviços

```powershell
# Logs do API Gateway
kubectl logs -f deployment/api-gateway-deployment --tail=50

# Logs do Professor Service
kubectl logs -f deployment/professor-tecadm-deployment --tail=50

# Logs do Frontend
kubectl logs -f deployment/frontend-deployment --tail=50

# Logs do PostgreSQL
kubectl logs -f deployment/postgres-deployment --tail=50

# Para sair dos logs, pressione Ctrl+C
```

### Teste 10: Acessar o RabbitMQ Management

```powershell
# Obter a URL do RabbitMQ
minikube service rabbitmq-service --url

# Você verá duas URLs, use a da porta 15672
# Exemplo: http://127.0.0.1:xxxxx
```

1. **Copie a URL da porta 15672**
2. **Abra no navegador**
3. **Login:**
   - Usuário: `guest`
   - Senha: `guest`
4. **Explore as filas e exchanges**

### Teste 11: Acessar o Kubernetes Dashboard

```powershell
# Iniciar o dashboard
minikube dashboard
```

Isso abrirá automaticamente o navegador com o dashboard do Kubernetes, onde você pode:
- Ver todos os pods e seus status
- Ver logs em tempo real
- Ver métricas de uso de CPU e memória
- Gerenciar recursos visualmente

---

## 🔧 Troubleshooting: Resolvendo Problemas Comuns

### Problema 1: "minikube não está instalado"

**Erro:**
```
❌ Minikube não está instalado ou não está no PATH.
```

**Solução:**
```powershell
# Instalar via Chocolatey
choco install minikube

# OU baixar e instalar manualmente
# Ver seção de Pré-requisitos acima
```

### Problema 2: "Docker não está rodando"

**Erro:**
```
error during connect: Get "http://%2F%2F.%2Fpipe%2Fdocker_engine/_ping": open //./pipe/docker_engine: The system cannot find the file specified.
```

**Solução:**
1. Abra o Docker Desktop
2. Aguarde até que esteja "Running"
3. Execute `docker ps` para confirmar
4. Tente novamente: `.\full-deploy.ps1`

### Problema 3: "Build das imagens falhou"

**Erro:**
```
❌ Erro ao construir Professor Service
```

**Causas possíveis:**
- Dockerfile com erros
- Falta de recursos (RAM/CPU)
- Docker não configurado corretamente

**Solução:**
```powershell
# 1. Verificar se está usando o daemon do Minikube
minikube docker-env --shell powershell | Invoke-Expression

# 2. Listar imagens
docker images

# 3. Tentar build manual para ver o erro detalhado
cd caminho/do/serviço
docker build -t nome-da-imagem:latest .

# 4. Se der erro de memória, aumente a RAM do Docker Desktop:
# Docker Desktop → Settings → Resources → Memory → 8 GB

# 5. Tente o deploy novamente
cd C:\Dev\distrischool-professor-tecadm-service
.\full-deploy.ps1
```

### Problema 4: "Pods não ficam prontos"

**Erro:**
```
❌ professor-tecadm-deployment falhou ou atingiu o timeout.
```

**Solução:**
```powershell
# 1. Ver status dos pods
kubectl get pods -A

# 2. Ver detalhes do pod problemático
kubectl describe pod <nome-do-pod>

# 3. Ver logs do pod
kubectl logs <nome-do-pod>

# 4. Causas comuns:
# - ImagePullBackOff: Imagem não foi construída corretamente
#   Solução: Rebuildar a imagem
# - CrashLoopBackOff: Aplicação está crasheando
#   Solução: Ver os logs para identificar o erro
# - Pending: Falta de recursos
#   Solução: Aumentar recursos do Minikube ou liberar recursos do sistema

# 5. Deletar o pod para forçar recriação
kubectl delete pod <nome-do-pod>

# 6. Aguardar novo pod ser criado
kubectl get pods -w
```

### Problema 5: "Frontend não carrega (ERR_NAME_NOT_RESOLVED)"

**Erro no navegador:**
```
This site can't be reached
distrischool.local's server IP address could not be found.
```

**Solução:**
```powershell
# 1. Verificar se o arquivo hosts tem a entrada correta
Get-Content C:\Windows\System32\drivers\etc\hosts | Select-String "distrischool.local"

# 2. Se não aparecer nada, adicione manualmente (como Admin):
Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "`n127.0.0.1 distrischool.local"

# 3. Limpar cache DNS
ipconfig /flushdns

# 4. Verificar se o minikube tunnel está rodando
# Deve haver um PowerShell aberto como Admin executando: minikube tunnel

# 5. Testar com ping
ping distrischool.local
# Deve responder de 127.0.0.1
```

### Problema 6: "API retorna 404 Not Found"

**Erro no console do navegador:**
```
GET http://distrischool.local/api/v1/professores 404 (Not Found)
```

**Solução:**

✅ **Este problema já foi corrigido!** Veja o documento [API_GATEWAY_FIX.md](./API_GATEWAY_FIX.md) para detalhes.

Se ainda estiver ocorrendo:

```powershell
# 1. Verificar se o Ingress está com a configuração corrigida
kubectl get ingress distrischool-ingress -o yaml

# 2. Procurar por "rewrite-target" - NÃO deve existir
# 3. O path do API deve ser: /api (não /api(/|$)(.*))

# 4. Se estiver errado, aplicar a correção:
kubectl apply -f k8s-manifests/ingress.yaml

# 5. Forçar reload do Ingress Controller
kubectl delete pod -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# 6. Aguardar pod recriar
kubectl wait --for=condition=ready pod -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx --timeout=120s

# 7. Testar novamente
curl.exe http://distrischool.local/api/v1/professores
```

### Problema 7: "minikube tunnel pede senha repetidamente"

**Sintoma:**
O comando `minikube tunnel` fica pedindo senha do administrador várias vezes.

**Solução:**
Isso é normal no Windows. O tunnel precisa de permissões para criar rotas de rede.

**Alternativa:** Configurar o tunnel para rodar como serviço (avançado):
```powershell
# Este é um workaround mais permanente, mas requer configuração adicional
# Ver documentação: https://minikube.sigs.k8s.io/docs/handbook/accessing/
```

### Problema 8: "Porta 8080 já está em uso"

**Erro:**
```
Bind for 0.0.0.0:8080 failed: port is already allocated
```

**Solução:**
```powershell
# 1. Descobrir o que está usando a porta
netstat -ano | findstr :8080

# 2. Matar o processo (substitua <PID> pelo número encontrado)
taskkill /F /PID <PID>

# 3. Ou mudar a porta do serviço no deployment.yaml

# 4. Redeploy
kubectl delete deployment <nome-do-deployment>
kubectl apply -f k8s-manifests/<serviço>/deployment.yaml
```

### Problema 9: "Minikube muito lento"

**Sintomas:**
- Build das imagens demora muito
- Pods levam muito tempo para iniciar
- Sistema todo está lento

**Soluções:**

```powershell
# 1. Verificar recursos alocados
minikube config view

# 2. Parar o Minikube
minikube stop

# 3. Deletar o cluster
minikube delete

# 4. Recriar com mais recursos (se disponível)
minikube start --cpus=6 --memory=12288 --driver=docker

# 5. OU menos recursos se sua máquina não aguenta
minikube start --cpus=2 --memory=6144 --driver=docker

# 6. Redeploy
.\full-deploy.ps1
```

### Problema 10: "Clean-setup não remove tudo"

**Sintoma:**
Após executar `clean-setup.ps1`, algumas imagens ou recursos ainda existem.

**Solução:**
```powershell
# 1. Forçar deleção do Minikube
minikube delete --all --purge

# 2. Limpar imagens Docker
docker system prune -a --volumes

# 3. Remover contexto kubectl
kubectl config delete-context minikube
kubectl config delete-cluster minikube

# 4. Recriar ambiente do zero
.\full-deploy.ps1
```

---

## 🧹 Limpando o Ambiente

### Script de Limpeza: `clean-setup.ps1`

Quando você quiser parar tudo e liberar recursos:

```powershell
# Executar o script de limpeza
.\clean-setup.ps1

# O script irá perguntar:
# "Tem certeza que deseja DELETAR o cluster Minikube?"
# Digite: Y

# Depois irá perguntar:
# "Deseja remover as imagens Docker do DistriSchool?"
# Digite: Y (se quiser remover) ou N (se quiser manter para próximo deploy)
```

**O que o script faz:**
1. Remove o Ingress
2. Remove o Frontend
3. Remove todos os Backend Services
4. Remove a Infraestrutura (Postgres, RabbitMQ)
5. Deleta o cluster Minikube
6. Opcionalmente remove as imagens Docker

### Limpeza Manual (se preferir)

```powershell
# 1. Parar o minikube tunnel (Ctrl+C no terminal que está rodando)

# 2. Deletar todos os recursos do Kubernetes
kubectl delete all --all

# 3. Deletar o Ingress
kubectl delete ingress --all

# 4. Parar o Minikube
minikube stop

# 5. Deletar o cluster
minikube delete

# 6. Remover imagens (opcional)
docker images | Select-String "distrischool" | ForEach-Object {
    $imageName = ($_ -split '\s+')[0]
    $imageTag = ($_ -split '\s+')[1]
    docker rmi "$imageName:$imageTag"
}

# 7. Limpar cache do Docker
docker system prune -a
```

---

## 📚 Scripts Disponíveis

### 1. `full-deploy.ps1` - Deploy Completo

**O que faz:**
- Verifica pré-requisitos
- Inicia e configura o Minikube
- Habilita e configura o Ingress
- Builda todas as imagens Docker
- Faz deploy de todos os serviços
- Configura o arquivo hosts
- Fornece instruções de acesso

**Quando usar:**
- Primeira vez configurando o ambiente
- Após executar `clean-setup.ps1`
- Quando quiser garantir um ambiente limpo
- Para fazer demo da aplicação

**Tempo estimado:** 10-20 minutos

**Exemplo de uso:**
```powershell
# Como administrador (recomendado)
.\full-deploy.ps1

# Após o script pedir, abra outro PowerShell como Admin e execute:
minikube tunnel

# Volte ao terminal anterior e pressione ENTER
```

### 2. `clean-setup.ps1` - Limpeza Completa

**O que faz:**
- Remove todos os recursos do Kubernetes
- Deleta o cluster Minikube
- Opcionalmente remove imagens Docker

**Quando usar:**
- Quando quiser limpar completamente o ambiente
- Antes de um novo deploy do zero
- Para liberar recursos do sistema
- Para resolver problemas de estado inconsistente

**Tempo estimado:** 2-5 minutos

**Exemplo de uso:**
```powershell
.\clean-setup.ps1
# Confirme as perguntas com Y ou N
```

### 3. `setup-dev-env.ps1` - Deploy Rápido (Legacy)

**Nota:** Este script foi substituído pelo `full-deploy.ps1`, que é mais robusto e completo.

---

## 🔄 Fluxos de Trabalho Comuns

### Fluxo 1: Primeira Vez Usando DistriSchool

```powershell
# 1. Instalar pré-requisitos (Docker, Minikube, kubectl)
# Ver seção de Pré-requisitos

# 2. Clonar o repositório
git clone https://github.com/bmatox/distrischool-professor-tecadm-service.git
cd distrischool-professor-tecadm-service

# 3. Executar deploy completo (como Admin)
.\full-deploy.ps1

# 4. Em outro PowerShell como Admin:
minikube tunnel

# 5. Acessar a aplicação
Start-Process "http://distrischool.local"

# 6. Testar a API
curl.exe http://distrischool.local/api/v1/professores
```

### Fluxo 2: Dia a Dia de Desenvolvimento

```powershell
# Ao iniciar o dia:
minikube start

# Em um PowerShell como Admin:
minikube tunnel

# Trabalhar normalmente, fazer alterações no código...

# Se alterou código de algum serviço, rebuild e redeploy:
# 1. Configurar Docker para usar Minikube
minikube docker-env --shell powershell | Invoke-Expression

# 2. Rebuild da imagem
cd caminho/do/serviço
docker build -t nome-da-imagem:latest .

# 3. Reiniciar o deployment
kubectl rollout restart deployment/nome-do-deployment

# Ao finalizar o dia (para liberar recursos):
# Ctrl+C no terminal do minikube tunnel
minikube stop
```

### Fluxo 3: Resetar Ambiente Completamente

```powershell
# 1. Limpar tudo
.\clean-setup.ps1
# Confirme com Y

# 2. Redeployar do zero
.\full-deploy.ps1

# 3. Minikube tunnel
minikube tunnel

# 4. Testar
Start-Process "http://distrischool.local"
```

### Fluxo 4: Demonstração para Cliente

```powershell
# 1. Um dia antes, garantir que tudo está OK
.\clean-setup.ps1
.\full-deploy.ps1
# Testar tudo

# 2. No dia da demo
minikube start
minikube tunnel  # Em terminal separado como Admin

# 3. Abrir aplicação
Start-Process "http://distrischool.local"

# 4. Durante a demo, mostrar:
# - Frontend funcional
# - Criar/editar/deletar professores
# - Logs em tempo real: kubectl logs -f deployment/...
# - Dashboard: minikube dashboard
# - RabbitMQ: minikube service rabbitmq-service --url

# 5. Após a demo
# Ctrl+C no tunnel
minikube stop
```

### Fluxo 5: Investigar Problema em Produção

```powershell
# 1. Ver status geral
kubectl get pods -A
kubectl get services
kubectl get ingress

# 2. Identificar pod problemático
kubectl get pods | Select-String "Error|CrashLoop|Pending"

# 3. Ver logs do pod
kubectl logs <nome-do-pod> --tail=100

# 4. Ver eventos
kubectl describe pod <nome-do-pod>

# 5. Se precisar acessar o container
kubectl exec -it <nome-do-pod> -- /bin/bash
# Ou para containers Alpine/BusyBox:
kubectl exec -it <nome-do-pod> -- /bin/sh

# 6. Testar conectividade entre serviços
kubectl exec -it <nome-do-pod> -- curl http://outro-servico:porta/endpoint

# 7. Ver logs do Ingress
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# 8. Restart de um serviço específico
kubectl rollout restart deployment/<nome-do-deployment>
```

---

## 📊 Recursos do Sistema

### Configuração Padrão do full-deploy.ps1

- **CPUs:** 4
- **Memória:** 8192 MB (8 GB)
- **Driver:** Docker

### Requisitos Reais do Sistema

Para rodar confortavelmente:
- **RAM total da máquina:** 16 GB (8 GB para Minikube + 8 GB para SO e outras apps)
- **CPU:** Intel i5/i7 ou AMD Ryzen 5/7 (4+ cores)
- **Disco:** SSD com 60 GB livres
- **SO:** Windows 10/11 64-bit

### Ajustando Recursos

Se sua máquina não tem 16 GB de RAM:

```powershell
# Edite o full-deploy.ps1 e mude a linha:
# De:
minikube start --cpus=4 --memory=8192 --driver=docker

# Para (exemplo com 6 GB):
minikube start --cpus=4 --memory=6144 --driver=docker
```

Ou crie um cluster manualmente:

```powershell
minikube start --cpus=2 --memory=4096 --driver=docker
```

**Nota:** Com menos recursos, algumas imagens podem demorar mais para buildar e os pods podem demorar mais para iniciar.

---

## 📝 Comandos Úteis

### Kubernetes (kubectl)

```powershell
# Ver todos os pods em todos os namespaces
kubectl get pods -A

# Ver pods do namespace default
kubectl get pods

# Ver detalhes de um pod
kubectl describe pod <nome-do-pod>

# Ver logs de um pod
kubectl logs <nome-do-pod>

# Ver logs em tempo real
kubectl logs -f <nome-do-pod>

# Ver logs das últimas N linhas
kubectl logs <nome-do-pod> --tail=50

# Ver serviços
kubectl get services

# Ver deployments
kubectl get deployments

# Ver ingress
kubectl get ingress

# Editar um recurso
kubectl edit deployment/<nome>

# Deletar um pod (será recriado)
kubectl delete pod <nome-do-pod>

# Deletar um deployment
kubectl delete deployment <nome-do-deployment>

# Aplicar um arquivo YAML
kubectl apply -f arquivo.yaml

# Aplicar todos os YAMLs de uma pasta
kubectl apply -f pasta/

# Reiniciar um deployment
kubectl rollout restart deployment/<nome-do-deployment>

# Ver status de um rollout
kubectl rollout status deployment/<nome-do-deployment>

# Ver histórico de rollouts
kubectl rollout history deployment/<nome-do-deployment>

# Fazer rollback
kubectl rollout undo deployment/<nome-do-deployment>

# Escalar um deployment
kubectl scale deployment/<nome-do-deployment> --replicas=3

# Port-forward para acessar um serviço localmente
kubectl port-forward deployment/<nome> 8080:8080

# Executar comando em um pod
kubectl exec -it <nome-do-pod> -- /bin/bash

# Ver eventos
kubectl get events --sort-by='.lastTimestamp'
```

### Minikube

```powershell
# Ver status
minikube status

# Iniciar
minikube start

# Parar
minikube stop

# Deletar
minikube delete

# Ver IP
minikube ip

# Acessar um serviço
minikube service <nome-do-serviço>
minikube service <nome-do-serviço> --url

# Dashboard web
minikube dashboard

# Ver logs do Minikube
minikube logs

# SSH no node do Minikube
minikube ssh

# Listar addons
minikube addons list

# Habilitar addon
minikube addons enable <nome-do-addon>

# Desabilitar addon
minikube addons disable <nome-do-addon>

# Ver configuração
minikube config view

# Configurar recurso
minikube config set memory 8192
minikube config set cpus 4

# Tunnel (para LoadBalancer funcionar)
minikube tunnel

# Ver perfis
minikube profile list

# Criar novo perfil
minikube start -p <nome-do-perfil>
```

### Docker

```powershell
# Listar imagens
docker images

# Listar containers rodando
docker ps

# Listar todos os containers
docker ps -a

# Ver logs de um container
docker logs <container-id>

# Remover imagem
docker rmi <image-id>

# Remover container
docker rm <container-id>

# Buildar imagem
docker build -t nome:tag .

# Limpar imagens não usadas
docker image prune

# Limpar tudo (cuidado!)
docker system prune -a

# Ver uso de disco
docker system df

# Configurar para usar daemon do Minikube
minikube docker-env --shell powershell | Invoke-Expression

# Voltar para daemon local do Docker Desktop
Remove-Item Env:\DOCKER_TLS_VERIFY
Remove-Item Env:\DOCKER_HOST
Remove-Item Env:\DOCKER_CERT_PATH
Remove-Item Env:\MINIKUBE_ACTIVE_DOCKERD
```

### PowerShell / Windows

```powershell
# Verificar se processo está rodando
Get-Process | Select-String "minikube"

# Ver processos ouvindo em uma porta
netstat -ano | findstr :8080

# Matar processo por PID
taskkill /F /PID <PID>

# Limpar DNS cache
ipconfig /flushdns

# Ver conteúdo do arquivo hosts
Get-Content C:\Windows\System32\drivers\etc\hosts

# Adicionar ao arquivo hosts (como Admin)
Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value "127.0.0.1 distrischool.local"

# Testar conectividade
Test-Connection -ComputerName distrischool.local -Count 4

# Fazer requisição HTTP
Invoke-RestMethod -Uri "http://distrischool.local/api/v1/professores"
Invoke-WebRequest -Uri "http://distrischool.local"

# Baixar arquivo
Invoke-WebRequest -Uri "http://..." -OutFile "arquivo.zip"
```

---

## 🎓 Dicas e Melhores Práticas

### 1. Sempre Use o Minikube Tunnel

❌ **Errado:**
```powershell
# Fazer deploy e esquecer do tunnel
.\full-deploy.ps1
# Tentar acessar http://distrischool.local
# ERRO: Site não carrega!
```

✅ **Certo:**
```powershell
# Fazer deploy
.\full-deploy.ps1

# EM OUTRO TERMINAL COMO ADMIN:
minikube tunnel

# Agora sim acessar
Start-Process "http://distrischool.local"
```

### 2. Verifique os Logs Sempre que Algo Não Funcionar

```powershell
# Antes de pedir ajuda, verifique os logs
kubectl logs deployment/api-gateway-deployment
kubectl logs deployment/professor-tecadm-deployment

# Logs geralmente revelam o problema!
```

### 3. Use Port-Forward para Debug

Se a API não estiver acessível via Ingress, teste diretamente:

```powershell
# Port-forward para o serviço
kubectl port-forward deployment/professor-tecadm-deployment 8082:8082

# Em outro terminal, teste
curl.exe http://localhost:8082/api/v1/professores

# Se funcionar aqui mas não via Ingress, o problema está no Ingress ou API Gateway
```

### 4. Mantenha as Imagens Atualizadas

Após mudanças no código:

```powershell
# Sempre rebuild
minikube docker-env --shell powershell | Invoke-Expression
cd professor-service
docker build -t distrischool-professor-tecadm-service:latest .
cd ..

# E restart o deployment
kubectl rollout restart deployment/professor-tecadm-deployment
```

### 5. Use o Dashboard para Visualização

```powershell
# Dashboard é ótimo para ver o estado geral
minikube dashboard

# Especialmente para:
# - Ver quais pods estão com problema
# - Ver logs de múltiplos pods
# - Editar recursos visualmente
```

### 6. Teste Localmente Antes de Deployar

```powershell
# Teste o build localmente
docker build -t teste:latest .
docker run -p 8082:8082 teste:latest

# Se funcionar localmente, deve funcionar no Kubernetes
```

### 7. Sempre Verifique o Status Após Deploy

```powershell
# Após deploy, sempre verifique:
kubectl get pods -A
kubectl get services
kubectl get ingress

# Procure por pods com status diferente de "Running":
# - Pending: Aguardando recursos
# - ImagePullBackOff: Problema com imagem
# - CrashLoopBackOff: Aplicação crasheando
# - Error: Erro fatal
```

### 8. Mantenha Backups dos Dados Importantes

Se você criar dados de teste importantes:

```powershell
# Backup do banco
kubectl exec deployment/postgres-deployment -- pg_dump -U postgres distrischool_db > backup.sql

# Restore
kubectl exec -i deployment/postgres-deployment -- psql -U postgres distrischool_db < backup.sql
```

### 9. Documente Suas Mudanças

Se você modificar alguma configuração:

```powershell
# RUIM: Editar diretamente no cluster
kubectl edit deployment/...

# BOM: Editar o arquivo YAML e aplicar
# Assim você tem histórico no Git
notepad k8s-manifests/professor-service/deployment.yaml
kubectl apply -f k8s-manifests/professor-service/deployment.yaml
git add k8s-manifests/professor-service/deployment.yaml
git commit -m "Aumentei réplicas para 3"
```

### 10. Limpe Regularmente

```powershell
# Pelo menos uma vez por semana:
docker system prune
kubectl delete pods --field-selector status.phase=Succeeded

# Ou use o clean-setup.ps1 para limpeza completa
```

---
