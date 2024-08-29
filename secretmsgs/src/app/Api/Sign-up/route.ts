import { sendVerificationEmail } from "@/helpers/sendVerificationEmails";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Models/User";
import bcrypt from "bcrypt";


export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, email, password } = await request.json();
        const ExistingUserByUserName = await
            UserModel.findOne
                ({
                    username,
                    isVerified: true,
                })
        if (ExistingUserByUserName) {
            return Response.json({
                success: false,
                message: "User already exists"
            }, { status: 400 })
        }
        const ExistingUserByEmail = await UserModel.findOne({ email });

        // generate verifyCode
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        if (ExistingUserByEmail) {
            if (ExistingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exists with this email"
                }), { status: 400 }
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                ExistingUserByEmail.password = hashedPassword
                ExistingUserByEmail.verifyCode = verifyCode
                ExistingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await ExistingUserByEmail.save()
            }

        } else {


            const hashedPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)
            //new user
            const NewUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: [],
            })
            await NewUser.save()

        }
        //send verification Email

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode,
        )

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 })
        }


        return Response.json({
            success: true,
            message: "User Registered Successfully Please verify your email"
        }, { status: 201 })


    } catch (error) {
        console.error("POST request failed", error);
        return new Response(
            JSON.stringify({
                success: false,
                message: "Invalid request payload"
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}
