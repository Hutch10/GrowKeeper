import { NextRequest, NextResponse } from 'next/server';
import { identifySpecimen } from '@/lib/services/specimen-identification';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // OpenAI expects the base64 string without the data:image prefix
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    const result = await identifySpecimen(base64Image);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Identification error:', error);
    const message = error instanceof Error ? error.message : 'Failed to identify specimen';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
