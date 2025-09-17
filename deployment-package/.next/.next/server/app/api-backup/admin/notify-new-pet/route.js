"use strict";(()=>{var e={};e.id=5652,e.ids=[5652],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},49329:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>m,patchFetch:()=>g,requestAsyncStorage:()=>c,routeModule:()=>u,serverHooks:()=>l,staticGenerationAsyncStorage:()=>d});var n={};r.r(n),r.d(n,{POST:()=>p});var a=r(73278),o=r(45002),i=r(54877),s=r(71309);async function p(e){try{let{petData:t,userEmail:r}=await e.json();if(!t)return s.NextResponse.json({error:"Pet data is required"},{status:400});let n=`🆕 Новое объявление: ${"lost"===t.type?"Потерялся питомец":"Нашли питомца"} - ${t.name}`,a=`
Новое объявление на сайте Хвостик Alert!

📋 Детали объявления:
• Тип: ${"lost"===t.type?"Потерялся питомец":"Нашли питомца"}
• Имя питомца: ${t.name}
• Порода: ${t.breed}
• Цвет: ${t.color}
• Местоположение: ${t.location}
• Описание: ${t.description}
• Контактное лицо: ${t.contact_name}
• Телефон: ${t.contact_phone}
${t.reward?`• Вознаграждение: ${t.reward} ₽`:""}

👤 Пользователь: ${r||"Анонимно"}
📅 Дата создания: ${new Date().toLocaleString("ru-RU")}

🔗 Ссылка на объявление: ${process.env.NEXTAUTH_URL||"http://localhost:3000"}/pet/${t.id}

---
Хвостик Alert - Поиск питомцев в Анапе
    `.trim();return console.log("\uD83C\uDD95 НОВОЕ ОБЪЯВЛЕНИЕ:",{subject:n,content:a,adminEmail:"agentgl007@gmail.com",timestamp:new Date().toISOString()}),s.NextResponse.json({success:!0,message:"Pet created and admin notification logged (email setup pending)"})}catch(e){return console.error("Notify admin API error:",e),s.NextResponse.json({error:e.message},{status:500})}}let u=new a.AppRouteRouteModule({definition:{kind:o.x.APP_ROUTE,page:"/api-backup/admin/notify-new-pet/route",pathname:"/api-backup/admin/notify-new-pet",filename:"route",bundlePath:"app/api-backup/admin/notify-new-pet/route"},resolvedPagePath:"D:\\DATA\\Hvastik-Alert\\app\\api-backup\\admin\\notify-new-pet\\route.ts",nextConfigOutput:"",userland:n}),{requestAsyncStorage:c,staticGenerationAsyncStorage:d,serverHooks:l}=u,m="/api-backup/admin/notify-new-pet/route";function g(){return(0,i.patchFetch)({serverHooks:l,staticGenerationAsyncStorage:d})}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),n=t.X(0,[7787,4833],()=>r(49329));module.exports=n})();