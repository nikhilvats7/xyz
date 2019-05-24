// "use strict";
// const nodemailer = require("nodemailer");

// // async..await is not allowed in global scope, must use a wrapper
// async function main() {

//     // Generate test SMTP service account from ethereal.email
//     // Only needed if you don't have a real mail account for testing
//     let testAccount = await nodemailer.createTestAccount();

//     // create reusable transporter object using the default SMTP transport
//     const transporter = nodemailer.createTransport({
//         host: 'smtp.ethereal.email',
//         port: 587,
//         auth: {
//             user: 'justice52@ethereal.email',
//             pass: '6JeQYb42KA7RRuur5J'
//         }
//     });

//     // send mail with defined transport object
//     let info = await transporter.sendMail({
//         from: 'justice52@ethereal.email', // sender address
//         to: "ernikhilvats@gmail.com", // list of receivers
//         subject: "Hello ✔", // Subject line
//         text: "Hello world?", // plain text body
//         html: "<b>Hello world?</b>" // html body
//     });

//     console.log("Message sent: %s", info.messageId);
//     // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

//     // Preview only available when sending through an Ethereal account
//     console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
//     // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
// }

// main().catch(console.error);



// for (let i = 0; i < 5; i++) {
//     console.log(i);
// }
// i = 19;
// console.log(i);
// var i;
const fs = require('fs');

const fileName = './target.txt';

// // fs.watch(fileName, () => console.log('file changed'));

// fs.watch(fileName, (err, data) => {
//     if (err) {
//         console.log(err);
//     }
//     // console.log(data)
// })


// fs.readFile(fileName, 'utf8', function (err, data) {
//     if (err)
//         console.log(err)
//     else
//         console.log(data)
// });