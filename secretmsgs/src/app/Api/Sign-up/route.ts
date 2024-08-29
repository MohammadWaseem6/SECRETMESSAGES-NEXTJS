import { sendVerificationEmail } from "@/helpers/sendVerificationEmails";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/Models/User";
import bcrypt from "bcrypt";

// Handles the POST request for user registration
export async function POST(request: Request) {
    // Establish a connection to the database
    await dbConnect();

    try {
        // Extract username, email, and password from the request body
        const { username, email, password } = await request.json();

        // Check if a user with the same username and verified status already exists
        const ExistingUserByUserName = await UserModel.findOne({
            username,
            isVerified: true,
        });

        // If a user with the same username exists, return an error response
        if (ExistingUserByUserName) {
            return Response.json({
                success: false,
                message: "User already exists"
            }, { status: 400 });
        }

        // Check if a user with the same email exists
        const ExistingUserByEmail = await UserModel.findOne({ email });

        // Generate a 6-digit verification code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        // If a user with the same email exists
        if (ExistingUserByEmail) {
            // If the user is already verified, return an error response
            if (ExistingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exists with this email"
                }, { status: 400 });
            } else {
                // If the user is not verified, update their password and verification code
                const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
                ExistingUserByEmail.password = hashedPassword;
                ExistingUserByEmail.verifyCode = verifyCode;
                ExistingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // Set verification code expiry to 1 hour from now
                await ExistingUserByEmail.save(); // Save the updated user document
            }
        } else {
            // If no user with the same email exists, create a new user document
            const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1); // Set verification code expiry to 1 hour from now

            const NewUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: [],
            });

            await NewUser.save(); // Save the new user document
        }

        // Send a verification email to the user
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        // If the email failed to send, return an error response
        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 });
        }

        // If everything is successful, return a success response
        return Response.json({
            success: true,
            message: "User Registered Successfully. Please verify your email."
        }, { status: 201 });

    } catch (error) {
        // Log the error and return a server error response
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
