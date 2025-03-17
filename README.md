# Vite client project creation
```
npx create-vite@latest client --template react
```

## run the project
```
npm install
npm run dev
```

## Deploy vite project to Azure
```
npm run build
az login
az staticwebapp create --name thresholdalerts-client --resource-group ThresholdAlerts --location centralus --sku Free --app-location "dist" --source https://github.com/efalabrini/ThresholdAlerts-client.git --branch main --login-with-github

https://learn.microsoft.com/en-us/azure/static-web-apps/deploy-web-framework?tabs=bash&pivots=react
```
