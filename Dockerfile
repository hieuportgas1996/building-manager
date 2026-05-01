FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

COPY ["BuildingManager/BuildingManager.csproj", "BuildingManager/"]
COPY ["BuildingManager.Domain/", "BuildingManager.Domain/"]
COPY ["BuildingManager.Application/", "BuildingManager.Application/"]
COPY ["BuildingManager.Infrastructure/", "BuildingManager.Infrastructure/"]
COPY ["BuildingManager/", "BuildingManager/"]

RUN dotnet restore "BuildingManager/BuildingManager.csproj"
RUN dotnet build "BuildingManager/BuildingManager.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BuildingManager/BuildingManager.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BuildingManager.dll"]
