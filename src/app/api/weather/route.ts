import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'Paris';

  try {
    const response = await fetch(`https://wttr.in/${city}?format=j1`, {
      next: { revalidate: 600 } // Cache for 10 minutes
    });

    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    const data = await response.json();
    
    // Extract relevant data for our widget
    const current = data.current_condition[0];
    const weather = data.weather[0];
    
    return NextResponse.json({
      city: city,
      temp: current.temp_C,
      condition: current.lang_fr ? current.lang_fr[0].value : current.weatherDesc[0].value,
      max: weather.maxtempC,
      min: weather.mintempC,
      // Map wttr.in codes to our icons if possible, or just use the desc
      desc: current.weatherDesc[0].value.toLowerCase(),
      forecast: data.weather.slice(1, 4).map((w: any) => ({
        max: w.maxtempC,
        min: w.mintempC,
        desc: w.hourly[4].weatherDesc[0].value.toLowerCase(), // midday
      }))
    });
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch weather' }, { status: 500 });
  }
}
