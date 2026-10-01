const {EventEmitter}=require('events');
const bus=new EventEmitter();
bus.setMaxListeners(100);
const agents={
 auth:{name:'Auth Agent',domain:'Google OAuth + sessions'},
 users:{name:'Users Agent',domain:'Profiles + account linking'},
 tickets:{name:'Tickets Agent',domain:'Audience bookings'},
 performers:{name:'Performers Agent',domain:'Performer registrations'},
 packages:{name:'Packages Agent',domain:'Creator packages'},
 events:{name:'Events Agent',domain:'Event availability'},
 gallery:{name:'Gallery Agent',domain:'Media gallery'},
 payments:{name:'Payments Agent',domain:'Razorpay + payment status'},
 admin:{name:'Admin Agent',domain:'Dashboard + access control'}
};
const activity=[];
function signal(from,event,data={}){
 const item={id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),from,event,at:new Date().toISOString(),data};
 activity.unshift(item); if(activity.length>100) activity.length=100; bus.emit('signal',item); return item;
}
function listAgents(){return Object.entries(agents).map(([id,a])=>({id,...a,status:'connected'}));}
function recentActivity(limit=25){return activity.slice(0,Math.max(1,Math.min(100,Number(limit)||25)));}
module.exports={bus,signal,listAgents,recentActivity};
