import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose'

export default function (router, mongoose1) {

	let Schema = mongoose.Schema;
	const User = mongoose.model('User', new Schema({
		firstName: String,
		lastName: String,
		email: {type: String, unique: true},
		password: String
	}));

	const saltRounds = 10;

	router.get('/profile', (req, res, next) => {
	   User.findOne({
		  where: {email: req.body.user.email},
		  attributes: ['email']
	   }).then((user)=> {
		  if (!user) {
			  res.render('home', json({
				 success: false,
				 message: "Problem finding user",
				 user: null
			  }));
		  } else {          
			  res.render('profile', json({
				 success: true,
				 message: "User found",
				 user: user
			  }));
		  }
	   })   
	})

	router.put('/profile', (req, res, next) => {
	   User.findOne({
		  where: {email: req.body.user.email},
		  attributes: ['email', 'firstName', 'lastName']
	   }).then((user)=> {

		  if (!user) {
			  res.render('home',json({
				 success: false,
				 message: "Problem finding user",
				 user: null
			  }));
		  } else {  
			//UPDATE USER        
			  User.update({
				firstName: req.body.user.firstName,
				lastName: req.body.user.lastName,
			  }, {
				where: {
				  email: req.body.user.email
				}
			  }).then((user)=> {
				  res.render('profile',json({
					 success: true,
					 message: "User UPDATED",
					 user: user
				  })); 
			  });
			  
		  }
	   })
	})

	router.get('/authentication/login', (req, res) => {
		res.render('login', {title: "Login Page"});
	});

	router.post('/authentication/login', (req, res) => {

		const param_email = req.body.email;
		const param_password = req.body.password;
		let errorMessage = "";		

		User.findOne({email: param_email}, (err, user) => {
			let errorMessage = "";
			let IP = req.headers['x-forwarded-for']; 
			console.log(IP);
			if (err) {
				errorMessage = err.Message;
				res.render('login', {error: errorMessage});
			}
			if (!user) {
				errorMessage = "Invalid email";
				res.render('login', {error: errorMessage});
			} else {
				bcrypt.compare(param_password, user.password, function(err, compared) {
				  // res == false
					console.log(param_password, user.password, compared)
				  if (compared === false || compared === undefined) {
					  res.render('login',{success: false,error:"Password incorrect"})
				  } else {
			   jwt.sign(user.toJSON(), 'superSecret', { expiresIn: '25d' }, function(err, token) {    
					  if (err) {
							  res.render('login',{
								success: false,
								error: "Problem issuing token",
								token: null,
							  });
						  } else {
							res.cookie('Token', token, {maxAge: 3600000, httpOnly: true});
							res.redirect("/authentication/home")
						  }                             
					  }); 
				  }
			  }); 
			}
	

		}); 
	});

	router.get('/authentication/register', (req, res)=> {
		res.render('register', {title:"register page"})
	});

	router.post('/authentication/register', (req, res, next) => {
	  const password = req.body.password
	  const passwordConfirm = req.body.passwordConfirm
	  const email = req.body.email
	  const firstName = req.body.firstName
	  const lastName = req.body.lastName

	  if (password !== passwordConfirm) {
		res.render('register', {
		  success:false,
		  message: "Passwords don't match",      
		})
	  } else {


		bcrypt.hash(password, saltRounds, function(err, hash) {
		   
		  if (err) {
			return res.render('register',{
					success: false,
					message: "Something went wrong",
					token: null,
				  })
		  } else {
			  User.findOne({
					email: email,
					password: hash,    
					firstName: firstName,
					lastName: lastName  
			  }, (user) => {
				if (!user) {
				  var newUser = new User({
					email: email,
					password: hash,
					firstName: firstName,
					lastName: lastName
				  })
				
				  newUser.save((err)=> {
					let errorMessage = "";
					if (err) {
						errorMessage = "there was an error try again";
						if (err.code === 11000) {
							errorMessage = "This email already exists, try logging in";
							res.render('register', {error: errorMessage});
						}
					} else {
						jwt.sign(newUser.toJSON(), 'superSecret', 
							{ expiresIn: '25d' }, function(err, token) {
							
							res.cookie('Token', token, {maxAge: 3600000, httpOnly: true});
							res.render('home',{
								success: true,
								message: "Enjoy your token",
								token: token
							});
						})
					}
				  });
				} else {
					res.render('register',{
						  success: false,
						  message: "User already exists",
						  token: null,
					})
				}
		     });	       												}                            
	   	 });  
		}
	});

	router.get('/authentication/logout', (req, res, next) => {
	   res.clearCookie("Token");
//	   req.session.destroy((err)=>{
		   res.redirect('/authentication/login');
//	   });
	})

	router.delete('/authentication/delete', (req, res, next)=> {
		//clear cookies and or local storage  
		db.User.destroy({
		  where: {email: req.body.user.email}
		}).then((success)=>{
		  if (success) {
			res.json({
			  success: true,
			  message: "successfully deleted"
			})
		  } else {
			res.json({
			  success: false,
			  message: "something went wrong"
			})
		  }
		})    
	})

	router.post('/authentication/recoverPassword', (req, res, next) => {
	  //send email and if email success alert user then show a form
	  const randomstring = Math.random().toString(36).slice(-8);

	  const requestingEmail = req.body.user.email;

	  console.log(process.env.EMAIL, process.env.EMAIL_PWD)

	  db.PasswordRecovery.destroy({ where: { email: requestingEmail }}).then(()=>{
				db.PasswordRecovery.create({
				  email: requestingEmail,
				  tempPassword: randomstring,
				}).then((pr)=>{
					if (pr) {
						const transporter = nodemailer.createTransport({
							service: 'Gmail',
							auth: {
								user: process.env.EMAIL,
								pass: process.env.EMAIL_PWD,
							}
						})

						const mailOptions = {
						  from: process.env.EMAIL, // sender address
						  to: requestingEmail, // list of receivers
						  subject: 'SUMATRA: Password Recovery', // Subject line
						  text: "This is your temporary password: " + randomstring //, // plaintext body
						  // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
						};

						transporter.sendMail(mailOptions, function(error, info){
							if(error){          
								res.json({
								  success: false,
								  reponse: error,
								})
							} else {          
								res.json({
								  success: true,
								  reponse: info.response,
								})
								
							};
						});

					} else {
					  res.json({
						  success: false,
						  reponse: "something went wrong",
					  })

					}
				})

	  })
	  
	})
	  
	router.put('/authentication/recoverconfirm', (req, res, next) => {
	  
	  let paramTemp = req.body.user.tempPassword
	  let paramPwd = req.body.user.password
	  let paramPwdConfirm = req.body.user.passwordConfirmation
	  let email = req.body.user.email

	  db.PasswordRecovery.findOne({
		where: {email:email}
	  }).then((pr)=>{
		  if (!pr) {
			  res.json({
				success: false,
				message: "Something went wrong try again later",
			  })
		  } else {        
				let temp = pr.tempPassword
				if (paramTemp === temp) {
				  if (paramPwd === paramPwdConfirm) {
				   
					  //UPDATE USER 
					  bcrypt.hash(paramPwd, saltRounds, function(err, hash) {

								if (err) {
							  res.json({
							success: false,
								message: "Something went wrong try again later",
								  })
								} else {
										  db.User.update({
											password: hash,
										  }, {
											where: {
											  email: req.body.user.email
											}
										  }).then((user)=> {
											  db.PasswordRecovery.destroy({ where: { email: email }});
											  res.json({
												 success: true,
												 message: "recovered successfully",
												 user: user
											  }) 
										  });
								}            
					  });                 

				  } else {
					res.json({
					  success: false,
					  message: "new passwords don't match"
					})
				  }
				} else {
				  res.json({
					success: false,
					message: "temp password incorrect"
				  })
				}        
			}
		  
	  })
	 
	})

};
