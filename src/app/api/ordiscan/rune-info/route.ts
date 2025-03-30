import { NextRequest, NextResponse } from 'next/server';
import { getOrdiscanClient } from '@/lib/serverUtils';
import { RuneInfo } from '@/types/ordiscan'; // Import from shared types

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'Rune name parameter is required' }, { status: 400 });
  }

  // Ensure name doesn't have spacers for the API call
  const formattedName = name.replace(/•/g, '');

  try {
    const ordiscan = getOrdiscanClient();
    const info: RuneInfo = await ordiscan.rune.getInfo({ name: formattedName });
    return NextResponse.json(info);

  } catch (error: unknown) {
    // Ordiscan might throw 404 as an error, check for that
    let status = 0;
    if (error && typeof error === 'object' && 'status' in error) {
        status = (error as { status: number }).status;
    }
    if (status === 404) {
        console.warn(`[API Route] Rune info not found for ${formattedName}.`);
        // Return null in the response body for 404, with a 404 status
        return NextResponse.json(null, { status: 404 }); 
    }
    console.error(`[API Route] Error fetching info for rune ${formattedName}:`, error);
    const message = (error instanceof Error) ? error.message : 'Failed to fetch Rune Info';
    return NextResponse.json({ error: 'Failed to fetch Rune Info', details: message }, { status: 500 });
  }
} 