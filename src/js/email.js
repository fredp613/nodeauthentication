
import nodemailer from 'nodemailer';

function sendEmail(recipient, subject, content) {

		const transporter = nodemailer.createTransport({
					service: 'Gmail',
					auth: {
						user: process.env.EMAIL,
						pass: process.env.EMAIL_PWD,
					}
				})

		const mailOptions = {
	 	 	from: process.env.EMAIL, // sender address
		  	to: recipient, // list of receivers
		  	subject: subject, // Subject line
		 	text: content //, // plaintext body
		  // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
		};

		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				console.log("error sending email", error);
				return error;          
				/**res.json({
				  success: false,
				  reponse: error,
				})**/
			} else {         
				console.log('no error', info.response);
				return info.response; 
				/**res.json({
				  success: true,
				  reponse: info.response,
				})**/
				
			};
		});

}
export { sendEmail }
