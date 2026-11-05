// app/api/telegram/add-customer/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, phone, instagram, orderTotal, botToken, channelId } = await request.json();

    if (!name || !phone || !botToken || !channelId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Send customer details to your bot
    const botMessage = `🛒 *New Customer Order*\n\n👤 *Name:* ${name}\n📱 *Phone:* ${phone}\n📸 *Instagram:* ${instagram || 'N/A'}\n💰 *Order Total:* ₹${orderTotal}\n⏰ *Time:* ${new Date().toLocaleString()}`;
    
    const messageResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        text: botMessage,
        parse_mode: 'Markdown',
        disable_notification: true
      }),
    });
    console.log(messageResponse)
    if (!messageResponse.ok) {
      throw new Error('Failed to send Telegram message');
    }

    // Step 2: Create invite link for this specific customer
    const inviteResponse = await fetch(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        name: `${name}'s Exclusive Access`,
        expire_date: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        member_limit: 1,
        creates_join_request: false
      }),
    });

    const inviteData = await inviteResponse.json();
    
    return NextResponse.json({ 
      success: true, 
      inviteLink: inviteData.result?.invite_link || null
    });
    
  } catch (error: any) {
    console.error("Telegram bot error:", error);
    return NextResponse.json(
      { success: false, error: error.message || 'Bot service unavailable' },
      { status: 500 }
    );
  }
}

// Optional: Add CORS headers if needed
export const dynamic = 'force-dynamic';