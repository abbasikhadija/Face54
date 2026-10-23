import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests',timeout:120000,webServer:{command:'npm run preview',url:'http://127.0.0.1:4173/Face54/',reuseExistingServer:false},projects:[{name:'chrome',use:{browserName:'chromium',channel:'chrome'}},{name:'edge',use:{browserName:'chromium',channel:'msedge'}}]});
