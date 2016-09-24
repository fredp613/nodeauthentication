
export default function(app) {
	app.get('/authentication', (req, res)=> {
		res.status(200).json([
			"Netherlands", "Canada", "US", "Mexico", "test", "fred", "john"
		]);
	});
}

