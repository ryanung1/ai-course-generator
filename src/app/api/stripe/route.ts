import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

const settingsUrl = process.env.NEXTAUTH_URL + '/settings'
// const settingsUrl = process.env.NEXTAUTH_URL + '/settings'


export async function GET() {
    try {
        const session = await getAuthSession()
        if(!session?.user) {
            return new NextResponse('unauthorised', { status: 401 });
        }

        const userSubscription = await prisma.userSubscription.findUnique({
            where: {
                userId: session.user.id
            }
        })

 // cancle at the billing portal

        if(userSubscription && userSubscription.stripeCustomerId) {
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: userSubscription.stripeCustomerId,
                return_url: settingsUrl
            })
            return NextResponse.json({ url: stripeSession.url })
        }
// users first time subscirbing
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: settingsUrl,
            cancel_url: settingsUrl,
            payment_method_types: ['card'],
            mode: 'subscription',
            billing_address_collection: 'auto',
            customer_email: session.user.email ?? '',
            line_items: [
                {
                    price_data: {
                        currency: "USD",
                        product_data: {
                            name: "AI Course Generator Pro",
                            description: " Unlimited Course Generation",
                        },
                        unit_amount: 2000,
                        recurring: {
                            interval: 'month'
                        } 
                    },

                    quantity: 1
                }
            ],
            metadata: {
                userId: session.user.id
                //important for the webhook that is sent from stripe back to our API so we know who paid so we can update their account
            }
        })
        return NextResponse.json({ url: stripeSession.url})
    } catch (error) {
        console.log("[STRIPE ERROR]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}