import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  try {
    // Fetch all user data
    const [plantsResult, careEventsResult, tasksResult] = await Promise.all([
      supabase.from('specimens').select('*').eq('user_id', user.id),
      supabase.from('specimen_events').select('*').eq('user_id', user.id),
      supabase.from('tasks').select('*').eq('user_id', user.id),
    ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        user: {
          id: user.id,
          email: user.email,
        },
        plants: plantsResult.data || [],
        careEvents: careEventsResult.data || [],
        tasks: tasksResult.data || [],
        statistics: {
          totalPlants: plantsResult.data?.length || 0,
          totalCareEvents: careEventsResult.data?.length || 0,
          totalTasks: tasksResult.data?.length || 0,
          completedTasks: tasksResult.data?.filter((t) => (t as { completed: boolean }).completed).length || 0,
        },
      };
  
      if (format === 'csv') {
        // Generate CSV for plants
        const plantsCsv = generateCSV(exportData.plants, [
          'id', 'nickname', 'species_name', 'location', 'notes', 'created_at'
        ]);

      return new NextResponse(plantsCsv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="growkeeper-plants-${Date.now()}.csv"`,
        },
      });
    }

    // Default: JSON export
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="growkeeper-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

function generateCSV(data: Record<string, unknown>[], columns: string[]): string {
  if (!data || data.length === 0) {
    return columns.join(',') + '\n';
  }

  const header = columns.join(',');
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col];
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // Escape quotes and wrap in quotes if contains comma or newline
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );

  return [header, ...rows].join('\n');
}
