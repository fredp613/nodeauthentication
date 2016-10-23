export default function home_controller(router, mongoose) {


	router.get('/about', (req, res) => {
		res.render('about', {title: "about page"});
	});
	
	router.get('/', (req, res) => {
		res.render('public', {title: "public react app page"});
	});


	router.get('/home', (req, res) => {
		res.render('home', {title: "Authenticated Home Page"});
	});

}
