# Use the official .NET 10 SDK image to build the app
# Note: ensure your Docker host has access to a .NET 10 image (preview/stable depending on availability)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore dependencies
COPY ["IUS.ExamSystem.sln", "."]
COPY ["IUS.ExamSystem.API/IUS.ExamSystem.API.csproj", "IUS.ExamSystem.API/"]
COPY ["IUS.ExamSystem.Application/IUS.ExamSystem.Application.csproj", "IUS.ExamSystem.Application/"]
COPY ["IUS.ExamSystem.Domain/IUS.ExamSystem.Domain.csproj", "IUS.ExamSystem.Domain/"]
COPY ["IUS.ExamSystem.Infrastructure/IUS.ExamSystem.Infrastructure.csproj", "IUS.ExamSystem.Infrastructure/"]

RUN dotnet restore "IUS.ExamSystem.sln"

# Copy everything else and build
COPY . .
WORKDIR "/src/IUS.ExamSystem.API"
RUN dotnet build "IUS.ExamSystem.API.csproj" -c Release -o /app/build

# Publish the app
FROM build AS publish
RUN dotnet publish "IUS.ExamSystem.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official .NET 10 runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port 80
EXPOSE 80

# Run the app
ENTRYPOINT ["dotnet", "IUS.ExamSystem.API.dll"]