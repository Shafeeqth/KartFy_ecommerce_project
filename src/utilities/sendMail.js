const nodemailer = require('nodemailer');
const OTP = require('../models/otp.model');

const sendMail = async (email, subject, html) => {

    const Transport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: 'shafeeqsha06@gmail.com',
            pass: process.env.GMAIL_PASSWORD
        }
    });


    const mailOptions = {
        from: 'CartFy',
        to: email,
        subject,
        html,

    }
    try {

        const mailSent = await Transport.sendMail(mailOptions);

    } catch (error) {
        console.log(error);

        throw Error("Something went wrong while dispatching mail");

    }


}

module.exports = sendMail;