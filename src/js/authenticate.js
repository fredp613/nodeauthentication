
import jwt from "jsonwebtoken";

export default function isAuthenticated(mongoose, customOpenPaths) { 

	return function(req, res, next) {
	
	  let userAuthOpenPaths = ["/authentication/login",
						"/authentication/recover", 
						"/authentication/register", 
						"/authentication/recoverconfirm"]
	 let openPaths = userAuthOpenPaths.concat(customOpenPaths);
		if (!req.cookies.Token && !(openPaths.includes(req.path))) {
			req.isAuthenticated = false;
			res.redirect('/authentication/login');
		} else {
			//get current user, validate token (ensure that it exists and is valid)
			if (req.cookies.Token !== undefined) {
				const token = req.cookies.Token;
				let decoded = jwt.verify(token, 'superSecret');
				let requestingIP = req.headers['x-forwarded-for']; 
				let decodedIPs = decoded.IPs;
				console.log(decodedIPs)
				console.log(requestingIP);
				if (decodedIPs.indexOf(requestingIP) !== -1) {
					req.isAuthenticated = true;
					next();
				} else {				
					console.log("is not auth");
					req.isAuthenticated = false;
					if (!openPaths.includes(req.path)){
						res.redirect('/authentication/login');
					} else {
						next();
					}
				}	

			} else {
				next();
			}						
      }
	}
}
