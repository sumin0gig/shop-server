// express server 만들기
const express= require("express");
const cors= require("cors");
const mysql= require('mysql');

// server 생성
const app= express();
// port 번호 지정
const port= 8088;
// 데이터 전송형식 지정 (JSON)
app.use(express.json());
// cors 이슈 방지
app.use(cors());

const conn = mysql.createConnection({
	host: "database-1.cvmqc6bfrssc.ap-northeast-1.rds.amazonaws.com",
	user: "admin",
	password: "sumin98061",
	port : "3306",
	database: "shop"
})
conn.connect();

// ------------- join -------------
app.post('/join', async (req,res)=>{
	const {name,id,pw,tel_1,tel_2,tel_3,birth,sms_check,mail_add1,mail_add2,mail_check}=req.body;
	conn.query(`INSERT INTO member (m_name,m_id,m_pw,m_tel_1,m_tel_2,m_tel_3,m_birth,m_sms_check,m_mail_add1,m_mail_add2,m_mail_check)
	VALUES ('${name}','${id}','${pw}','${tel_1}','${tel_2}','${tel_3}','${birth}','${sms_check}','${mail_add1}','${mail_add2}','${mail_check}')`,
	(error,result,fields)=>{
		console.log(req.body);
		console.log(error);
	})
})
app.get('/join/id',async(req,res)=>{
	conn.query(`SELECT m_id FROM member`,
	(error,result,fields)=>{
		res.send(result)
	})
})
app.get('/join/tel',async(req,res)=>{
	conn.query(`SELECT m_tel_1,m_tel_2,m_tel_3 FROM member`,
	(error,result,fields)=>{
		res.send(result)
	})
})
// ------------- login -------------
app.get('/login/:m_id',async(req,res)=>{
	const {m_id}=req.params
	conn.query(`SELECT m_id,m_pw FROM member WHERE m_id='${m_id}'`,
	(error,result,fields)=>{
		res.send(result)
	})
})

// ------------- admin -------------
// ------------- admin -------------
app.get('/admin/product',async(req,res)=>{
	conn.query(`SELECT * FROM product`,
	(error,result,fields)=>{
		res.send(result)
	})
})


app.listen(port,()=>{
	console.log('서버 작동중');
})