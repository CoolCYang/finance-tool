import{d as ae,r as v,u as oe,c as h,o as ne,a as _,b as U,e as a,w as u,f as se,E as ue,g as re,h as ie,v as de,i as r,F as D,j as T,k as $,l as ce,m as Y,n as fe,p as pe,q as ve,s as me,t as _e,x as we,y as xe,z as be,A as ge,B as H,C as z,D as he,G as ye,H as ke,I as Ee,_ as Ve}from"./index-D1sHjNmu.js";const De={class:"w-full flex flex-col p-2 box-border"},Te={class:"bg-white border-1 p-2 border-solid border-gray-2 shadow-md overflow-hidden"},Ce={class:"text-green-5"},Be={class:"flex-auto p-4 bg-white border-1 border-solid border-gray-2 border-t-0 shadow-md overflow-hidden",style:{height:"0"}},Ne=ae({__name:"index",setup(Re){const c=v(""),W=v([]),C=v(!1),j=v(),y=v(4),f=v(""),p=v(""),B=v([]),w=oe(),x=h(()=>w.fileList.value),O=["备注","商品名称","业务描述"],N=h(()=>x.value.find(e=>e.fileName===c.value)||{});function A(e){return Object.prototype.toString.call(e)==="[object String]"}const M=e=>A(e)?e==="序号"?50:e.includes("号")?200:e.includes("时间")?220:O.includes(e)?350:150:150;function G(e,l){if(l){const n=`<span style='color: red'>${l}</span>`;return e.replace(l,n)}else return e}const K=e=>A(e)?e.includes("时间")?({cellData:l})=>a("div",{style:"padding: 10px 0;"},[he(l).format("YYYY-MM-DD HH:mm:ss")||""]):e.includes("号")?null:f.value&&f.value===e&&p.value?({cellData:l})=>a("div",{style:"padding: 10px 0;",innerHTML:G(l,p.value)},null):({cellData:l})=>a("div",{style:"padding: 10px 0;"},[l]):null,q=e=>{if(B.value.includes(e))return ye.RIGHT},k=h(()=>{var l,n;const e=((n=(l=N.value)==null?void 0:l.headers)==null?void 0:n.map((o,s)=>({key:s,dataKey:o,title:o,minWidth:M(o),width:M(o),cellRenderer:K(o),fixed:q(o)})))||[];return e.unshift({key:"column-n-1",width:50,title:"序号",cellRenderer:({rowIndex:o})=>a("span",{style:"font-weight: bold;"},[`${o+1}`]),align:"center"}),e}),R=h(()=>{var e,l;return((l=(e=N.value)==null?void 0:e.data)==null?void 0:l.filter(n=>{var o;return f.value&&p.value?(o=n[f.value])==null?void 0:o.includes(p.value):!0}))||[]}),J=h(()=>k.value.filter(e=>{var l;return(l=e==null?void 0:e.title)==null?void 0:l.includes("额")})),P=e=>{var l;return(l=R.value)==null?void 0:l.reduce((n,o)=>{const s=Number(o[e]);return n+s},0).toFixed(2)},Q=async e=>{Z(e)};function X(){var e;(e=j.value)==null||e.scrollToTop(0)}const Z=async e=>{if(!e){ce("亲，请先上传数据哦~");return}C.value=!0;const l=e.raw,n=[],o=[],s=new Y.Workbook;await s.xlsx.load(await l.arrayBuffer());const m=s.getWorksheet(1),i=m.getRows(1,m.rowCount)??[],b=i[y.value];for(let d=0;d<b.cellCount;d++)n.push(b.getCell(d+1).value);for(let d=y.value+1;d<i.length;d++){const S=i[d],V={};n.forEach((F,I)=>{V[F]=S.getCell(I+1).value||""}),o.push(V)}const E={fileName:e.name,headers:n,data:o};await w.storeData(E),w.fileList.value.push(E),c.value=e.name,C.value=!1},L=async(e,l)=>{l=="remove"&&(await w.deleteData(e),await w.getStoreAll(),c.value===e&&(c.value=x.value.length?x.value[0].fileName:""))},ee=async()=>{var m;const e=new Y.Workbook,l=e.addWorksheet("Sheet 1");l.addRow((m=N.value)==null?void 0:m.headers),R.value.forEach(i=>{l.addRow(Object.values(i))}),l.columns.forEach(i=>{i.width=30});const n=await e.xlsx.writeBuffer(),o=new Blob([n],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}),s=f.value&&p.value?`${f.value}-${p.value}-筛选数据`:c.value;fe.saveAs(o,`${s}.xlsx`)};return ne(async()=>{await w.getStoreAll(),x.value.length&&(c.value=x.value[0].fileName)}),(e,l)=>{const n=ke,o=pe,s=ve,m=me,i=_e,b=we,E=xe,d=ue,S=Ee,V=re,F=be,I=ie,le=ge,te=de;return r(),_("div",De,[U("div",Te,[a(d,{class:"flex flex-wrap","label-suffix":"：",inline:""},{default:u(()=>[a(s,{label:"设置固定列"},{default:u(()=>[a(o,{modelValue:B.value,"onUpdate:modelValue":l[0]||(l[0]=t=>B.value=t),placeholder:"请选择筛选过滤项",style:{width:"240px"},multiple:"","collapse-tags":"","collapse-tags-tooltip":""},{default:u(()=>[(r(!0),_(D,null,T(k.value,t=>(r(),H(n,{key:t,label:t.title,value:t.title},null,8,["label","value"]))),128))]),_:1},8,["modelValue"])]),_:1}),a(s,{label:"筛选过滤项"},{default:u(()=>[a(o,{modelValue:f.value,"onUpdate:modelValue":l[1]||(l[1]=t=>f.value=t),placeholder:"请选择筛选过滤项",style:{width:"240px"}},{default:u(()=>[(r(!0),_(D,null,T(k.value,t=>(r(),H(n,{key:t,label:t.title,value:t.title},null,8,["label","value"]))),128))]),_:1},8,["modelValue"])]),_:1}),a(s,{label:"筛选过滤关键词"},{default:u(()=>[a(m,{style:{width:"240px"},modelValue:p.value,"onUpdate:modelValue":l[2]||(l[2]=t=>p.value=t),placeholder:"请输入需要筛选的关键词"},null,8,["modelValue"])]),_:1}),a(s,{label:"表头所在行"},{default:u(()=>[a(i,{modelValue:y.value,"onUpdate:modelValue":l[3]||(l[3]=t=>y.value=t),min:0},null,8,["modelValue"])]),_:1}),a(s,null,{default:u(()=>[a(E,{"file-list":W.value,"onUpdate:fileList":l[4]||(l[4]=t=>W.value=t),action:"","auto-upload":!1,"show-file-list":!1,accept:".xlsx, .xls,","on-change":Q},{default:u(()=>[a(b,{type:"primary"},{default:u(()=>[$("上传数据")]),_:1})]),_:1},8,["file-list"])]),_:1}),a(s,null,{default:u(()=>[a(b,{type:"primary",onClick:ee},{default:u(()=>[$("导出Excel")]),_:1})]),_:1}),a(s,null,{default:u(()=>[(r(!0),_(D,null,T(J.value,(t,g)=>(r(),_("span",{class:"mr-2",key:g},[U("span",null,"总"+z(t.title)+"：",1),U("span",Ce,z(P(t.title)),1)]))),128))]),_:1})]),_:1})]),a(V,{class:"bg-white mt-2",modelValue:c.value,"onUpdate:modelValue":l[5]||(l[5]=t=>c.value=t),closable:"",type:"card",onEdit:L},{default:u(()=>[(r(!0),_(D,null,T(x.value,(t,g)=>(r(),H(S,{key:g,label:t.fileName,name:t.fileName},null,8,["label","name"]))),128))]),_:1},8,["modelValue"]),se((r(),_("div",Be,[a(I,null,{default:u(({height:t,width:g})=>[a(F,{ref_key:"tableRef",ref:j,columns:k.value,data:R.value,width:g,height:t,fixed:""},null,8,["columns","data","width","height"])]),_:1}),a(le,{"visibility-height":0,right:50,bottom:50,onClick:X})])),[[te,C.value]])])}}}),Fe=Ve(Ne,[["__scopeId","data-v-ec2a947a"]]);export{Fe as default};
