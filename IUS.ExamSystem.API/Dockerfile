FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY .. .

RUN dotnet publish "IUS.ExamSystem.API/IUS.ExamSystem.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "IUS.ExamSystem.API.dll"]