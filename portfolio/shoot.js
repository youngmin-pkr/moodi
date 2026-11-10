// 포트폴리오 목업용 앱 화면 캡처: node portfolio/shoot.js (Playwright 필요)
const {chromium}=require('playwright');
const path=require('path');
const out=path.join(__dirname,'screens');
const recs=[
 ['2026-11-10',0,'작은 행복을 발견한 날','퇴근길 하늘이 참 예뻤다.\n잠깐 멈춰서 바라보는 것만으로도\n마음이 편안해졌다.\n\n평범한 하루에도 이렇게 작은 행복이\n숨어 있다는 걸 오래 기억하고 싶다.'],
 ['2026-11-09',2,'잠깐의 여유','따뜻한 차 한 잔과 함께 쉬었다.'],
 ['2026-11-08',1,'기다리던 약속','좋아하는 사람들과 함께한 시간.'],
 ['2026-11-07',0,'주말 산책','햇살 좋은 공원을 오래 걸었다.'],
 ['2026-11-06',6,'긴 하루 끝에','마감을 끝내고 바로 잠들었다.'],
 ['2026-11-05',5,'발표 전날','준비는 했지만 마음이 조금 떨렸다.'],
 ['2026-11-04',0,'칭찬 한마디','동료의 말 한마디에 하루가 밝아졌다.'],
 ['2026-11-03',3,'비 오는 화요일','괜히 마음이 가라앉는 날이었다.'],
 ['2026-11-02',2,'느린 아침','알람 없이 일어나 천천히 아침을 먹었다.'],
 ['2026-11-01',1,'새로운 달','11월의 첫날, 새 다이어리를 샀다.'],
 ['2026-10-28',0,'가을 소풍','단풍이 예뻤다.'],['2026-10-21',4,'꼬인 일정','계획이 틀어져 속상했다.'],['2026-10-15',2,'혼자만의 시간','책을 읽었다.'],['2026-09-20',0,'추석','가족과 함께.'],['2026-08-11',1,'여행','바다에 갔다.'],['2026-07-03',7,'지친 여름','무기력한 날.'],
].map(([date,emotion,title,body],i)=>({id:String(1000+i),date,emotion,title,body,photos:[]}));
(async()=>{
 const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2});
 await ctx.addInitScript(r=>{localStorage.setItem('moodi.records',JSON.stringify(r));localStorage.setItem('moodi.profile',JSON.stringify({name:'무디',reminder:'21:00'}))},recs);
 await ctx.route('**/pretendard**',r=>r.abort());
 
 const p=await ctx.newPage();
 await p.goto('file://'+path.join(__dirname,'..','index.html'));
 await p.waitForTimeout(400);
 const shots=[
  ['home',`page='home';render()`],
  ['welcome',`page='welcome';render()`],
  ['login',`page='login';render()`],
  ['signup',`page='signup';render()`],
  ['emotion',`selected=1;page='emotion';render()`],
  ['diary',`draft={date:'2026-11-10',emotion:1,title:'설레는 첫 출근 날',body:'새로운 팀, 새로운 자리.\\n긴장했지만 다들 따뜻하게 맞아주셔서\\n하루 종일 두근거렸다.',photos:[]};page='diary';render()`],
  ['saved',`page='saved';render()`],
  ['detail',`currentId='1000';page='detail';render()`],
  ['record',`filter=-1;search='';month='2026-11';page='record';render()`],
  ['stats-week',`statPeriod='week';statAnchor='2026-11-10';page='stats';render()`],
  ['stats-month',`statPeriod='month';statAnchor='2026-11-10';page='stats';render()`],
  ['stats-year',`statPeriod='year';statAnchor='2026-11-10';page='stats';render()`],
  ['profile',`page='profile';render()`],
 ];
 for(const [n,js] of shots){await p.evaluate(js);await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(150);await p.screenshot({path:`${out}/${n}.png`});}
 await b.close();
})();
