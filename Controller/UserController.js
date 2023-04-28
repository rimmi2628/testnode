const model=require('../models')
require('dotenv').config();
const jwt=require('jsonwebtoken');
var nodemailer=require('nodemailer');
const bcrypt=require('bcryptjs');
const moment=require("moment");
const User=model.User;
const Userotp=model.UserOtp;


var transpoter=nodemailer.createTransport({
    service:'gmail',
  
      auth:{
          user:process.env.User_email,
          pass:process.env.User_password
      },
      tls: {
        rejectUnauthorized: false
      }
  
  });


  var otp = Math.random();
  otp = otp * 10000;
  otp = parseInt(otp);
  console.log(otp);




exports.postregister=async (req,res,next)=>{
   try {


    const first_name=req.body.first_name;
    const last_name=req.body.last_name;
    const email=req.body.email;
    const password=req.body.password;
    const verify=req.body.verify;

   if(!email && !password ){
    res.status(500).json({message:"enter the required fields"});
   }
   const data = await User.findOne({ where: { email: email } });
   if (data) {
       res.status(500).json({ message: "email already exsit" });
       return;
   }
    const hashpass=await bcrypt.hash(password,12);

    const user= await User.create({
        first_name:first_name,
        last_name:last_name,
        email:email,
        password:hashpass,
        verify:verify
    });
    const payload={
        id:user.id,
        email:user.email
    }
    
    const token=jwt.sign(payload,process.env.secretkey,{expiresIn:'10m'});
    const expiryTime = moment().add(5, 'm').format("YYYY-MM-DD hh:mm:ss");
    const url = `http://localhost:3000/postreset/${token}`
    var mailOptions={
        from:' s12348946@gmail.com',
        to:email,
        subject:'reset link',
        html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>"+ url
       
    }
    transpoter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
     } );
     
     const otpg = await Userotp.create({
        email: user.email,
        otp: otp,
        expire_at: expiryTime
    })

    res.status(201).json({success:'ok',message:'sent link into email',data:user,token:token});
   } catch (error) {
    console.log(error);
   }
};
exports.userlogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({where: {email:email}});
        console.log(user)
        if(!user){
            res.status(400).json({message:"Invalid email Credential"});
            return;
        }

        const payload = {
            email: user.email,
            id: user.id
        }

        const token = jwt.sign(payload, process.env.secretkey, { expiresIn: '15m' });
        console.log(token)
        const url = `http://localhost:3000/postreset/${token}`
        if (user.verify == '0') {

            var mailOptions = {
                from: ' s12348946@gmail.com',
                to: email,
                subject: 'reset link',
                html: "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + otp +"</h1>"+url
            }
             
            transpoter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                }
    
            })
            console.log(user);
        

            return res.status(200).json({ status: "ok", msg: "sent email to verify your account" });

        }


        const isMatch = await bcrypt.compare(password,user.password);
        console.log(isMatch);
            if(!isMatch){
                res.status(400).json({message:'Invalid Credential'});
                return;
            }
            res.status(200).json({success:"ok",msg:"login Successful",data:user,token:token});

    } catch (error) {
        console.log(error);
        res.send(400).json({error});

    }
}

exports.postreset = async (req, res) => {
    const {  otp,token } = req.body;
    try {
        const userdata = jwt.verify(token, process.env.secretkey);
        const email = userdata.email;
        const otpdata = await Userotp.findOne({
      
            where: { email, otp },
        
        });

        const now = moment().format("YYYY-MM-DD hh:mm:ss");
        const expiretime = otpdata.expire_at;
        const isAfter = moment(now).isAfter(expiretime);

        if (!otpdata) {
            return res.json({ msg: "Your otp is not correct" });
        }
        else if ( isAfter) {
            return res.json({ msg: "Your otp is expired" });
        }


        const user = await User.findOne({
            where: { email }
        });

        if (user) {
          
            await User.update(
                {
                    verify: "1",
                },
                {
                    where: { email: email },
                }
            );
        }
        return res.json({ msg: "You are successfully verify" });
    }
    catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
}



exports.getreset = async (req, res, next) => {

  
    try {

    
        const token = req.params.token;
        const verifyuser = jwt.verify(token, process.env.secretkey);
        const { id } = verifyuser;
        const user = await User.findOne({ whrer: { id: id } });
        console.log(user);
        if (!user) {
            res.status(500).json({ message: "invalid user" });
            return;
        }

        res.render('verify',{ token });


    } catch (error) {
        console.log(error);
        res.status(400).json({ message: error });
    }



}



