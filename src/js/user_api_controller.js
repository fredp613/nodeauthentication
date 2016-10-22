import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import { UserModel } from './models';
import { PasswordRecoveryModel } from './models';
import { sendEmail } from './email';
import authenticated from './authenticate';

export default function (router, mongoose,customOpenPaths,rootPath) {
      
    router.use(authenticated(mongoose, customOpenPaths));
	rootPath = rootPath+"/api";
	let User = UserModel(mongoose);
	let PasswordRecovery = PasswordRecoveryModel(mongoose);
	let loginRoute = rootPath ? (rootPath + "/login") : "/login";
	let logoutRoute = rootPath ? (rootPath + "/logout") : "/logout";
	let registerRoute = rootPath ? (rootPath + "/register") : "/register";
	let recoverRoute = rootPath ? (rootPath + "/recover") : "/recover";
	let recoverConfirmRoute = rootPath ? (rootPath + "/recoverconfirm") : "/recoverconfirm";

	const saltRounds = 10;

	router.post(loginRoute, (req, res) => {

		const param_email = req.body.email.trim().toLowerCase();
		const param_password = req.body.password;
		let errorMessage = "";		

		User.findOne({email: param_email}, (err, user) => {
			let errorMessage = "";
			let IP = req.headers['x-forwarded-for']; 
			if (err) {
				errorMessage = err.Message;
				res.json({error: errorMessage});
			}
			if (!user) {
				errorMessage = "Invalid email";
				res.json({error: errorMessage});
			} else {
				bcrypt.compare(param_password, user.password, function(err, compared) {
				  // res == false
					console.log(param_password, user.password, compared)
				if (compared === false || compared === undefined) {
					  res.json({success: false,error:"Password incorrect"})
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
						  res.json({
							success: false,
							error: "Problem issuing token"
						  });
						} else {
							generateJWT(user,(token, error) => {
								if (error !== null ) {
								  res.json({
									success: false,
									error: "Problem issuing token",
									token: null,
								  });
								} else {
									console.log("we should be good");
									res.json({success: true, error:null,token: token});
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

	router.post(registerRoute, (req, res, next) => {
	  const password = req.body.password
	  const passwordConfirm = req.body.passwordConfirm
	  const email = req.body.email.trim().toLowerCase();
	  const firstName = req.body.firstName
	  const lastName = req.body.lastName
	  const IP = req.headers['x-forwarded-for']; 
	  
	  if (password !== passwordConfirm) {
		res.json({
		  success:false,
		  message: "Passwords don't match",      
		})
	  } else {
		bcrypt.hash(password, saltRounds, function(err, hash) {		   
		  if (err) {
			return res.json({
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
							res.json({error: errorMessage});
						}
					} else {						
						generateJWT(newUser,(token, error) => {
								if (error !== null ) {
								  res.json({
									success: false,
									error: "Problem issuing token",
									token: null,
								  });
								} else {
								  res.json({
									success: true,
									error: null,
									token: token
								  });	
								}
							})
					}
				 });
				} else {
							  res.json({
								success: false,
								error: "Problem issuing token",
								token: null
							  });
				}
		     });
			}	       												                            
	   	 });  
		}
	});

	router.get(logoutRoute, (req, res, next) => {
	     //   res.clearCookie("Token");
		 //  res.redirect('/authentication/login');
	})


	router.post(recoverRoute, (req, res, next) => {

	  const randomstring = Math.random().toString(36).slice(-8);
	  const requestingEmail = req.body.email.trim().toLowerCase();
	  let urlForRecovery = 
		"http://fredp613.com/authentication/recoverconfirm?email=" + 
	    	requestingEmail + 
	    	"&safestring=" + 
	    	randomstring;
	  let encodedURI = encodeURIComponent(urlForRecovery);	

		User.findOne({email: requestingEmail}, (err, user) => {
			let errorMessage = "";
			if (err) {
				errorMessage = err.Message;
				res.json({error: errorMessage});
			}
			if (!user) {
			    errorMessage = "this email does not exist, please try again";
				res.json({error: errorMessage});
			}
			if (user) {
				PasswordRecovery.remove({email: requestingEmail}, (err)=>{
					if (err) {
						res.json(
						 {error: "Something went wrong"});
					}
					let newPasswordRecovery = new PasswordRecovery({
							email: requestingEmail,
							tempPassword: randomstring
					});
					newPasswordRecovery.save((err)=>{
						if (err) {
							res.json( 
							{error: "something went wrong try again later"}); 
						} else {
							sendEmail("fredp613@gmail.com",
								"Password recovery",
								"click on the following link to reset your password:" 
								+ urlForRecovery); 
							res.json( 
								{status: "success"});	
						}	
					});	
				});
			};
		}); 
	})

	  
	router.post(recoverConfirmRoute, (req, res, next) => {
	  
	  let paramPwd = req.body.password;
	  let paramPwdConfirm = req.body.passwordConfirm;
	  let paramEmail = req.body.email
	  
	  if (paramPwd !== paramPwdConfirm) {
		 return res.json({title: "Confirm temporary password", 
			error:"passwords don't match, try again"});
	  }
	  PasswordRecovery.findOne({email: paramEmail}, (err, pr) => {
			if (err) {
				return res.json({title: "Confirm temporary password", 
				error: err.Message});
		    }
			if (!pr) {
				return res.json({title: "Confirm temporary password", error:
				"somethign went wrong - not found"});
			}
			if (pr) {
				bcrypt.hash(paramPwd, saltRounds, function(err, hash) {	
					User.findOne({email: paramEmail}, (err, user)=>{
						if (err) {
							return res.json({error: "something went wrong"});
						}
						if (!user) {
						  return res.json({error: "user not found"});
						}
						User.update(user, {password: hash}, null, (err)=>{
							if (err) {
								return res.json({
									error: err.Message,
								})
							}
							res.json({success:true});
						});
					})
				});		
			}
	  });

	})
};
