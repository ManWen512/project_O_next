import { NextRequest, NextResponse } from 'next/server';
import AiContentModel from "@/models/AiContentModel";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    
    // Get all prompts and outputs for this chat
    const contents = await AiContentModel.find({ chatId: id })
      .select("prompt output createdAt")
      .sort({ createdAt: 1 }) // Sort by creation time
      .lean();
    
    // Transform into chat messages format for useChat
    const messages = contents.flatMap((content, index) => {
      const baseIndex = index * 2;
      
      return [
        {
          id: `user-${baseIndex}`,
          role: 'user',
          content: content.prompt || '',
          parts: [
            {
              type: 'text',
              content: content.prompt || ''
            }
          ]
        },
        {
          id: `assistant-${baseIndex + 1}`,
          role: 'assistant',
          content: content.output || '',
          parts: content.output 
            ? [{ type: 'text', content: content.output }]
            : [] // Empty parts for tool-only responses
        }
      ];
    });
    
    return NextResponse.json({
      success: true,
      messages
    });
    
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}