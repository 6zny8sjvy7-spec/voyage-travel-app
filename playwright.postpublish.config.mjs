import {defineConfig,devices} from "@playwright/test";
export default defineConfig({testDir:"./tests",testMatch:"v2-postpublish.spec.mjs",timeout:45000,
expect:{timeout:10000},fullyParallel:false,workers:1,retries:0,reporter:"list",
use:{trace:"retain-on-failure",screenshot:"only-on-failure"},
projects:[{name:"Public Chromium desktop",use:{...devices["Desktop Chrome"]}},
{name:"Public iPhone WebKit",use:{...devices["iPhone 13"],browserName:"webkit"}}]
});