import {defineConfig,devices} from "@playwright/test";
export default defineConfig({
 testDir:"./tests",testMatch:"v2-forward.spec.mjs",
 timeout:45000,expect:{timeout:9000},fullyParallel:false,workers:1,retries:0,reporter:"list",
 use:{baseURL:"http://127.0.0.1:8765",trace:"retain-on-failure",screenshot:"only-on-failure"},
 projects:[
  {name:"Chromium desktop",use:{...devices["Desktop Chrome"]}},
  {name:"iPhone WebKit",use:{...devices["iPhone 13"],browserName:"webkit"}}
 ],
 webServer:{command:"python3 -m http.server 8765 --bind 127.0.0.1",url:"http://127.0.0.1:8765/v2-review-20261112/",reuseExistingServer:false,timeout:20000}
});