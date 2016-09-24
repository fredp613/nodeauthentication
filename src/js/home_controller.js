export default function home_controller(router, mongoose) {

	router.get('/authentication/home', (req, res) => {
		res.render('home', {title: "Authenticated Home Page"});
	});

}
