FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /app
COPY ObligatorioAPI.csproj .
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

WORKDIR /app
EXPOSE 8080
COPY --from=build /out .
ENTRYPOINT ["dotnet", "ObligatorioAPI.dll"]
