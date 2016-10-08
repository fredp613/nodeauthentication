
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import Foo from './testclass';
import { UserModel, PasswordRecoveryModel } from './models';
import { sendEmail } from './email';

//import { schema } from './models';
export default function (router, mongoose) {

	let User = UserModel(mongoose);
	let PasswordRecovery = PasswordRecoveryModel(mongoose);
//	let User = schema(mongoose, "User");
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
		res.render('login', {title: "Login Page", csrfToken: req.csrfToken()});
	});

	router.post('/authentication/login', (req, res) => {

		const param_email = req.body.email.trim().toLowerCase();
		const param_password = req.body.password;
		let errorMessage = "";		

		User.findOne({email: param_email}, (err, user) => {
			let errorMessage = "";
			let IP = req.headers['x-forwarded-for']; 
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
					  res.render('login',{success: false,error:"Password incorrect", csrfToken: req.csrfToken()})
				} else {
					if (user.IPs) { 
						console.log(user.IPs.indexOf(IP));
						if (user.IPs.indexOf(IP) === -1){
							user.IPs = user.IPs + "," + IP;
						}
					} else {
						user.IPs = IP;
					}
					console.log("made it here");
					user.save((err)=>{
						if (err) { 
						  console.log("error ${0}", err);
						  res.render('login',{
							success: false,
							error: "Problem issuing token",
							csrfToken: req.csrfToken(),
						  });
						} else {
							generateJWT(user,(token, error) => {
								if (error !== null ) {
								  res.render('login',{
									success: false,
									error: "Problem issuing token",
									token: null,
								  });
								} else {
									console.log("we should be good");
									res.cookie('Token', token,
									 {maxAge: 3600000, httpOnly: true});
									res.redirect("/authentication/home")
								}
							})
						}						

					});
								
 
			   	}

		  });
		} 
	});
});
	function generateJWT(user, callback) {
		jwt.sign(user.toJSON(), 'superSecret', 
		{ expiresIn: '25d' }, function(err, token) {    
		  if (err) {
			callback(null, err);
		  } else {
			callback(token, null);
		  }                             
		}); 
	}
	router.get('/authentication/register', (req, res)=> {
		res.render('register', {title:"register page", csrfToken: req.csrfToken()})
	});

	router.post('/authentication/register', (req, res, next) => {
	  const password = req.body.password
	  const passwordConfirm = req.body.passwordConfirm
	  const email = req.body.email
	  const firstName = req.body.firstName
	  const lastName = req.body.lastName
	  const IP = req.headers['x-forwarded-for']; 
	  
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
				  let newUser = new User({
					email: email,
					password: hash,
					firstName: firstName,
					lastName: lastName,
					IPs: IP,
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
						generateJWT(newUser,(token, error) => {
								if (error !== null ) {
								  res.render('register',{
									success: false,
									error: "Problem issuing token",
									token: null,
								  });
								} else {
									console.log("we should be good");
									res.cookie('Token', token,
									 {maxAge: 3600000, httpOnly: true});
									sendEmail("fredp613@gmail.com", 
										"Registered", "Thank you for registering")							
									res.redirect('/authentication/home');
									//res.render('home',{
									//	success: true,
									//	message: "Enjoy your token",
									//	token: token
									//});
								}
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

	router.get('/authentication/recover', (req, res, next)=>{
		res.render('recover', {Title: "Recover Password", csrfToken: req.csrfToken()});
	});

	router.post('/authentication/recover', (req, res, next) => {
	  //send email and if email success alert user then show a form
	  const randomstring = Math.random().toString(36).slice(-8);

	  const requestingEmail = req.body.email.trim().toLowerCase();


		User.findOne({email: requestingEmail}, (err, user) => {
			let errorMessage = "";
			if (err) {
				errorMessage = err.Message;
				res.render('recover', {error: errorMessage, csrfToken: req.csrfToken()});
			}
			if (!user) {
			    errorMessage = "this email does not exist, please try again";
				res.render('recover', {error: errorMessage, csrfToken: req.csrfToken()});
			}
			if (user) {
				PasswordRecovery.remove({email: requestingEmail}, (err)=>{
					if (err) {
						res.render('recover', {error: "Something went wrong", 
						csrfToken: req.csrfToken()});
					}
					let newPasswordRecovery = new PasswordRecovery({
							email: requestingEmail,
							tempPassword: randomstring
					});
					newPasswordRecovery.save((err)=>{
						if (err) {
							res.render('recover', 
							{error: "something went wrong try again later",
								 csrfToken:req.csrfToken()});
						} else {
							sendEmail("fredp613@gmail.com",
								"Password recovery",
								"temporary password is:" + randomstring); 
							res.redirect('/authentication/recoverconfirm');	
						}
							
					});	

					
				});
									
			}
		});
	  
	})

	router.get('/authentication/recoverconfirm', (req, res, next) => {
		res.render('recoverconfirm', {Title: "Confirm temporary password"});

	});
	  
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
