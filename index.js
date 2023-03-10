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
// ------------- admin product -------------
app.get('/admin/product',async(req,res)=>{
	conn.query(`SELECT * FROM product`,
	(error,result,fields)=>{
		res.send(result)
	})
})
app.post('/admin/product/add',async(req,res)=>{
	const {p_name,p_price,p_saleprice,p_color,p_size,p_amount,p_category,p_isbest,p_isnew,p_mainImg,p_mainMiniImg1,p_mainMiniImg2,p_mainMiniImg3,p_mainMiniImg4,p_mainMiniImg5,p_annImg}=req.body
	conn.query(`INSERT INTO product (p_name,p_price,p_saleprice,p_color,p_size,p_amount,p_category,p_isbest,p_isnew,p_mainImg,p_mainMiniImg1,p_mainMiniImg2,p_mainMiniImg3,p_mainMiniImg4,p_mainMiniImg5,p_annImg) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		[p_name,p_price,p_saleprice,p_color,p_size,p_amount,p_category,p_isbest,p_isnew,p_mainImg,p_mainMiniImg1,p_mainMiniImg2,p_mainMiniImg3,p_mainMiniImg4,p_mainMiniImg5,p_annImg]
		,(error,result,fields)=>{
		}
	)
})
app.patch('/admin/product/update',async(req,res)=>{
	const {p_no,p_name,p_price,p_saleprice,p_color,p_size,p_amount,p_category,p_isbest,p_isnew,p_mainImg,p_mainMiniImg1,p_mainMiniImg2,p_mainMiniImg3,p_mainMiniImg4,p_mainMiniImg5,p_annImg}=req.body
	conn.query(`
	UPDATE product
	SET p_name='${p_name}',p_price='${p_price}',p_saleprice='${p_saleprice}',p_color='${p_color}',
	p_size='${p_size}',p_amount='${p_amount}',p_category='${p_category}'
	,p_isbest='${p_isbest}',p_isnew='${p_isnew}',p_mainImg='${p_mainImg}',p_price='${p_price}',
	p_mainMiniImg1='${p_mainMiniImg1}',p_mainMiniImg2='${p_mainMiniImg2}',p_mainMiniImg3='${p_mainMiniImg3}',
	p_mainMiniImg4='${p_mainMiniImg4}',p_mainMiniImg5='${p_mainMiniImg5}',p_annImg='${p_annImg}'
	WHERE p_no='${p_no}'
	`,(error,result,fields)=>{
	})
})

app.patch('/admin/product/update/is',async(req,res)=>{
	const {p_no,p_isbest,p_isnew}=req.body
	conn.query(`
	UPDATE product
	SET p_isbest='${p_isbest}',p_isnew='${p_isnew}'
	WHERE p_no='${p_no}'
	`,(error,result,fields)=>{
	})
})
app.delete('/admin/product/update/:id',async(req,res)=>{
	const {id}= req.params
	conn.query(`DELETE FROM product WHERE p_no='${id}'`,(error,result,fields)=>{
	})
})

app.get('/admin/product/some/:isSearch',async(req,res)=>{
	const { params } = req;
	const data = JSON.parse(params.isSearch)
	console.log(data);
	conn.query(`SELECT * FROM product
	WHERE
	p_name like '%${data.p_name}%' AND
	p_price >= '${data.p_pricemin}' AND p_price <= '${data.p_pricemax}' AND
	p_saleprice >= '${data.p_salepricemin}' AND p_price <= '${data.p_salepricemax}' AND
	p_amount >= '${data.p_amountmin}' AND p_amount <= '${data.p_amountmax}' AND
	p_category like '%${data.p_category}%' AND
	p_isbest like '%${data.p_isbest}'AND
	p_isnew like '%${data.p_isnew}'
	`,
	(error,result,fields)=>{
		res.send(result)
	})
})
app.listen(port,()=>{
	console.log('서버 작동중');
})