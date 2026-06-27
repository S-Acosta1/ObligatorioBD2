import "./app.css";
import { useEffect,useMemo,useRef,useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Routes,Route,Navigate,useNavigate } from "react-router-dom";
import AuthLayout from "./auth/auth.jsx";
import Login from "./login/login.jsx";
import Register from "./register/register.jsx";
import Recover from "./recover/recover.jsx";
import Home from "./home/home.jsx";
import Dashboard from "./dashboard/dashboard.jsx";
import Purchase from "./purchase/purchase.jsx";
import Profile from "./profile/profile.jsx";
import HomeA from "./homeA/homeA.jsx";
import AdminEventos from "./adminEventos/adminEventos.jsx";
import AdminConfiguracion from "./adminConfiguracion/adminConfiguracion.jsx";
import AdminReportes from "./adminReportes/adminReportes.jsx";
import { login } from "./api.js";
const seedUsers=[
{email:"usuario@email.com",password:"123456",name:"Usuario General",role:"user"},
{email:"receptor@email.com",password:"123456",name:"Usuario Receptor",role:"user"},
{email:"funcionario@email.com",password:"123456",name:"Funcionario Mundial",role:"worker"},
{email:"admin@email.com",password:"123456",name:"Administrador Mundial",role:"admin"}
];
function ProtectedRoute({children,requiredRole}){
const token=localStorage.getItem("token");
const isExpired=()=>{
try{
const {exp}=jwtDecode(token);
return exp*1000<Date.now();
}catch{
return true;
}
};
if(!token||isExpired()){
return <Navigate to="/login" replace/>;
}
if(requiredRole){
try{
const user=JSON.parse(localStorage.getItem("user")||"{}");
const roleMap={admin:"admin",funcionario:"worker",usuario:"user"};
const role=roleMap[user.role]||"user";
if(role!==requiredRole){
return <Navigate to="/" replace/>;}
}catch{
return <Navigate to="/login" replace/>;
}}
return children;}
function RootRedirect(){
const token=localStorage.getItem("token");
if(token){
try{
const {exp}=jwtDecode(token);
if(exp*1000>Date.now()){
return <Navigate to="/home" replace/>;
}}
catch{}}
return <Navigate to="/login" replace/>;
}
export default function App(){
const navigate=useNavigate();
const [currentRole,setCurrentRole]=useState("user");
const [currentUser,setCurrentUser]=useState(null);
const [adminSection,setAdminSection]=useState("home");
const [selectedMatch,setSelectedMatch]=useState(null);
const [ownedTickets,setOwnedTickets]=useState([]);
const [registeredUsers,setRegisteredUsers]=useState([]);
const [loginError,setLoginError]=useState(null);
const [notification,setNotification]=useState(null);
const notificationTimerRef=useRef(null);
const isTokenExpired=(token)=>{
try{
const {exp}=jwtDecode(token);
return exp*1000<Date.now();
}catch{
return true;
}
};
const clearSession=()=>{
localStorage.removeItem("token");
localStorage.removeItem("user");
};
useEffect(()=>{
const token=localStorage.getItem("token");
const userJson=localStorage.getItem("user");
if(token&&userJson&&!isTokenExpired(token)){
const user=JSON.parse(userJson);
const roleMap={
admin:"admin",
funcionario:"worker",
usuario:"user"
};
setCurrentUser(user);
setCurrentRole(roleMap[user.role]||"user");
return;
}
clearSession();
},[]);
useEffect(()=>{
if(!currentUser)return;
const interval=setInterval(()=>{
const token=localStorage.getItem("token");
if(token&&isTokenExpired(token)){

clearSession();
setCurrentUser(null);
setCurrentRole("user");
navigate("/login");
}
},10000);
return()=>clearInterval(interval);
},[currentUser,navigate]);
const users=useMemo(()=>[
...seedUsers,
...registeredUsers
],[registeredUsers]);
const showNotification=(message,type="success")=>{
if(notificationTimerRef.current){
window.clearTimeout(notificationTimerRef.current);
}
setNotification({
message,
type
});
notificationTimerRef.current=window.setTimeout(()=>{
setNotification(null);
notificationTimerRef.current=null;
},3200);};
const handleBuyTicket=(match)=>{
setSelectedMatch(match);
navigate("/purchase");
};
const handleLoginSuccess=async({email,password})=>{
setLoginError(null);
try{
const data=await login(email,password);

const roleMap={
admin:"admin",
funcionario:"worker",
usuario:"user"
};

const nextRole=roleMap[data.role]||"user";

const user={
email:data.email,
nombre:data.nombre,
role:data.role
};

localStorage.setItem("token",data.token);
localStorage.setItem("user",JSON.stringify(user));

setCurrentUser(user);
setCurrentRole(nextRole);
navigate( nextRole==="admin" ? "/admin" : nextRole==="worker" ? "/worker" : "/home");
}catch(err){
setLoginError(err.message);}};
const handleLogout=()=>{
clearSession();
setCurrentUser(null);
setCurrentRole("user");
navigate("/login");
};
return (<>
{notification&&(
<div className={`app-notification app-notification--${notification.type}`}>
{notification.message}
</div>
)}
<Routes>
<Route path="/login" element={
<AuthLayout>
<Login
error={loginError}
onLoginSuccess={handleLoginSuccess}
onClearError={()=>setLoginError(null)}
onShowRegister={()=>navigate("/register")}
onShowRecover={()=>navigate("/recover")}
/>
</AuthLayout>
}/>
<Route path="/register" element={
<AuthLayout>
<Register
onRegisterUser={()=>{}}
onBackToLogin={()=>navigate("/login")}
onShowRecover={()=>navigate("/recover")}
/>
</AuthLayout>
}/>
<Route path="/recover" element={
<AuthLayout>
<Recover
onBackToLogin={()=>navigate("/login")}
onShowRegister={()=>navigate("/register")}
/>
</AuthLayout>
}/>

<Route path="/home" element={
<ProtectedRoute>

<Home
currentUser={currentUser}
purchasedTickets={[]}
heldTickets={[]}
pendingReceivedTransfers={[]}
transferHistory={[]}
onBuyTicket={handleBuyTicket}
onLogout={handleLogout}
/>
</ProtectedRoute>}/>
<Route path="/admin" element={
<ProtectedRoute requiredRole="admin">
{
adminSection==="home" &&
<HomeA
currentUser={currentUser}
stats={{
users:0,
matches:0,
tickets:0,
sales:0
}}
onUsers={()=>setAdminSection("config")}
onMatches={()=>setAdminSection("eventos")}
onTickets={()=>setAdminSection("eventos")}
onReports={()=>setAdminSection("reportes")}
onLogout={handleLogout}
/>}
{
adminSection==="eventos" &&
<AdminEventos
onBack={()=>setAdminSection("home")}/>}
{
adminSection==="config" &&
<AdminConfiguracion
onBack={()=>setAdminSection("home")}/>}
{
adminSection==="reportes" &&
<AdminReportes
onBack={()=>setAdminSection("home")}/>}
</ProtectedRoute>}/>
<Route path="/worker" element={
<ProtectedRoute requiredRole="worker">
<Dashboard
role="worker"
onLogout={handleLogout}
/>
</ProtectedRoute>
}/>
<Route path="/purchase" element={
<ProtectedRoute>
<Purchase
selectedMatch={selectedMatch}
onConfirmPurchase={()=>{}}
onNotify={showNotification}
onBackToHome={()=>navigate("/home")}
/>
</ProtectedRoute>
}/>
<Route path="/profile" element={
<ProtectedRoute>
<Profile
currentUser={currentUser}
onLogout={handleLogout}
/>
</ProtectedRoute>
}/>
<Route path="/" element={<RootRedirect/>}/>
<Route path="*" element={<Navigate to="/" replace/>}/>
</Routes>
</>
);}