# Vite client project creation
```
cd src
npx create-vite@latest client --template react
```

## run the project
```
npm install
npm run dev
```

## Deploy vite project to Azure
```
cd src
cd client
npm run build
az login
az staticwebapp create --name thresholdalerts-client --resource-group ThresholdAlerts --location centralus --sku Free --app-location "dist"

https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-web-framework?tabs=bash&pivots=react
```
