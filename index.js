// express server 만들기
const express= require("express");
const cors= require("cors");
const mysql= require('mysql');
const bcrypt = require('bcrypt');

// server 생성
const app= express();
// port 번호 지정
const port= 8088;
// 데이터 전송형식 지정 (JSON)
app.use(express.json());
// cors 이슈 방지
app.use(cors());
// 이미지 등록
const multer= require("multer");
app.use("/upload",express.static("upload")); 
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
			cb(null, 'upload/banner');
	},
	filename: (req,file,cb)=>{
			const newFilename = file.originalname;
			cb(null, newFilename);
	}
}) 
const upload= multer({storage:storage});


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
	const {name,id,pw,tel_1,tel_2,tel_3,addr,addrplus,sms_check,mail_add1,mail_add2,mail_check}=req.body;
	const password=bcrypt.hashSync(pw,12);
	conn.query(`INSERT INTO member (m_name,m_id,m_pw,m_tel_1,m_tel_2,m_tel_3,m_addr,m_addrplus,m_sms_check,m_mail_add1,m_mail_add2,m_mail_check)
	VALUES ('${name}','${id}','${password}','${tel_1}','${tel_2}','${tel_3}','${addr}','${addrplus}','${sms_check}','${mail_add1}','${mail_add2}','${mail_check}')`)
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
app.get('/login/:loginData',async(req,res)=>{
	const {m_id,m_pw}=JSON.parse(req.params.loginData)
	conn.query(`SELECT m_id,m_name,m_no,m_pw,m_authority FROM member WHERE m_id='${m_id}'`,
	(error,result,fields)=>{
		const match = bcrypt.compareSync(m_pw,result[0].m_pw);
		res.send([{
			m_id:result[0].m_id,
			m_name:result[0].m_name,
			m_no:result[0].m_no,
			m_pw:match,
			m_authority:result[0].m_authority
		}])
	})
})

app.get('/search/id/:formdata',async(req,res)=>{
	const data = JSON.parse(req.params.formdata)
	conn.query(`SELECT * FROM member WHERE m_name='${data.m_name}' AND m_tel_1='${data.m_tel_1}' AND m_tel_2='${data.m_tel_2}' AND m_tel_3='${data.m_tel_3}' `,
	(error,result,fields)=>{
		res.send(result)
	})
})
app.get('/search/pw/:formdata',async(req,res)=>{
	const data = JSON.parse(req.params.formdata)
	conn.query(`SELECT * FROM member WHERE m_id='${data.m_id}' AND m_tel_1='${data.m_tel_1}' AND m_tel_2='${data.m_tel_2}' AND m_tel_3='${data.m_tel_3}' `,
	(error,result,fields)=>{
		res.send(result)
	})
})
app.patch('/search/pw',async(req,res)=>{
	const {m_no,m_pw}=req.body;
	const password=bcrypt.hashSync(m_pw,12);
	conn.query(`UPDATE member SET m_pw='${password}' WHERE m_no='${m_no}' `)
})

// ------------- product -------------
app.get('/product/some/:cate',async(req,res)=>{
	const {cate}= req.params;
	conn.query(`SELECT * FROM product WHERE p_category = '${cate}'`,
	(error,result,fields)=>{
		res.send(result)
	}
	)
})
app.get('/product/Is/:state',async(req,res)=>{
	const {state}= req.params;
	conn.query(`SELECT * FROM product WHERE ${state} = 'Y'`,
	(error,result,fields)=>{
		res.send(result)
	})
})
app.get('/product/IsBest',async(req,res)=>{
	conn.query(`SELECT * FROM product WHERE p_isbest = 'Y' order by p_isbestNo asc limit 10`,
	(error,result,fields)=>{
		res.send(result)
	})
})

app.get('/product/view/:no',async(req,res)=>{
	const {no}=req.params;
	conn.query(`SELECT * FROM product WHERE p_no = ${no}`,
	(error,result,fields)=>{
		res.send(result)
	})
})
app.get('/product/view/amount/:no',async(req,res)=>{
	const {no}=req.params;
	conn.query(`SELECT * FROM product_amount WHERE p_no = ${no}`,
	(error,result,fields)=>{
		res.send(result)
	})
})

app.patch('/product/amount',async(req,res)=>{
	req.body.forEach(i => {
		conn.query(`
	UPDATE product_amount
	SET pa_amount= pa_amount-${i.c_amount}
	WHERE pa_no= ${i.pa_no}
	`)})
})

// ------------- cart -------------
app.get('/cart',async(req,res)=>{
	conn.query(`SELECT * FROM cart`,
	(error,result,fields)=>{
		res.send(result);
	})
})
app.post('/cart/add',async(req,res)=>{
	const {m_no,p_no,pa_no,cp_name,c_saleprice,c_price,c_amount,cp_img,cp_color,cp_size}=req.body;
	conn.query(`INSERT INTO cart (m_no,p_no,pa_no,cp_name,c_saleprice,c_price,c_amount,cp_img,cp_color,cp_size) VALUES(?,?,?,?,?,?,?,?,?,?)`
	,[m_no,p_no,pa_no,cp_name,c_saleprice,c_price,c_amount,cp_img,cp_color,cp_size])
})
app.delete('/cart/:select',async(req,res)=>{
	const data = await JSON.parse(req.params.select)
	for (let i = 0; i < data.length; i++) {
		conn.query(`DELETE FROM cart WHERE c_no=${data[i]||0}`)		
	}
})

// ------------- heart -------------
app.post('/heart/add',async(req,res)=>{
	const {m_no,p_no,p_mainImg,p_name,p_price,p_saleprice}=req.body;
	conn.query(`INSERT INTO heart (m_no,p_no,p_mainImg,p_name,p_price,p_saleprice) VALUES(?,?,?,?,?,?)`
	,[m_no,p_no,p_mainImg,p_name,p_price,p_saleprice])
})
app.get('/heart/:no',async(req,res)=>{
	const {no}=req.params;
	conn.query(`SELECT * FROM heart WHERE m_no=${no}`,
	(error,result,fields)=>{
		res.send(result);
	})
})
app.delete('/heart/:no',async(req,res)=>{
	const {no}= req.params;
	conn.query(`DELETE from heart WHERE h_no=${no} `)
})

// ------------- member -------------
app.get('/member/:no',async(req,res)=>{
	const {no}=req.params;
	conn.query(`SELECT * FROM member WHERE m_no=${no}`,
	(error,result,fields)=>{
		res.send(result[0]);
	})
})
app.patch('/member/:no',async(req,res)=>{
	const {no}=req.params;
	const {m_name,m_tel_1,m_tel_2,m_tel_3,m_sms_check,m_mail_add1,m_mail_add2,m_mail_check}=req.body;
	conn.query(`UPDATE member
	SET m_name='${m_name}',m_tel_1='${m_tel_1}',m_tel_2='${m_tel_2}',m_tel_3='${m_tel_3}',m_sms_check='${m_sms_check}',m_mail_add1='${m_mail_add1}',m_mail_add2='${m_mail_add2}',m_mail_check='${m_mail_check}'
	WHERE m_no=${no}
	`)
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
	const {p_name,p_price,p_saleprice,p_category,p_isbest,p_isnew,p_mainImg,p_mainMiniImg1,p_mainMiniImg2,p_mainMiniImg3,p_mainMiniImg4,p_annImg}=req.body
	conn.query(`INSERT INTO product (p_name,p_price,p_saleprice,p_category,p_isbest,p_isnew,p_mainImg,p_mainMiniImg1,p_mainMiniImg2,p_mainMiniImg3,p_mainMiniImg4,p_annImg) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
		[p_name,p_price,p_saleprice,p_category,p_isbest,p_isnew,p_mainImg,p_mainMiniImg1,p_mainMiniImg2,p_mainMiniImg3,p_mainMiniImg4,p_annImg])
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
	`)
})

app.patch('/admin/product/update/is',async(req,res)=>{
	const {p_no,p_isbest,p_isnew}=req.body
	conn.query(`
	UPDATE product
	SET p_isbest='${p_isbest}',p_isnew='${p_isnew}'
	WHERE p_no='${p_no}'
	`)
})
app.patch('/admin/product/update/best',async(req,res)=>{
	const {p_no,p_isbestNo}=req.body
	conn.query(`
	UPDATE product
	SET p_isbestNo='${p_isbestNo}'
	WHERE p_no='${p_no}'
	`)
})

app.delete('/admin/product/update/:id',async(req,res)=>{
	const {id}= req.params
	conn.query(`DELETE FROM product WHERE p_no='${id}'`)
})
app.delete('/admin/product/amount/:id',async(req,res)=>{
	const {id}= req.params
	conn.query(`DELETE FROM product_amount WHERE p_no='${id}'`)
})

app.get('/admin/product/some/:isSearch',async(req,res)=>{
	const { params } = req;
	const data = JSON.parse(params.isSearch)
	conn.query(`SELECT * FROM product
	WHERE
	p_name like '%${data.p_name}%' AND
	p_price >= '${data.p_pricemin}' AND p_price <= '${data.p_pricemax}' AND
	p_saleprice >= '${data.p_salepricemin}' AND p_price <= '${data.p_salepricemax}' AND
	p_category like '%${data.p_category}%' AND
	p_isbest like '%${data.p_isbest}'AND
	p_isnew like '%${data.p_isnew}'
	`,
	(error,result,fields)=>{
		res.send(result)
	})
})

app.get('/admin/product/view/amount',async(req,res)=>{
	conn.query(`SELECT * FROM product_amount`,
	(error,result,fields)=>{
		res.send(result)
	})
})
app.post('/admin/product/amount',async(req,res)=>{
	const {p_no,pa_color,pa_size,pa_amount}=req.body;
	conn.query(`
	INSERT INTO product_amount (p_no,pa_color,pa_size,pa_amount)
	VALUES (?,?,?,?)`,[p_no,pa_color||"ONE COLOR",pa_size||"ONE SIZE",pa_amount]
	)
})
app.patch('/admin/product/amount/:no',async(req,res)=>{
	const {no}=req.params
	const {plus_amount}=req.body
	conn.query(`
	UPDATE product_amount
	SET pa_amount= pa_amount+${Number(plus_amount)}
	WHERE pa_no='${no}'`)
})
app.delete('/admin/product/amount/:no',async(req,res)=>{
	const {no}=req.params
	conn.query(`
	DELETE FROM product_amount
	WHERE pa_no='${no}'`)
})
app.get('/admin/member',async(req,res)=>{
	conn.query(`SELECT m_no,m_name,m_id,m_tel_1,m_tel_2,m_tel_3,m_addr,m_addrplus,m_sms_check,m_mail_add1,m_mail_add2,m_mail_check,m_authority FROM member order by m_authority desc`
	,(error,result)=>{
		res.send(result);
	})
})
app.patch('/admin/member',async(req,res)=>{
	const {m_no,m_authority}=req.body;
	conn.query(`UPDATE member
	SET m_authority=${m_authority}
	WHERE m_no='${m_no}'`)
})

app.get('/admin/banner',async(req,res)=>{
	conn.query(`SELECT * FROM banner`
	,(error,result,fields)=>{
		res.send(result);
	})
})
app.post('/admin/banner',async(req,res)=>{
	const {b_img,b_name,b_link}=req.body;
	conn.query(`INSERT INTO banner (b_img,b_name,b_link) VALUES ('${b_img}','${b_name}','${b_link}')`)
})
app.patch('/admin/banner',async(req,res)=>{
	const {b_no,b_img,b_name,b_link}=req.body;
	conn.query(`UPDATE banner
	SET	b_img='${b_img}', b_name='${b_name}', b_link='${b_link}'
	WHERE b_no='${b_no}'`)
})
app.delete('/admin/banner/:no',async(req,res)=>{
	const {no}=req.params;
	conn.query(`DELETE FROM banner WHERE b_no=${no}`)
})
app.post("/upload",upload.single('file'),(req,res)=>{
	res.send({imageUrl: req.file.filename})
})

app.listen(port,()=>{
	console.log('서버 작동중');
})