import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

// GET /api/users — fetch all users
export async function GET() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/users — create a new user
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from('users')
    .insert({
      name: body.name,
      node_color: body.node_color,
      summer_city: body.summer_city,
      summer_lat: body.summer_lat,
      summer_lng: body.summer_lng,
      summer_activity: body.summer_activity || null,
      year1_city: body.year1_city,
      year1_lat: body.year1_lat,
      year1_lng: body.year1_lng,
      year1_activity: body.year1_activity || null,
      year2_city: body.year2_city,
      year2_lat: body.year2_lat,
      year2_lng: body.year2_lng,
      year2_activity: body.year2_activity || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
