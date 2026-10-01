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
const ADMIN_MAX_AGE=8*60*60*1000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')));

const dbRequired=(req,res,next)=>{
  if(!db) return res.status(503).json({error:'Database is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'});
  next();
};

function signAdminToken(exp){
  const payload=String(exp);
  const sig=crypto.createHmac('sha256',ADMIN_KEY).update(payload).digest('hex');
  return `${payload}.${sig}`;
}
function verifyAdminToken(token){
  if(!ADMIN_KEY||!token) return false;
  const [exp,sig]=String(token).split('.');
  if(!exp||!sig||Number(exp)<Date.now()) return false;
  const expected=crypto.createHmac('sha256',ADMIN_KEY).update(exp).digest('hex');
  return sig.length===expected.length && crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected));
}
function getCookie(req,name){
  const header=req.headers.cookie||'';
  const item=header.split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='));
  return item ? decodeURIComponent(item.slice(name.length+1)) : '';
}
const adminRequired=(req,res,next)=>{
  if(!db) return res.status(503).json({error:'Database is not configured.'});
  const headerKey=req.headers['x-admin-key'];
  const cookieToken=getCookie(req,ADMIN_COOKIE);
  if((ADMIN_KEY && headerKey===ADMIN_KEY) || verifyAdminToken(cookieToken)) return next();
  return res.status(401).json({error:'Unauthorized'});
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
  if(req.body.key!==ADMIN_KEY) return res.status(401).json({valid:false});
  const expires=Date.now()+ADMIN_MAX_AGE;
  res.setHeader('Set-Cookie',`${ADMIN_COOKIE}=${encodeURIComponent(signAdminToken(expires))}; HttpOnly; Path=/; Max-Age=${ADMIN_MAX_AGE/1000}; SameSite=Lax${process.env.NODE_ENV==='production'?'; Secure':''}`);
  res.json({valid:true,expires_at:new Date(expires).toISOString()});
});
app.post('/api/admin/logout',(req,res)=>{
  res.setHeader('Set-Cookie',`${ADMIN_COOKIE}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${process.env.NODE_ENV==='production'?'; Secure':''}`);
  res.json({ok:true});
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

app.get('/{*splat}',(req,res)=>{
  if(req.path.startsWith('/api/')) return res.status(404).json({error:'Not found'});
  res.sendFile(path.join(__dirname,'public','index.html'));
});

module.exports=app;