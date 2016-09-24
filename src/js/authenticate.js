export default function isAuthenticated(mongoose) { 

	return function(req, res, next) {

		if (!req.cookies.Token && !(req.path === "/authentication/login")) {
			req.isAuthenticated = false;
			res.redirect('/authentication/login');
		} else {
			//get current user, validate token (ensure that it exists and is valid) 
			
			const token = req.cookies.Token;
			
			req.email = "fredp614@cnn.com"
			next();
		}

	}
}
