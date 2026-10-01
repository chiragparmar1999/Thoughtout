require('dotenv').config();
const express=require('express');
const cors=require('cors');
const path=require('path');
const crypto=require('crypto');
const supabase=require('./supabaseClient');
const razorpay=require('./razorpay');
const {TICKET_PRICES}=require('./pricing');

const app=express();
const ADMIN_KEY=process.env.ADMIN_KEY||'';
const db=Boolean(supabase);
const ADMIN_COOKIE='thoughtout_admin';
const USER_COOKIE='thoughtout_user';
const ADMIN_MAX_AGE=8*60*60*1000;
const USER_MAX_AGE=7*24*60*60*1000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

const dbRequired=(req,res,next)=>{
  if(!db) return res.status(503).json({error:'Database is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'});
  next();
};

function signToken(secret,payload){
  const body=String(payload);
  const sig=crypto.createHmac('sha256',secret).update(body).digest('hex');
  return body+'.'+sig;
}
function verifyToken(secret,token){
  if(!secret||!token) return null;
  const [body,sig]=String(token).split('.');
  if(!body||!sig) return null;
  const expected=crypto.createHmac('sha256',secret).update(body).digest('hex');
  if(sig.length!==expected.length) return null;
  try{if(!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected))) return null;}catch{return null;}
  return body;
}
function getCookie(req,name){
  const header=req.headers.cookie||'';
  const item=header.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));
  return item ? decodeURIComponent(item.slice(name.length+1)) : '';
}
function cookie(name,value,maxAge,secure=process.env.NODE_ENV==='production'){
  return `${name}=${encodeURIComponent(value)}; HttpOnly; Path=/; Max-Age=${Math.floor(maxAge/1000)}; SameSite=Lax${secure?'; Secure':''}`;
}

function signAdminToken(exp){return signToken(ADMIN_KEY,exp);}
function verifyAdminToken(token){
  const body=verifyToken(ADMIN_KEY,token);
  return body&&Number(body)>=Date.now()?body:null;
}
const adminRequired=(req,res,next)=>{
  if(!db) return res.status(503).json({error:'Database is not configured.'});
  const headerKey=req.headers['x-admin-key'];
  const cookieToken=getCookie(req,ADMIN_COOKIE);
  if((ADMIN_KEY && headerKey===ADMIN_KEY) || verifyAdminToken(cookieToken)) return next();
  return res.status(401).json({error:'Unauthorized'});
};

function userSecret(){
  return ADMIN_KEY ? ADMIN_KEY : 'thoughtout-user-secret';
}
function signUserToken(role,id,exp){
  return signToken(userSecret(),JSON.stringify({role,id,exp}));
}
function getUser(req){
  const body=verifyToken(userSecret(),getCookie(req,USER_COOKIE));
  if(!body) return null;
  try{
    const x=JSON.parse(body);
    if(!x.role||!x.id||Number(x.exp)<Date.now()) return null;
    return x;
  }catch{return null;}
}
const userRequired=(req,res,next)=>{
  const user=getUser(req);
  if(!user) return res.status(401).json({error:'Login required'});
  req.user=user; next();
};

app.get('/api/health',(req,res)=>res.json({
  status:'ok',
  database_configured:db,
  razorpay_configured:razorpay.isConfigured,
  admin_configured:Boolean(ADMIN_KEY),
  time:new Date().toISOString()
}));

app.post('/api/admin/verify',(req,res)=>{
  if(!ADMIN_KEY) return res.status(503).json({valid:false,error:'ADMIN_KEY is not configured.'});
  if(req.body.key!==ADMIN_KEY) return res.status(401).json({valid:false,error:'Invalid admin key'});
  const expires=Date.now()+ADMIN_MAX_AGE;
  res.setHeader('Set-Cookie',cookie(ADMIN_COOKIE,signAdminToken(expires),ADMIN_MAX_AGE));
  res.json({valid:true,expires_at:new Date(expires).toISOString()});
});
app.post('/api/admin/logout',(req,res)=>{
  res.setHeader('Set-Cookie',cookie(ADMIN_COOKIE,'',0));
  res.json({ok:true});
});

app.post('/api/auth/login',dbRequired,async(req,res)=>{
  const role=String(req.body.role||'').toLowerCase();
  const email=String(req.body.email||'').trim().toLowerCase();
  const phone=String(req.body.phone||'').trim();
  const recordId=String(req.body.record_id||'').trim();
  if(!['performer','audience'].includes(role)||!email||!phone||!recordId)
    return res.status(400).json({error:'Role, email, phone and ID are required.'});

  let data=null,error=null;
  if(role==='performer'){
    const q=await supabase.from('performer_registrations').select('*').eq('id',recordId).eq('email',email).eq('contact_no',phone).maybeSingle();
    data=q.data; error=q.error;
  }else{
    const q=await supabase.from('audience_tickets').select('*').eq('id',recordId).eq('buyer_email',email).eq('buyer_phone',phone).maybeSingle();
    data=q.data; error=q.error;
  }
  if(error) return res.status(500).json({error:error.message});
  if(!data) return res.status(401).json({error:'Details do not match our registration records.'});

  const exp=Date.now()+USER_MAX_AGE;
  res.setHeader('Set-Cookie',cookie(USER_COOKIE,signUserToken(role,data.id,exp),USER_MAX_AGE));
  res.json({ok:true,role,expires_at:new Date(exp).toISOString()});
});

app.post('/api/auth/logout',(req,res)=>{
  res.setHeader('Set-Cookie',cookie(USER_COOKIE,'',0));
  res.json({ok:true});
});

app.get('/api/auth/me',dbRequired,async(req,res)=>{
  const user=getUser(req);
  if(!user) return res.status(401).json({authenticated:false});
  let q;
  if(user.role==='performer') q=await supabase.from('performer_registrations').select('*').eq('id',user.id).maybeSingle();
  else q=await supabase.from('audience_tickets').select('*').eq('id',user.id).maybeSingle();
  if(q.error) return res.status(500).json({error:q.error.message});
  if(!q.data) return res.status(401).json({authenticated:false});
  res.json({authenticated:true,role:user.role,record:q.data});
});

app.get('/api/events',dbRequired,async(req,res)=>{
  const {data,error}=await supabase.from('event_availability').select('*').order('event_date',{ascending:true});
  if(error) return res.status(500).json({error:error.message});
  res.json((data||[]).map(e=>({...e,computed_status:e.status==='closed'?'closed':e.seats_left<=0?'sold_out':e.seats_left/e.total_slots<=.15?'almost_full':'open'})));
});

app.get('/api/gallery',dbRequired,async(req,res)=>{
  const {data,error}=await supabase.from('gallery').select('*').order('sort_order',{ascending:true});
  if(error) return res.status(500).json({error:error.message});
  res.json(data||[]);
});

app.post('/api/tickets',dbRequired,async(req,res)=>{
  const {event_slug,tier,buyer_name,buyer_email,buyer_phone}=req.body;
  if(!event_slug||!tier||!buyer_name||!buyer_email||!buyer_phone) return res.status(400).json({error:'event_slug, tier, buyer_name, buyer_email and buyer_phone are required.'});
  const amount_inr=TICKET_PRICES[tier];
  if(amount_inr===undefined) return res.status(400).json({error:'Invalid ticket tier.'});
  const {data:ticket,error}=await supabase.from('audience_tickets').insert({event_slug,tier,amount_inr,buyer_name,buyer_email,buyer_phone,payment_status:'pending'}).select().single();
  if(error) return res.status(400).json({error:error.message});
  let order=null;
  if(razorpay.isConfigured) {
    try {
      order=await razorpay.createOrder({amountInr:amount_inr,receipt:'ticket_'+ticket.id,notes:{ticket_id:ticket.id,event_slug,tier}});
      await supabase.from('audience_tickets').update({razorpay_order_id:order.id}).eq('id',ticket.id);
    } catch(e) { console.error(e); }
  }
  res.status(201).json({ticket_id:ticket.id,amount_inr,payment_required:razorpay.isConfigured,razorpay_order:order,razorpay_key_id:razorpay.isConfigured?razorpay.KEY_ID:null});
});

app.post('/api/registrations',dbRequired,async(req,res)=>{
  const {event_slug,name,contact_no,instagram_id,email,category}=req.body;
  if(!event_slug||!name||!contact_no||!instagram_id||!email||!category) return res.status(400).json({error:'event_slug, name, contact_no, instagram_id, email and category are required.'});
  const {data,error}=await supabase.from('performer_registrations').insert({event_slug,name,contact_no,instagram_id,email,category,payment_status:'paid',review_status:'pending'}).select().single();
  if(error) return res.status(400).json({error:error.message});
  res.status(201).json(data);
});

app.get('/api/admin/events',adminRequired,async(req,res)=>{
  const {data,error}=await supabase.from('events').select('*').order('event_date',{ascending:true});
  if(error) return res.status(500).json({error:error.message}); res.json(data||[]);
});
app.get('/api/admin/tickets',adminRequired,async(req,res)=>{
  const {data,error}=await supabase.from('audience_tickets').select('*').order('created_at',{ascending:false});
  if(error) return res.status(500).json({error:error.message}); res.json(data||[]);
});
app.get('/api/admin/registrations',adminRequired,async(req,res)=>{
  const {data,error}=await supabase.from('performer_registrations').select('*').order('created_at',{ascending:false});
  if(error) return res.status(500).json({error:error.message}); res.json(data||[]);
});
app.get('/api/admin/packages',adminRequired,async(req,res)=>{
  const {data,error}=await supabase.from('creator_packages').select('*').order('created_at',{ascending:false});
  if(error) return res.status(500).json({error:error.message}); res.json(data||[]);
});
app.get('/api/admin/gallery',adminRequired,async(req,res)=>{
  const {data,error}=await supabase.from('gallery').select('*').order('sort_order',{ascending:true});
  if(error) return res.status(500).json({error:error.message}); res.json(data||[]);
});

app.get('/admin',(req,res)=>res.sendFile(path.join(__dirname,'public','admin.html')));
app.get('/login',(req,res)=>res.sendFile(path.join(__dirname,'public','login.html')));
app.get('/account',(req,res)=>res.sendFile(path.join(__dirname,'public','account.html')));

app.get('/{*splat}',(req,res)=>{
  if(req.path.startsWith('/api/')) return res.status(404).json({error:'Not found'});
  res.sendFile(path.join(__dirname,'public','index.html'));
});

module.exports=app;